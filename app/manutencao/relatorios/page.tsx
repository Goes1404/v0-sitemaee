"use client"

import { useMemo, useRef, useState } from "react"
import { Database, Download, RotateCcw, Upload } from "lucide-react"
import {
  Botao,
  CabecalhoCartao,
  Cartao,
  Entrada,
  IndicadorCartao,
  Modal,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import { BarrasEmpilhadas, BarrasHorizontais } from "@/components/manutencao/graficos"
import { useManutencao } from "@/lib/manutencao/store"
import {
  calcularIndicadores,
  custoTotal,
  osPorMes,
} from "@/lib/manutencao/metrics"
import {
  formatarMoeda,
  formatarNumero,
  hoje,
  iso,
  rotuloTipoOS,
} from "@/lib/manutencao/format"
import { baixarArquivo, paraCSV } from "@/lib/manutencao/csv"

const PERIODOS = [
  { valor: 30, rotulo: "Últimos 30 dias" },
  { valor: 90, rotulo: "Últimos 90 dias" },
  { valor: 180, rotulo: "Últimos 180 dias" },
  { valor: 365, rotulo: "Últimos 12 meses" },
]

export default function PaginaRelatorios() {
  const { db, restaurarPadrao, exportar, importar } = useManutencao()
  const [janela, setJanela] = useState(180)
  const [setor, setSetor] = useState("todos")
  const [confirmarReset, setConfirmarReset] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const inputArquivo = useRef<HTMLInputElement>(null)

  const setores = useMemo(
    () => Array.from(new Set(db.equipamentos.map((e) => e.setor))).sort(),
    [db.equipamentos],
  )

  const equipamentosFiltrados = useMemo(
    () =>
      setor === "todos"
        ? db.equipamentos
        : db.equipamentos.filter((e) => e.setor === setor),
    [db.equipamentos, setor],
  )

  const baseFiltrada = useMemo(() => {
    const ids = new Set(equipamentosFiltrados.map((e) => e.id))
    return {
      ...db,
      equipamentos: equipamentosFiltrados,
      ordens: db.ordens.filter((o) => ids.has(o.equipamentoId)),
      planos: db.planos.filter((p) => ids.has(p.equipamentoId)),
    }
  }, [db, equipamentosFiltrados])

  const limite = iso(new Date(hoje().getTime() - janela * 86400000))
  const ordensPeriodo = useMemo(
    () => baseFiltrada.ordens.filter((o) => o.abertaEm >= limite),
    [baseFiltrada.ordens, limite],
  )

  const indicadores = useMemo(
    () => calcularIndicadores(baseFiltrada, janela),
    [baseFiltrada, janela],
  )

  const porEquipamento = useMemo(
    () =>
      equipamentosFiltrados
        .map((eq) => {
          const ordens = ordensPeriodo.filter((o) => o.equipamentoId === eq.id)
          const corretivas = ordens.filter((o) => o.tipo === "corretiva")
          const parada = ordens.reduce((s, o) => s + o.horasParada, 0)
          return {
            eq,
            total: ordens.length,
            corretivas: corretivas.length,
            preventivas: ordens.filter((o) => o.tipo === "preventiva").length,
            parada,
            mttr: corretivas.length
              ? corretivas.reduce((s, o) => s + o.horasParada, 0) / corretivas.length
              : 0,
            custo: ordens.reduce((s, o) => s + custoTotal(o), 0),
          }
        })
        .filter((linha) => linha.total > 0)
        .sort((a, b) => b.parada - a.parada),
    [equipamentosFiltrados, ordensPeriodo],
  )

  const causasRecorrentes = useMemo(() => {
    const mapa = new Map<string, number>()
    ordensPeriodo.forEach((o) => {
      if (!o.causaRaiz) return
      mapa.set(o.causaRaiz, (mapa.get(o.causaRaiz) ?? 0) + 1)
    })
    return Array.from(mapa.entries())
      .map(([causa, total]) => ({ causa, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [ordensPeriodo])

  const porTecnico = useMemo(() => {
    const mapa = new Map<string, { ordens: number; horas: number }>()
    ordensPeriodo.forEach((o) => {
      const chave = o.tecnico || "Não informado"
      const atual = mapa.get(chave) ?? { ordens: 0, horas: 0 }
      mapa.set(chave, {
        ordens: atual.ordens + 1,
        horas: atual.horas + o.horasMaoDeObra,
      })
    })
    return Array.from(mapa.entries()).sort((a, b) => b[1].ordens - a[1].ordens)
  }, [ordensPeriodo])

  const alarmesFrequentes = useMemo(() => {
    const mapa = new Map<string, number>()
    ordensPeriodo.forEach((o) => {
      if (!o.codigoAlarme) return
      mapa.set(o.codigoAlarme, (mapa.get(o.codigoAlarme) ?? 0) + 1)
    })
    return Array.from(mapa.entries())
      .map(([codigo, total]) => ({ codigo, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [ordensPeriodo])

  function exportarRelatorio() {
    const csv = paraCSV(porEquipamento, [
      { chave: "tag", titulo: "TAG", valor: (l) => l.eq.tag },
      { chave: "maquina", titulo: "Máquina", valor: (l) => l.eq.maquina },
      { chave: "setor", titulo: "Setor", valor: (l) => l.eq.setor },
      { chave: "total", titulo: "Total de OS" },
      { chave: "corretivas", titulo: "Corretivas" },
      { chave: "preventivas", titulo: "Preventivas" },
      { chave: "parada", titulo: "Horas de parada" },
      { chave: "mttr", titulo: "MTTR (h)", valor: (l) => l.mttr.toFixed(1) },
      { chave: "custo", titulo: "Custo (R$)" },
    ])
    baixarArquivo(`relatorio-manutencao-${janela}d.csv`, csv)
  }

  function exportarBackup() {
    baixarArquivo("backup-servomanut.json", exportar(), "application/json")
  }

  function importarArquivo(arquivo: File) {
    const leitor = new FileReader()
    leitor.onload = () => {
      const ok = importar(String(leitor.result))
      setMensagem(
        ok
          ? "Backup importado com sucesso."
          : "Arquivo inválido: não foi possível importar o backup.",
      )
    }
    leitor.readAsText(arquivo)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo="Relatórios e indicadores"
        descricao="Análise de desempenho da manutenção por período e setor."
        acoes={
          <>
            <Botao variante="secundario" onClick={exportarRelatorio}>
              <Download className="h-4 w-4" />
              Exportar relatório
            </Botao>
            <Botao variante="secundario" onClick={exportarBackup}>
              <Database className="h-4 w-4" />
              Backup (JSON)
            </Botao>
            <Botao variante="secundario" onClick={() => inputArquivo.current?.click()}>
              <Upload className="h-4 w-4" />
              Importar
            </Botao>
            <Botao variante="perigo" onClick={() => setConfirmarReset(true)}>
              <RotateCcw className="h-4 w-4" />
              Restaurar dados
            </Botao>
          </>
        }
      />

      <input
        ref={inputArquivo}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0]
          if (arquivo) importarArquivo(arquivo)
          e.target.value = ""
        }}
      />

      {mensagem ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {mensagem}
        </div>
      ) : null}

      <Cartao className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Selecao value={janela} onChange={(e) => setJanela(Number(e.target.value))}>
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </Selecao>
          <Selecao value={setor} onChange={(e) => setSetor(e.target.value)}>
            <option value="todos">Todos os setores</option>
            {setores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Selecao>
          <Entrada
            value={`Período a partir de ${new Date(limite + "T00:00:00").toLocaleDateString("pt-BR")}`}
            disabled
          />
        </div>
      </Cartao>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCartao
          titulo="OS no período"
          valor={ordensPeriodo.length}
          detalhe={`${indicadores.osConcluidas} concluída(s)`}
        />
        <IndicadorCartao
          titulo="MTBF"
          valor={indicadores.mtbfHoras.toLocaleString("pt-BR")}
          unidade="h"
          tom="emerald"
        />
        <IndicadorCartao
          titulo="MTTR"
          valor={formatarNumero(indicadores.mttrHoras)}
          unidade="h"
          tom="amber"
        />
        <IndicadorCartao
          titulo="Disponibilidade"
          valor={formatarNumero(indicadores.disponibilidade)}
          unidade="%"
          tom={indicadores.disponibilidade >= 98 ? "emerald" : "amber"}
        />
        <IndicadorCartao
          titulo="Horas de parada"
          valor={formatarNumero(indicadores.horasParadaTotal)}
          unidade="h"
        />
        <IndicadorCartao titulo="Custo total" valor={formatarMoeda(indicadores.custoTotal)} />
        <IndicadorCartao
          titulo="Cumprimento do preventivo"
          valor={indicadores.cumprimentoPreventiva}
          unidade="%"
          tom={indicadores.cumprimentoPreventiva >= 90 ? "emerald" : "amber"}
        />
        <IndicadorCartao
          titulo="Relação corretiva/preventiva"
          valor={`${ordensPeriodo.filter((o) => o.tipo === "corretiva").length} / ${ordensPeriodo.filter((o) => o.tipo === "preventiva").length}`}
          detalhe="Quanto menor a corretiva, melhor"
        />
      </div>

      <Cartao className="mt-6">
        <CabecalhoCartao
          titulo="Evolução mensal"
          descricao="Ordens abertas por mês, separadas por tipo de manutenção."
        />
        <div className="px-5 py-5">
          <BarrasEmpilhadas
            dados={osPorMes(baseFiltrada.ordens, Math.min(12, Math.ceil(janela / 30)))}
            series={[
              { chave: "corretiva", rotulo: "Corretiva", cor: "bg-red-500" },
              { chave: "preventiva", rotulo: "Preventiva", cor: "bg-emerald-500" },
              { chave: "outras", rotulo: "Outras", cor: "bg-violet-500" },
            ]}
          />
        </div>
      </Cartao>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Cartao>
          <CabecalhoCartao
            titulo="Causas raiz recorrentes"
            descricao="Base para ações de bloqueio definitivo."
          />
          <div className="px-5 py-5">
            {causasRecorrentes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhuma causa raiz registrada no período.
              </p>
            ) : (
              <BarrasHorizontais
                itens={causasRecorrentes.map((c) => ({
                  rotulo: c.causa,
                  valor: c.total,
                  cor: "bg-red-500",
                }))}
              />
            )}
          </div>
        </Cartao>

        <Cartao>
          <CabecalhoCartao
            titulo="Alarmes mais frequentes"
            descricao="Códigos registrados nas ordens do período."
          />
          <div className="px-5 py-5">
            {alarmesFrequentes.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum alarme registrado no período.</p>
            ) : (
              <BarrasHorizontais
                itens={alarmesFrequentes.map((a) => ({
                  rotulo: a.codigo,
                  valor: a.total,
                  cor: "bg-slate-700",
                }))}
              />
            )}
          </div>
        </Cartao>
      </div>

      <Cartao className="mt-6">
        <CabecalhoCartao
          titulo="Desempenho por equipamento"
          descricao="Ordenado pelas horas de parada acumuladas no período."
        />
        {porEquipamento.length === 0 ? (
          <Vazio mensagem="Nenhuma ordem de serviço no período selecionado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Equipamento</th>
                  <th className="px-5 py-3 font-medium">OS</th>
                  <th className="px-5 py-3 font-medium">Corretivas</th>
                  <th className="px-5 py-3 font-medium">Preventivas</th>
                  <th className="px-5 py-3 font-medium">Parada (h)</th>
                  <th className="px-5 py-3 font-medium">MTTR (h)</th>
                  <th className="px-5 py-3 font-medium">Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {porEquipamento.map((linha) => (
                  <tr key={linha.eq.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{linha.eq.tag}</p>
                      <p className="text-xs text-slate-500">
                        {linha.eq.maquina} · {linha.eq.setor}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{linha.total}</td>
                    <td className="px-5 py-3 text-slate-700">{linha.corretivas}</td>
                    <td className="px-5 py-3 text-slate-700">{linha.preventivas}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {formatarNumero(linha.parada)}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{formatarNumero(linha.mttr)}</td>
                    <td className="px-5 py-3 text-slate-700">{formatarMoeda(linha.custo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Cartao>
          <CabecalhoCartao titulo="Produtividade por técnico" />
          {porTecnico.length === 0 ? (
            <Vazio mensagem="Sem registros no período." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Técnico</th>
                  <th className="px-5 py-3 font-medium">OS atendidas</th>
                  <th className="px-5 py-3 font-medium">Horas aplicadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {porTecnico.map(([tecnico, dados]) => (
                  <tr key={tecnico}>
                    <td className="px-5 py-3 text-slate-700">{tecnico}</td>
                    <td className="px-5 py-3 text-slate-700">{dados.ordens}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {formatarNumero(dados.horas)} h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>

        <Cartao>
          <CabecalhoCartao titulo="Distribuição por tipo de manutenção" />
          <div className="px-5 py-5">
            <BarrasHorizontais
              itens={Object.entries(rotuloTipoOS).map(([tipo, rotulo]) => ({
                rotulo: rotulo.texto,
                valor: ordensPeriodo.filter((o) => o.tipo === tipo).length,
                cor:
                  tipo === "corretiva"
                    ? "bg-red-500"
                    : tipo === "preventiva"
                      ? "bg-emerald-500"
                      : "bg-slate-700",
              }))}
            />
          </div>
        </Cartao>
      </div>

      <Modal
        aberto={confirmarReset}
        titulo="Restaurar dados de demonstração"
        onFechar={() => setConfirmarReset(false)}
        largura="max-w-md"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setConfirmarReset(false)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              onClick={() => {
                restaurarPadrao()
                setConfirmarReset(false)
                setMensagem("Base restaurada para os dados de demonstração.")
              }}
            >
              Restaurar
            </Botao>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Todos os equipamentos, ordens, planos, peças e medições cadastrados serão
          substituídos pela base de demonstração. Faça um backup antes, se necessário.
        </p>
      </Modal>
    </div>
  )
}
