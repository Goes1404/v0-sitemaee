// Modelo de domínio do sistema de gestão de manutenção (CMMS)
// de servomotores e servodrives.

export type TipoEquipamento = "servomotor" | "servodrive"

export type StatusEquipamento =
  | "operando"
  | "em_manutencao"
  | "parado"
  | "reserva"
  | "sucateado"

export type Criticidade = "alta" | "media" | "baixa"

export interface Equipamento {
  id: string
  tag: string
  tipo: TipoEquipamento
  fabricante: string
  modelo: string
  numeroSerie: string
  setor: string
  maquina: string
  eixo: string
  status: StatusEquipamento
  criticidade: Criticidade
  instaladoEm: string // ISO date
  horasOperacao: number
  /** Dados de placa do servomotor */
  potenciaKw?: number
  torqueNominalNm?: number
  rotacaoNominalRpm?: number
  correnteNominalA?: number
  tipoEncoder?: string
  freio?: boolean
  grauProtecao?: string
  /** Dados de placa do servodrive */
  tensaoV?: number
  correnteSaidaA?: number
  firmware?: string
  modoControle?: string
  realimentacao?: string
  observacoes?: string
}

export type TipoOS =
  | "preventiva"
  | "corretiva"
  | "preditiva"
  | "calibracao"
  | "melhoria"

export type StatusOS =
  | "aberta"
  | "planejada"
  | "em_execucao"
  | "aguardando_peca"
  | "concluida"
  | "cancelada"

export type PrioridadeOS = "critica" | "alta" | "media" | "baixa"

export interface PecaAplicada {
  pecaId: string
  quantidade: number
}

export interface OrdemServico {
  id: string
  codigo: string
  equipamentoId: string
  tipo: TipoOS
  status: StatusOS
  prioridade: PrioridadeOS
  titulo: string
  sintoma: string
  codigoAlarme?: string
  diagnostico?: string
  causaRaiz?: string
  acoesExecutadas?: string
  tecnico: string
  abertaEm: string
  programadaPara?: string
  iniciadaEm?: string
  concluidaEm?: string
  horasParada: number
  horasMaoDeObra: number
  custoPecas: number
  custoServicoExterno: number
  pecas: PecaAplicada[]
  planoId?: string
}

export type TipoPlano = "preventiva" | "preditiva" | "calibracao"

export interface PlanoManutencao {
  id: string
  nome: string
  equipamentoId: string
  tipo: TipoPlano
  /** Periodicidade em dias (calendário) */
  intervaloDias: number
  /** Periodicidade opcional em horas de operação */
  intervaloHoras?: number
  ultimaExecucao: string
  horasNaUltimaExecucao?: number
  duracaoEstimadaH: number
  responsavel: string
  checklist: string[]
  ativo: boolean
}

export type CategoriaPeca =
  | "encoder"
  | "rolamento"
  | "ventoinha"
  | "modulo_potencia"
  | "placa_eletronica"
  | "cabo"
  | "bateria"
  | "freio"
  | "vedacao"
  | "outros"

export interface Peca {
  id: string
  codigo: string
  descricao: string
  categoria: CategoriaPeca
  fabricante: string
  aplicacao: string
  estoque: number
  estoqueMinimo: number
  custoUnitario: number
  localizacao: string
  fornecedor: string
}

export type SeveridadeFalha = "critica" | "alta" | "media" | "baixa"

export interface CodigoFalha {
  id: string
  codigo: string
  fabricante: string
  linha: string
  descricao: string
  severidade: SeveridadeFalha
  causasProvaveis: string[]
  acoesRecomendadas: string[]
}

export type TipoMedicao =
  | "temperatura"
  | "vibracao"
  | "corrente"
  | "resistencia_isolamento"

export interface Medicao {
  id: string
  equipamentoId: string
  tipo: TipoMedicao
  valor: number
  unidade: string
  limite: number
  data: string
  responsavel: string
}

export interface BancoDados {
  equipamentos: Equipamento[]
  ordens: OrdemServico[]
  planos: PlanoManutencao[]
  pecas: Peca[]
  falhas: CodigoFalha[]
  medicoes: Medicao[]
}
