import type {
  Criticidade,
  PrioridadeOS,
  SeveridadeFalha,
  StatusEquipamento,
  StatusOS,
  TipoOS,
  CategoriaPeca,
} from "./types"

export const DIA_MS = 24 * 60 * 60 * 1000

export function hoje(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function iso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function diasAtras(dias: number): string {
  return iso(new Date(hoje().getTime() - dias * DIA_MS))
}

export function diasAFrente(dias: number): string {
  return iso(new Date(hoje().getTime() + dias * DIA_MS))
}

export function diffDias(a: string, b: string): number {
  return Math.round(
    (new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime()) /
      DIA_MS,
  )
}

export function formatarData(valor?: string): string {
  if (!valor) return "—"
  const d = new Date(valor.length > 10 ? valor : valor + "T00:00:00")
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("pt-BR")
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

type Rotulo = { texto: string; classe: string }

export const rotuloStatusEquipamento: Record<StatusEquipamento, Rotulo> = {
  operando: { texto: "Operando", classe: "bg-emerald-100 text-emerald-800 ring-emerald-600/20" },
  em_manutencao: { texto: "Em manutenção", classe: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  parado: { texto: "Parado", classe: "bg-red-100 text-red-800 ring-red-600/20" },
  reserva: { texto: "Reserva", classe: "bg-sky-100 text-sky-800 ring-sky-600/20" },
  sucateado: { texto: "Sucateado", classe: "bg-slate-200 text-slate-700 ring-slate-500/20" },
}

export const rotuloStatusOS: Record<StatusOS, Rotulo> = {
  aberta: { texto: "Aberta", classe: "bg-sky-100 text-sky-800 ring-sky-600/20" },
  planejada: { texto: "Planejada", classe: "bg-indigo-100 text-indigo-800 ring-indigo-600/20" },
  em_execucao: { texto: "Em execução", classe: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  aguardando_peca: { texto: "Aguardando peça", classe: "bg-orange-100 text-orange-800 ring-orange-600/20" },
  concluida: { texto: "Concluída", classe: "bg-emerald-100 text-emerald-800 ring-emerald-600/20" },
  cancelada: { texto: "Cancelada", classe: "bg-slate-200 text-slate-700 ring-slate-500/20" },
}

export const rotuloPrioridade: Record<PrioridadeOS, Rotulo> = {
  critica: { texto: "Crítica", classe: "bg-red-100 text-red-800 ring-red-600/20" },
  alta: { texto: "Alta", classe: "bg-orange-100 text-orange-800 ring-orange-600/20" },
  media: { texto: "Média", classe: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  baixa: { texto: "Baixa", classe: "bg-slate-200 text-slate-700 ring-slate-500/20" },
}

export const rotuloTipoOS: Record<TipoOS, Rotulo> = {
  preventiva: { texto: "Preventiva", classe: "bg-emerald-100 text-emerald-800 ring-emerald-600/20" },
  corretiva: { texto: "Corretiva", classe: "bg-red-100 text-red-800 ring-red-600/20" },
  preditiva: { texto: "Preditiva", classe: "bg-violet-100 text-violet-800 ring-violet-600/20" },
  calibracao: { texto: "Calibração", classe: "bg-sky-100 text-sky-800 ring-sky-600/20" },
  melhoria: { texto: "Melhoria", classe: "bg-indigo-100 text-indigo-800 ring-indigo-600/20" },
}

export const rotuloCriticidade: Record<Criticidade, Rotulo> = {
  alta: { texto: "Crítico", classe: "bg-red-100 text-red-800 ring-red-600/20" },
  media: { texto: "Importante", classe: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  baixa: { texto: "Auxiliar", classe: "bg-slate-200 text-slate-700 ring-slate-500/20" },
}

export const rotuloSeveridade: Record<SeveridadeFalha, Rotulo> = {
  critica: { texto: "Crítica", classe: "bg-red-100 text-red-800 ring-red-600/20" },
  alta: { texto: "Alta", classe: "bg-orange-100 text-orange-800 ring-orange-600/20" },
  media: { texto: "Média", classe: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  baixa: { texto: "Baixa", classe: "bg-slate-200 text-slate-700 ring-slate-500/20" },
}

export const rotuloCategoriaPeca: Record<CategoriaPeca, string> = {
  encoder: "Encoder",
  rolamento: "Rolamento",
  ventoinha: "Ventoinha",
  modulo_potencia: "Módulo de potência",
  placa_eletronica: "Placa eletrônica",
  cabo: "Cabo / conector",
  bateria: "Bateria de encoder",
  freio: "Freio",
  vedacao: "Vedação / retentor",
  outros: "Outros",
}

export const STATUS_OS_ABERTOS: StatusOS[] = [
  "aberta",
  "planejada",
  "em_execucao",
  "aguardando_peca",
]

export function novoId(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
