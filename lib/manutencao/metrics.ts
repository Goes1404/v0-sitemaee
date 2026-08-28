import type {
  BancoDados,
  Equipamento,
  Medicao,
  OrdemServico,
  PlanoManutencao,
  Peca,
} from "./types"
import { diffDias, iso, hoje, STATUS_OS_ABERTOS } from "./format"

export function ordensAbertas(ordens: OrdemServico[]): OrdemServico[] {
  return ordens.filter((o) => STATUS_OS_ABERTOS.includes(o.status))
}

export function custoTotal(os: OrdemServico): number {
  return os.custoPecas + os.custoServicoExterno
}

/** Data prevista da próxima execução de um plano (calendário x horas). */
export function proximaExecucao(plano: PlanoManutencao): string {
  const base = new Date(plano.ultimaExecucao + "T00:00:00")
  base.setDate(base.getDate() + plano.intervaloDias)
  return iso(base)
}

export function diasParaVencer(plano: PlanoManutencao): number {
  return diffDias(proximaExecucao(plano), iso(hoje()))
}

export type SituacaoPlano = "vencido" | "proximo" | "em_dia" | "inativo"

export function situacaoPlano(plano: PlanoManutencao): SituacaoPlano {
  if (!plano.ativo) return "inativo"
  const dias = diasParaVencer(plano)
  if (dias < 0) return "vencido"
  if (dias <= 15) return "proximo"
  return "em_dia"
}

/** Percentual do intervalo em horas de operação já consumido. */
export function consumoHoras(
  plano: PlanoManutencao,
  equipamento?: Equipamento,
): number | null {
  if (!plano.intervaloHoras || !equipamento || plano.horasNaUltimaExecucao == null)
    return null
  const decorridas = equipamento.horasOperacao - plano.horasNaUltimaExecucao
  return Math.min(100, Math.round((decorridas / plano.intervaloHoras) * 100))
}

export interface Indicadores {
  totalEquipamentos: number
  servomotores: number
  servodrives: number
  emManutencao: number
  parados: number
  osAbertas: number
  osCriticas: number
  osAtrasadas: number
  osConcluidas: number
  mtbfHoras: number
  mttrHoras: number
  disponibilidade: number
  horasParadaTotal: number
  custoTotal: number
  cumprimentoPreventiva: number
  planosVencidos: number
  pecasAbaixoMinimo: number
  valorEstoque: number
}

/** Janela padrão de análise: 180 dias. */
export function calcularIndicadores(db: BancoDados, janelaDias = 180): Indicadores {
  const limite = iso(new Date(hoje().getTime() - janelaDias * 86400000))
  const noPeriodo = db.ordens.filter((o) => o.abertaEm >= limite)
  const concluidas = noPeriodo.filter((o) => o.status === "concluida")
  const corretivasConcluidas = concluidas.filter((o) => o.tipo === "corretiva")

  const horasParada = noPeriodo.reduce((s, o) => s + o.horasParada, 0)
  const equipamentosAtivos = db.equipamentos.filter(
    (e) => e.status !== "sucateado" && e.status !== "reserva",
  ).length
  // Horas calendário disponíveis no período (2 turnos, 22 dias/mês)
  const horasCalendario = equipamentosAtivos * janelaDias * (16 * (22 / 30))

  const falhas = corretivasConcluidas.length
  const mttr = falhas
    ? corretivasConcluidas.reduce((s, o) => s + o.horasParada, 0) / falhas
    : 0
  const mtbf = falhas ? (horasCalendario / equipamentosAtivos - horasParada) / falhas : 0

  const preventivasPlanejadas = noPeriodo.filter((o) => o.tipo === "preventiva").length
  const preventivasFeitas = concluidas.filter((o) => o.tipo === "preventiva").length

  const abertas = ordensAbertas(db.ordens)
  const hojeIso = iso(hoje())

  return {
    totalEquipamentos: db.equipamentos.length,
    servomotores: db.equipamentos.filter((e) => e.tipo === "servomotor").length,
    servodrives: db.equipamentos.filter((e) => e.tipo === "servodrive").length,
    emManutencao: db.equipamentos.filter((e) => e.status === "em_manutencao").length,
    parados: db.equipamentos.filter((e) => e.status === "parado").length,
    osAbertas: abertas.length,
    osCriticas: abertas.filter((o) => o.prioridade === "critica").length,
    osAtrasadas: abertas.filter(
      (o) => o.programadaPara && o.programadaPara < hojeIso,
    ).length,
    osConcluidas: concluidas.length,
    mtbfHoras: Math.max(0, Math.round(mtbf)),
    mttrHoras: Number(mttr.toFixed(1)),
    disponibilidade: horasCalendario
      ? Number((((horasCalendario - horasParada) / horasCalendario) * 100).toFixed(1))
      : 100,
    horasParadaTotal: Number(horasParada.toFixed(1)),
    custoTotal: noPeriodo.reduce((s, o) => s + custoTotal(o), 0),
    cumprimentoPreventiva: preventivasPlanejadas
      ? Math.round((preventivasFeitas / preventivasPlanejadas) * 100)
      : 100,
    planosVencidos: db.planos.filter((p) => situacaoPlano(p) === "vencido").length,
    pecasAbaixoMinimo: db.pecas.filter((p) => p.estoque < p.estoqueMinimo).length,
    valorEstoque: db.pecas.reduce((s, p) => s + p.estoque * p.custoUnitario, 0),
  }
}

export function osPorMes(ordens: OrdemServico[], meses = 6) {
  const buckets: { rotulo: string; chave: string; corretiva: number; preventiva: number; outras: number }[] = []
  const ref = hoje()
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    buckets.push({
      chave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      corretiva: 0,
      preventiva: 0,
      outras: 0,
    })
  }
  ordens.forEach((o) => {
    const chave = o.abertaEm.slice(0, 7)
    const bucket = buckets.find((b) => b.chave === chave)
    if (!bucket) return
    if (o.tipo === "corretiva") bucket.corretiva++
    else if (o.tipo === "preventiva") bucket.preventiva++
    else bucket.outras++
  })
  return buckets
}

export function topEquipamentosCriticos(db: BancoDados, limite = 5) {
  return db.equipamentos
    .map((eq) => {
      const ordens = db.ordens.filter(
        (o) => o.equipamentoId === eq.id && o.tipo === "corretiva",
      )
      return {
        equipamento: eq,
        falhas: ordens.length,
        horasParada: ordens.reduce((s, o) => s + o.horasParada, 0),
        custo: ordens.reduce((s, o) => s + custoTotal(o), 0),
      }
    })
    .filter((linha) => linha.falhas > 0)
    .sort((a, b) => b.horasParada - a.horasParada)
    .slice(0, limite)
}

export function distribuicaoPorTipo(ordens: OrdemServico[]) {
  const mapa = new Map<string, number>()
  ordens.forEach((o) => mapa.set(o.tipo, (mapa.get(o.tipo) ?? 0) + 1))
  return Array.from(mapa.entries()).map(([tipo, total]) => ({ tipo, total }))
}

export function medicoesDoEquipamento(
  medicoes: Medicao[],
  equipamentoId: string,
): Medicao[] {
  return medicoes
    .filter((m) => m.equipamentoId === equipamentoId)
    .sort((a, b) => a.data.localeCompare(b.data))
}

export function pecasCriticas(pecas: Peca[]): Peca[] {
  return pecas
    .filter((p) => p.estoque < p.estoqueMinimo)
    .sort((a, b) => a.estoque - b.estoque)
}
