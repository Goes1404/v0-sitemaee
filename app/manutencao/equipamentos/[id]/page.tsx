"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ArrowLeft, LineChart, Plus } from "lucide-react"
import {
  Botao,
  CabecalhoCartao,
  Campo,
  Cartao,
  Entrada,
  Etiqueta,
  IndicadorCartao,
  LinhaInfo,
  Modal,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import { Tendencia } from "@/components/manutencao/graficos"
import { useManutencao } from "@/lib/manutencao/store"
import type { Medicao, TipoMedicao } from "@/lib/manutencao/types"
import {
  formatarData,
  formatarMoeda,
  formatarNumero,
  iso,
  hoje,
  rotuloCriticidade,
  rotuloStatusEquipamento,
  rotuloStatusOS,
  rotuloTipoOS,
} from "@/lib/manutencao/format"
import {
  consumoHoras,
  custoTotal,
  diasParaVencer,
  medicoesDoEquipamento,
  proximaExecucao,
} from "@/lib/manutencao/metrics"

const UNIDADES: Record<TipoMedicao, { unidade: string; limite: number; rotulo: string }> = {
  temperatura: { unidade: "°C", limite: 80, rotulo: "Temperatura de carcaça" },
  vibracao: { unidade: "mm/s", limite: 4.5, rotulo: "Vibração global (RMS)" },
  corrente: { unidade: "A", limite: 10, rotulo: "Corrente eficaz" },
  resistencia_isolamento: { unidade: "MΩ", limite: 500, rotulo: "Resistência de isolamento" },
}

export default function PaginaEquipamento() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { db, registrarMedicao } = useManutencao()
  const [novaMedicao, setNovaMedicao] = useState(false)

  const equipamento = db.equipamentos.find((e) => e.id === params.id)

  const ordens = useMemo(
    () =>
      db.ordens
        .filter((o) => o.equipamentoId === params.id)
        .sort((a, b) => b.abertaEm.localeCompare(a.abertaEm)),
    [db.ordens, params.id],
  )
  const planos = useMemo(
    () => db.planos.filter((p) => p.equipamentoId === params.id),
    [db.planos, params.id],
  )
  const medicoes = useMemo(
    () => medicoesDoEquipamento(db.medicoes, params.id),
    [db.medicoes, params.id],
  )

  const porTipoMedicao = useMemo(() => {
    const mapa = new Map<TipoMedicao, Medicao[]>()
    medicoes.forEach((m) => {
      mapa.set(m.tipo, [...(mapa.get(m.tipo) ?? []), m])
    })
    return Array.from(mapa.entries())
  }, [medicoes])

  if (!equipamento) {
    return (
      <div className="mx-auto max-w-3xl">
        <Cartao className="p-8 text-center">
          <p className="text-sm text-slate-600">Equipamento não encontrado.</p>
          <Botao className="mt-4" onClick={() => router.push("/manutencao/equipamentos")}>
            Voltar para a lista
          </Botao>
        </Cartao>
      </div>
    )
  }

  const corretivas = ordens.filter((o) => o.tipo === "corretiva")
  const horasParada = ordens.reduce((s, o) => s + o.horasParada, 0)
  const custo = ordens.reduce((s, o) => s + custoTotal(o), 0)
  const mttr = corretivas.length
    ? corretivas.reduce((s, o) => s + o.horasParada, 0) / corretivas.length
    : 0

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/manutencao/equipamentos"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Equipamentos
      </Link>

      <TituloPagina
        titulo={equipamento.tag}
        descricao={`${equipamento.fabricante} ${equipamento.modelo} · ${equipamento.maquina} (${equipamento.setor})`}
        acoes={
          <>
            <Etiqueta {...rotuloStatusEquipamento[equipamento.status]} />
            <Etiqueta {...rotuloCriticidade[equipamento.criticidade]} />
            <Link
              href={`/manutencao/ordens?nova=1&equipamento=${equipamento.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              Nova OS
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCartao
          titulo="Horas de operação"
          valor={equipamento.horasOperacao.toLocaleString("pt-BR")}
          unidade="h"
          detalhe={`Instalado em ${formatarData(equipamento.instaladoEm)}`}
        />
        <IndicadorCartao
          titulo="Intervenções"
          valor={ordens.length}
          detalhe={`${corretivas.length} corretiva(s)`}
          tom="sky"
        />
        <IndicadorCartao
          titulo="Horas de parada"
          valor={formatarNumero(horasParada)}
          unidade="h"
          detalhe={`MTTR ${formatarNumero(mttr)} h`}
          tom="amber"
        />
        <IndicadorCartao
          titulo="Custo acumulado"
          valor={formatarMoeda(custo)}
          detalhe="Peças e serviços externos"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Cartao className="lg:col-span-1">
          <CabecalhoCartao titulo="Ficha técnica" />
          <div className="px-5 py-2">
            <LinhaInfo rotulo="Tipo" valor={<span className="capitalize">{equipamento.tipo}</span>} />
            <LinhaInfo rotulo="Fabricante" valor={equipamento.fabricante} />
            <LinhaInfo rotulo="Modelo" valor={equipamento.modelo} />
            <LinhaInfo rotulo="Número de série" valor={equipamento.numeroSerie || "—"} />
            <LinhaInfo rotulo="Setor" valor={equipamento.setor} />
            <LinhaInfo rotulo="Máquina" valor={equipamento.maquina} />
            <LinhaInfo rotulo="Eixo / função" valor={equipamento.eixo || "—"} />
            {equipamento.tipo === "servomotor" ? (
              <>
                <LinhaInfo rotulo="Potência" valor={equipamento.potenciaKw != null ? `${formatarNumero(equipamento.potenciaKw)} kW` : "—"} />
                <LinhaInfo
                  rotulo="Torque nominal"
                  valor={
                    equipamento.torqueNominalNm != null
                      ? `${formatarNumero(equipamento.torqueNominalNm, 2)} N·m`
                      : "—"
                  }
                />
                <LinhaInfo
                  rotulo="Rotação nominal"
                  valor={`${equipamento.rotacaoNominalRpm?.toLocaleString("pt-BR") ?? "—"} rpm`}
                />
                <LinhaInfo
                  rotulo="Corrente nominal"
                  valor={
                    equipamento.correnteNominalA != null
                      ? `${formatarNumero(equipamento.correnteNominalA)} A`
                      : "—"
                  }
                />
                <LinhaInfo rotulo="Encoder" valor={equipamento.tipoEncoder ?? "—"} />
                <LinhaInfo rotulo="Freio" valor={equipamento.freio ? "Sim" : "Não"} />
                <LinhaInfo rotulo="Grau de proteção" valor={equipamento.grauProtecao ?? "—"} />
              </>
            ) : (
              <>
                <LinhaInfo rotulo="Tensão" valor={equipamento.tensaoV != null ? `${equipamento.tensaoV} V` : "—"} />
                <LinhaInfo
                  rotulo="Corrente de saída"
                  valor={
                    equipamento.correnteSaidaA != null
                      ? `${formatarNumero(equipamento.correnteSaidaA)} A`
                      : "—"
                  }
                />
                <LinhaInfo rotulo="Firmware" valor={equipamento.firmware ?? "—"} />
                <LinhaInfo rotulo="Modo de controle" valor={equipamento.modoControle ?? "—"} />
                <LinhaInfo rotulo="Realimentação" valor={equipamento.realimentacao ?? "—"} />
              </>
            )}
          </div>
          {equipamento.observacoes ? (
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Observações
              </p>
              <p className="mt-1 text-sm text-slate-700">{equipamento.observacoes}</p>
            </div>
          ) : null}
        </Cartao>

        <div className="space-y-6 lg:col-span-2">
          <Cartao>
            <CabecalhoCartao
              titulo="Monitoramento preditivo"
              descricao="Tendência das últimas leituras coletadas em rota."
              acao={
                <Botao variante="secundario" onClick={() => setNovaMedicao(true)}>
                  <LineChart className="h-4 w-4" />
                  Registrar leitura
                </Botao>
              }
            />
            {porTipoMedicao.length === 0 ? (
              <Vazio mensagem="Nenhuma leitura registrada para este equipamento." />
            ) : (
              <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
                {porTipoMedicao.map(([tipo, leituras]) => {
                  const ultima = leituras[leituras.length - 1]
                  const alerta = ultima.valor >= ultima.limite
                  return (
                    <div key={tipo}>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {UNIDADES[tipo].rotulo}
                        </p>
                        <p
                          className={`text-sm font-semibold ${alerta ? "text-red-600" : "text-slate-900"}`}
                        >
                          {formatarNumero(ultima.valor)} {ultima.unidade}
                        </p>
                      </div>
                      <p className="mb-2 text-xs text-slate-500">
                        Limite {formatarNumero(ultima.limite)} {ultima.unidade} · última leitura em{" "}
                        {formatarData(ultima.data)}
                      </p>
                      <Tendencia
                        valores={leituras.map((l) => l.valor)}
                        limite={ultima.limite}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </Cartao>

          <Cartao>
            <CabecalhoCartao
              titulo="Planos de manutenção"
              descricao="Rotinas programadas vinculadas a este equipamento."
            />
            {planos.length === 0 ? (
              <Vazio mensagem="Nenhum plano cadastrado." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {planos.map((plano) => {
                  const dias = diasParaVencer(plano)
                  const consumo = consumoHoras(plano, equipamento)
                  return (
                    <li key={plano.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{plano.nome}</p>
                        <span
                          className={`text-xs font-medium ${dias < 0 ? "text-red-600" : dias <= 15 ? "text-amber-600" : "text-slate-500"}`}
                        >
                          {dias < 0 ? `Vencido há ${Math.abs(dias)} d` : `Vence em ${dias} d`} ·{" "}
                          {formatarData(proximaExecucao(plano))}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        A cada {plano.intervaloDias} dias
                        {plano.intervaloHoras ? ` ou ${plano.intervaloHoras.toLocaleString("pt-BR")} h` : ""} ·
                        responsável {plano.responsavel}
                        {consumo != null ? ` · ${consumo}% do intervalo em horas consumido` : ""}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </Cartao>

          <Cartao>
            <CabecalhoCartao
              titulo="Histórico de manutenção"
              descricao="Todas as intervenções registradas no equipamento."
            />
            {ordens.length === 0 ? (
              <Vazio mensagem="Nenhuma ordem de serviço registrada." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {ordens.map((os) => (
                  <li key={os.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/manutencao/ordens?os=${os.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {os.codigo}
                      </Link>
                      <Etiqueta {...rotuloTipoOS[os.tipo]} />
                      <Etiqueta {...rotuloStatusOS[os.status]} />
                      {os.codigoAlarme ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                          {os.codigoAlarme}
                        </span>
                      ) : null}
                      <span className="ml-auto text-xs text-slate-500">
                        {formatarData(os.abertaEm)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{os.titulo}</p>
                    {os.causaRaiz ? (
                      <p className="mt-1 text-xs text-slate-500">
                        <strong>Causa raiz:</strong> {os.causaRaiz}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">
                      {formatarNumero(os.horasParada)} h de parada ·{" "}
                      {formatarNumero(os.horasMaoDeObra)} h de mão de obra ·{" "}
                      {formatarMoeda(custoTotal(os))} · técnico {os.tecnico}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </div>
      </div>

      {novaMedicao ? (
        <FormularioMedicao
          equipamentoId={equipamento.id}
          onFechar={() => setNovaMedicao(false)}
          onSalvar={(medicao) => {
            registrarMedicao(medicao)
            setNovaMedicao(false)
          }}
        />
      ) : null}
    </div>
  )
}

function FormularioMedicao({
  equipamentoId,
  onFechar,
  onSalvar,
}: {
  equipamentoId: string
  onFechar: () => void
  onSalvar: (medicao: Omit<Medicao, "id">) => void
}) {
  const [tipo, setTipo] = useState<TipoMedicao>("temperatura")
  const [valor, setValor] = useState("")
  const [limite, setLimite] = useState(String(UNIDADES.temperatura.limite))
  const [data, setData] = useState(iso(hoje()))
  const [responsavel, setResponsavel] = useState("")

  function trocarTipo(novo: TipoMedicao) {
    setTipo(novo)
    setLimite(String(UNIDADES[novo].limite))
  }

  return (
    <Modal
      aberto
      titulo="Registrar leitura preditiva"
      descricao="Coletas de termografia, vibração, corrente ou isolação."
      onFechar={onFechar}
      largura="max-w-lg"
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao
            disabled={!valor}
            onClick={() =>
              onSalvar({
                equipamentoId,
                tipo,
                valor: Number(valor),
                unidade: UNIDADES[tipo].unidade,
                limite: Number(limite),
                data,
                responsavel: responsavel || "Não informado",
              })
            }
          >
            Registrar
          </Botao>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Grandeza">
          <Selecao value={tipo} onChange={(e) => trocarTipo(e.target.value as TipoMedicao)}>
            {Object.entries(UNIDADES).map(([valorTipo, cfg]) => (
              <option key={valorTipo} value={valorTipo}>
                {cfg.rotulo}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo={`Valor medido (${UNIDADES[tipo].unidade})`}>
          <Entrada
            type="number"
            step="0.1"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </Campo>
        <Campo rotulo={`Limite de alarme (${UNIDADES[tipo].unidade})`}>
          <Entrada
            type="number"
            step="0.1"
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
          />
        </Campo>
        <Campo rotulo="Data da coleta">
          <Entrada type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </Campo>
        <Campo rotulo="Responsável" className="sm:col-span-2">
          <Entrada
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Técnico que realizou a coleta"
          />
        </Campo>
      </div>
    </Modal>
  )
}
