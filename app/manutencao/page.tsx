"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Cpu,
  Gauge,
  PackageMinus,
  Timer,
  Wrench,
} from "lucide-react"
import {
  Cartao,
  CabecalhoCartao,
  Etiqueta,
  IndicadorCartao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import {
  BarrasEmpilhadas,
  BarrasHorizontais,
  Rosca,
} from "@/components/manutencao/graficos"
import { useManutencao } from "@/lib/manutencao/store"
import {
  calcularIndicadores,
  distribuicaoPorTipo,
  diasParaVencer,
  ordensAbertas,
  osPorMes,
  pecasCriticas,
  proximaExecucao,
  situacaoPlano,
  topEquipamentosCriticos,
} from "@/lib/manutencao/metrics"
import {
  formatarData,
  formatarMoeda,
  formatarNumero,
  rotuloPrioridade,
  rotuloStatusOS,
  rotuloTipoOS,
} from "@/lib/manutencao/format"

const CORES_TIPO: Record<string, string> = {
  corretiva: "#dc2626",
  preventiva: "#059669",
  preditiva: "#7c3aed",
  calibracao: "#0284c7",
  melhoria: "#4f46e5",
}

export default function PainelManutencao() {
  const { db } = useManutencao()

  const indicadores = useMemo(() => calcularIndicadores(db), [db])
  const porMes = useMemo(() => osPorMes(db.ordens), [db.ordens])
  const distribuicao = useMemo(() => distribuicaoPorTipo(db.ordens), [db.ordens])
  const criticos = useMemo(() => topEquipamentosCriticos(db), [db])
  const abertas = useMemo(
    () =>
      ordensAbertas(db.ordens)
        .slice()
        .sort((a, b) => {
          const peso = { critica: 0, alta: 1, media: 2, baixa: 3 } as const
          return peso[a.prioridade] - peso[b.prioridade] || b.abertaEm.localeCompare(a.abertaEm)
        }),
    [db.ordens],
  )
  const semEstoque = useMemo(() => pecasCriticas(db.pecas), [db.pecas])
  const planosAlerta = useMemo(
    () =>
      db.planos
        .filter((p) => ["vencido", "proximo"].includes(situacaoPlano(p)))
        .sort((a, b) => diasParaVencer(a) - diasParaVencer(b)),
    [db.planos],
  )
  const medicoesForaDoLimite = useMemo(() => {
    const ultimasPorChave = new Map<string, (typeof db.medicoes)[number]>()
    db.medicoes.forEach((m) => {
      const chave = `${m.equipamentoId}:${m.tipo}`
      const atual = ultimasPorChave.get(chave)
      if (!atual || m.data > atual.data) ultimasPorChave.set(chave, m)
    })
    return Array.from(ultimasPorChave.values()).filter((m) => m.valor >= m.limite * 0.9)
  }, [db.medicoes])

  const nomeEquipamento = (id: string) =>
    db.equipamentos.find((e) => e.id === id)?.tag ?? "—"

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo="Painel de manutenção"
        descricao="Visão geral do parque de servomotores e servodrives — últimos 180 dias."
        acoes={
          <Link
            href="/manutencao/ordens?nova=1"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Wrench className="h-4 w-4" />
            Abrir ordem de serviço
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCartao
          titulo="Equipamentos cadastrados"
          valor={indicadores.totalEquipamentos}
          detalhe={`${indicadores.servomotores} servomotores · ${indicadores.servodrives} servodrives`}
          icone={<Cpu className="h-5 w-5" />}
          tom="sky"
        />
        <IndicadorCartao
          titulo="OS em aberto"
          valor={indicadores.osAbertas}
          detalhe={`${indicadores.osCriticas} críticas · ${indicadores.osAtrasadas} atrasadas`}
          icone={<Wrench className="h-5 w-5" />}
          tom={indicadores.osCriticas ? "red" : "slate"}
        />
        <IndicadorCartao
          titulo="Disponibilidade"
          valor={formatarNumero(indicadores.disponibilidade)}
          unidade="%"
          detalhe={`${formatarNumero(indicadores.horasParadaTotal)} h de parada no período`}
          icone={<Gauge className="h-5 w-5" />}
          tom={indicadores.disponibilidade >= 98 ? "emerald" : "amber"}
        />
        <IndicadorCartao
          titulo="Custo de manutenção"
          valor={formatarMoeda(indicadores.custoTotal)}
          detalhe="Peças + serviços externos"
          icone={<CircleDollarSign className="h-5 w-5" />}
        />
        <IndicadorCartao
          titulo="MTBF"
          valor={indicadores.mtbfHoras.toLocaleString("pt-BR")}
          unidade="h"
          detalhe="Tempo médio entre falhas"
          icone={<Activity className="h-5 w-5" />}
          tom="emerald"
        />
        <IndicadorCartao
          titulo="MTTR"
          valor={formatarNumero(indicadores.mttrHoras)}
          unidade="h"
          detalhe="Tempo médio de reparo"
          icone={<Timer className="h-5 w-5" />}
          tom="amber"
        />
        <IndicadorCartao
          titulo="Cumprimento do preventivo"
          valor={indicadores.cumprimentoPreventiva}
          unidade="%"
          detalhe={`${indicadores.planosVencidos} plano(s) vencido(s)`}
          icone={<CalendarClock className="h-5 w-5" />}
          tom={indicadores.cumprimentoPreventiva >= 90 ? "emerald" : "amber"}
        />
        <IndicadorCartao
          titulo="Peças abaixo do mínimo"
          valor={indicadores.pecasAbaixoMinimo}
          detalhe={`Estoque avaliado em ${formatarMoeda(indicadores.valorEstoque)}`}
          icone={<PackageMinus className="h-5 w-5" />}
          tom={indicadores.pecasAbaixoMinimo ? "red" : "emerald"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <CabecalhoCartao
            titulo="Ordens de serviço por mês"
            descricao="Distribuição entre manutenção corretiva, preventiva e demais tipos."
          />
          <div className="px-5 py-5">
            <BarrasEmpilhadas
              dados={porMes}
              series={[
                { chave: "corretiva", rotulo: "Corretiva", cor: "bg-red-500" },
                { chave: "preventiva", rotulo: "Preventiva", cor: "bg-emerald-500" },
                { chave: "outras", rotulo: "Preditiva / calibração / melhoria", cor: "bg-violet-500" },
              ]}
            />
          </div>
        </Cartao>

        <Cartao>
          <CabecalhoCartao titulo="Ordens por tipo" descricao="Histórico completo." />
          <div className="px-5 py-5">
            <Rosca
              fatias={distribuicao.map((d) => ({
                rotulo: rotuloTipoOS[d.tipo as keyof typeof rotuloTipoOS].texto,
                valor: d.total,
                cor: CORES_TIPO[d.tipo] ?? "#64748b",
              }))}
            />
          </div>
        </Cartao>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <CabecalhoCartao
            titulo="Ordens em aberto"
            descricao="Priorizadas por criticidade."
            acao={
              <Link
                href="/manutencao/ordens"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Ver todas
              </Link>
            }
          />
          {abertas.length === 0 ? (
            <Vazio mensagem="Nenhuma ordem de serviço em aberto." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">OS</th>
                    <th className="px-5 py-3 font-medium">Equipamento</th>
                    <th className="px-5 py-3 font-medium">Tipo</th>
                    <th className="px-5 py-3 font-medium">Prioridade</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Aberta em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {abertas.slice(0, 6).map((os) => (
                    <tr key={os.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/manutencao/ordens?os=${os.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {os.codigo}
                        </Link>
                        <p className="max-w-56 truncate text-xs text-slate-500">
                          {os.titulo}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {nomeEquipamento(os.equipamentoId)}
                      </td>
                      <td className="px-5 py-3">
                        <Etiqueta {...rotuloTipoOS[os.tipo]} />
                      </td>
                      <td className="px-5 py-3">
                        <Etiqueta {...rotuloPrioridade[os.prioridade]} />
                      </td>
                      <td className="px-5 py-3">
                        <Etiqueta {...rotuloStatusOS[os.status]} />
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatarData(os.abertaEm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Cartao>

        <Cartao>
          <CabecalhoCartao
            titulo="Alertas"
            descricao="Pendências que exigem ação imediata."
          />
          <div className="space-y-4 px-5 py-5">
            {planosAlerta.length === 0 &&
            semEstoque.length === 0 &&
            medicoesForaDoLimite.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum alerta ativo.</p>
            ) : null}

            {planosAlerta.slice(0, 4).map((plano) => {
              const dias = diasParaVencer(plano)
              return (
                <div
                  key={plano.id}
                  className="flex gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <CalendarClock
                    className={`h-5 w-5 shrink-0 ${dias < 0 ? "text-red-600" : "text-amber-500"}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {plano.nome}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dias < 0
                        ? `Vencido há ${Math.abs(dias)} dia(s)`
                        : `Vence em ${dias} dia(s)`}{" "}
                      · {formatarData(proximaExecucao(plano))}
                    </p>
                  </div>
                </div>
              )
            })}

            {semEstoque.slice(0, 3).map((peca) => (
              <div key={peca.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                <PackageMinus className="h-5 w-5 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {peca.codigo} — {peca.descricao}
                  </p>
                  <p className="text-xs text-slate-500">
                    Estoque {peca.estoque} · mínimo {peca.estoqueMinimo}
                  </p>
                </div>
              </div>
            ))}

            {medicoesForaDoLimite.slice(0, 3).map((m) => (
              <div key={m.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                <AlertTriangle
                  className={`h-5 w-5 shrink-0 ${m.valor >= m.limite ? "text-red-600" : "text-amber-500"}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {nomeEquipamento(m.equipamentoId)} — {m.tipo}
                  </p>
                  <p className="text-xs text-slate-500">
                    Última leitura {formatarNumero(m.valor)} {m.unidade} (limite{" "}
                    {formatarNumero(m.limite)} {m.unidade})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>

      <Cartao className="mt-6">
        <CabecalhoCartao
          titulo="Equipamentos com maior impacto"
          descricao="Ranking por horas de parada acumuladas em manutenção corretiva."
        />
        <div className="px-5 py-5">
          {criticos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma corretiva registrada.</p>
          ) : (
            <BarrasHorizontais
              itens={criticos.map((linha) => ({
                rotulo: `${linha.equipamento.tag} — ${linha.equipamento.maquina} (${linha.falhas} falha(s))`,
                valor: linha.horasParada,
                sufixo: " h",
                cor:
                  linha.equipamento.criticidade === "alta"
                    ? "bg-red-500"
                    : "bg-slate-700",
              }))}
            />
          )}
        </div>
      </Cartao>
    </div>
  )
}
