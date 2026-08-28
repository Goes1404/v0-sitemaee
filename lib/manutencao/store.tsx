"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type {
  BancoDados,
  Equipamento,
  Medicao,
  OrdemServico,
  Peca,
  PlanoManutencao,
} from "./types"
import { dadosIniciais } from "./seed"
import { iso, hoje, novoId } from "./format"

const CHAVE = "servomanut:db:v1"

function carregar(): BancoDados {
  if (typeof window === "undefined") return dadosIniciais()
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    if (!bruto) return dadosIniciais()
    const dados = JSON.parse(bruto) as Partial<BancoDados>
    const base = dadosIniciais()
    return {
      equipamentos: dados.equipamentos ?? base.equipamentos,
      ordens: dados.ordens ?? base.ordens,
      planos: dados.planos ?? base.planos,
      pecas: dados.pecas ?? base.pecas,
      // catálogo de falhas é conhecimento técnico: sempre mesclado com o padrão
      falhas: dados.falhas?.length ? dados.falhas : base.falhas,
      medicoes: dados.medicoes ?? base.medicoes,
    }
  } catch {
    return dadosIniciais()
  }
}

function proximoCodigoOS(ordens: OrdemServico[]): string {
  const ano = new Date().getFullYear()
  const doAno = ordens
    .map((o) => o.codigo)
    .filter((c) => c.startsWith(`OS-${ano}-`))
    .map((c) => Number(c.split("-")[2]))
    .filter((n) => !Number.isNaN(n))
  const proximo = (doAno.length ? Math.max(...doAno) : 0) + 1
  return `OS-${ano}-${String(proximo).padStart(4, "0")}`
}

interface ContextoManutencao {
  db: BancoDados
  pronto: boolean
  salvarEquipamento: (eq: Equipamento) => void
  removerEquipamento: (id: string) => void
  criarOrdem: (dados: Omit<OrdemServico, "id" | "codigo">) => OrdemServico
  atualizarOrdem: (os: OrdemServico) => void
  mudarStatusOrdem: (id: string, status: OrdemServico["status"]) => void
  removerOrdem: (id: string) => void
  salvarPlano: (plano: PlanoManutencao) => void
  removerPlano: (id: string) => void
  gerarOSDoPlano: (planoId: string) => OrdemServico | null
  salvarPeca: (peca: Peca) => void
  removerPeca: (id: string) => void
  movimentarEstoque: (id: string, delta: number) => void
  registrarMedicao: (medicao: Omit<Medicao, "id">) => void
  restaurarPadrao: () => void
  importar: (json: string) => boolean
  exportar: () => string
  equipamentoPorId: (id: string) => Equipamento | undefined
}

const Contexto = createContext<ContextoManutencao | null>(null)

export function ProvedorManutencao({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<BancoDados>(() => dadosIniciais())
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    setDb(carregar())
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto) return
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(db))
    } catch {
      /* armazenamento indisponível: segue apenas em memória */
    }
  }, [db, pronto])

  const salvarEquipamento = useCallback((eq: Equipamento) => {
    setDb((atual) => {
      const existe = atual.equipamentos.some((e) => e.id === eq.id)
      return {
        ...atual,
        equipamentos: existe
          ? atual.equipamentos.map((e) => (e.id === eq.id ? eq : e))
          : [...atual.equipamentos, eq],
      }
    })
  }, [])

  const removerEquipamento = useCallback((id: string) => {
    setDb((atual) => ({
      ...atual,
      equipamentos: atual.equipamentos.filter((e) => e.id !== id),
      ordens: atual.ordens.filter((o) => o.equipamentoId !== id),
      planos: atual.planos.filter((p) => p.equipamentoId !== id),
      medicoes: atual.medicoes.filter((m) => m.equipamentoId !== id),
    }))
  }, [])

  const criarOrdem = useCallback((dados: Omit<OrdemServico, "id" | "codigo">) => {
    const nova: OrdemServico = {
      ...dados,
      id: novoId("os"),
      codigo: "",
    }
    setDb((atual) => {
      nova.codigo = proximoCodigoOS(atual.ordens)
      return { ...atual, ordens: [nova, ...atual.ordens] }
    })
    return nova
  }, [])

  /** Regras de negócio ao concluir uma OS: baixa de estoque, plano e equipamento. */
  const aplicarConclusao = useCallback(
    (atual: BancoDados, os: OrdemServico): BancoDados => {
      const dataConclusao = os.concluidaEm ?? iso(hoje())
      const pecas = atual.pecas.map((p) => {
        const usada = os.pecas.find((u) => u.pecaId === p.id)
        return usada ? { ...p, estoque: Math.max(0, p.estoque - usada.quantidade) } : p
      })
      const equipamentos = atual.equipamentos.map((e) =>
        e.id === os.equipamentoId && e.status === "em_manutencao"
          ? { ...e, status: "operando" as const }
          : e,
      )
      const planos = os.planoId
        ? atual.planos.map((p) =>
            p.id === os.planoId
              ? {
                  ...p,
                  ultimaExecucao: dataConclusao,
                  horasNaUltimaExecucao:
                    atual.equipamentos.find((e) => e.id === os.equipamentoId)
                      ?.horasOperacao ?? p.horasNaUltimaExecucao,
                }
              : p,
          )
        : atual.planos
      return { ...atual, pecas, equipamentos, planos }
    },
    [],
  )

  const atualizarOrdem = useCallback(
    (os: OrdemServico) => {
      setDb((atual) => {
        const anterior = atual.ordens.find((o) => o.id === os.id)
        let proximo: BancoDados = {
          ...atual,
          ordens: atual.ordens.map((o) => (o.id === os.id ? os : o)),
        }
        if (os.status === "concluida" && anterior?.status !== "concluida") {
          proximo = aplicarConclusao(proximo, os)
        }
        if (os.status === "em_execucao" && anterior?.status !== "em_execucao") {
          proximo = {
            ...proximo,
            equipamentos: proximo.equipamentos.map((e) =>
              e.id === os.equipamentoId && e.status === "operando"
                ? { ...e, status: "em_manutencao" as const }
                : e,
            ),
          }
        }
        return proximo
      })
    },
    [aplicarConclusao],
  )

  const mudarStatusOrdem = useCallback(
    (id: string, status: OrdemServico["status"]) => {
      setDb((atual) => {
        const alvo = atual.ordens.find((o) => o.id === id)
        if (!alvo) return atual
        const atualizada: OrdemServico = {
          ...alvo,
          status,
          iniciadaEm:
            status === "em_execucao" && !alvo.iniciadaEm ? iso(hoje()) : alvo.iniciadaEm,
          concluidaEm: status === "concluida" ? iso(hoje()) : alvo.concluidaEm,
        }
        let proximo: BancoDados = {
          ...atual,
          ordens: atual.ordens.map((o) => (o.id === id ? atualizada : o)),
        }
        if (status === "concluida" && alvo.status !== "concluida") {
          proximo = aplicarConclusao(proximo, atualizada)
        }
        if (status === "em_execucao" && alvo.status !== "em_execucao") {
          proximo = {
            ...proximo,
            equipamentos: proximo.equipamentos.map((e) =>
              e.id === atualizada.equipamentoId && e.status === "operando"
                ? { ...e, status: "em_manutencao" as const }
                : e,
            ),
          }
        }
        return proximo
      })
    },
    [aplicarConclusao],
  )

  const removerOrdem = useCallback((id: string) => {
    setDb((atual) => ({ ...atual, ordens: atual.ordens.filter((o) => o.id !== id) }))
  }, [])

  const salvarPlano = useCallback((plano: PlanoManutencao) => {
    setDb((atual) => {
      const existe = atual.planos.some((p) => p.id === plano.id)
      return {
        ...atual,
        planos: existe
          ? atual.planos.map((p) => (p.id === plano.id ? plano : p))
          : [...atual.planos, plano],
      }
    })
  }, [])

  const removerPlano = useCallback((id: string) => {
    setDb((atual) => ({ ...atual, planos: atual.planos.filter((p) => p.id !== id) }))
  }, [])

  const gerarOSDoPlano = useCallback(
    (planoId: string) => {
      const plano = db.planos.find((p) => p.id === planoId)
      if (!plano) return null
      return criarOrdem({
        equipamentoId: plano.equipamentoId,
        tipo: plano.tipo === "calibracao" ? "calibracao" : plano.tipo,
        status: "planejada",
        prioridade: "media",
        titulo: plano.nome,
        sintoma: `Ordem gerada automaticamente pelo plano "${plano.nome}".`,
        tecnico: plano.responsavel,
        abertaEm: iso(hoje()),
        programadaPara: iso(hoje()),
        horasParada: 0,
        horasMaoDeObra: 0,
        custoPecas: 0,
        custoServicoExterno: 0,
        pecas: [],
        planoId: plano.id,
      })
    },
    [criarOrdem, db.planos],
  )

  const salvarPeca = useCallback((peca: Peca) => {
    setDb((atual) => {
      const existe = atual.pecas.some((p) => p.id === peca.id)
      return {
        ...atual,
        pecas: existe
          ? atual.pecas.map((p) => (p.id === peca.id ? peca : p))
          : [...atual.pecas, peca],
      }
    })
  }, [])

  const removerPeca = useCallback((id: string) => {
    setDb((atual) => ({ ...atual, pecas: atual.pecas.filter((p) => p.id !== id) }))
  }, [])

  const movimentarEstoque = useCallback((id: string, delta: number) => {
    setDb((atual) => ({
      ...atual,
      pecas: atual.pecas.map((p) =>
        p.id === id ? { ...p, estoque: Math.max(0, p.estoque + delta) } : p,
      ),
    }))
  }, [])

  const registrarMedicao = useCallback((medicao: Omit<Medicao, "id">) => {
    setDb((atual) => ({
      ...atual,
      medicoes: [...atual.medicoes, { ...medicao, id: novoId("md") }],
    }))
  }, [])

  const restaurarPadrao = useCallback(() => setDb(dadosIniciais()), [])

  const exportar = useCallback(() => JSON.stringify(db, null, 2), [db])

  const importar = useCallback((json: string) => {
    try {
      const dados = JSON.parse(json) as BancoDados
      if (!Array.isArray(dados.equipamentos) || !Array.isArray(dados.ordens)) return false
      const base = dadosIniciais()
      setDb({
        equipamentos: dados.equipamentos,
        ordens: dados.ordens,
        planos: dados.planos ?? [],
        pecas: dados.pecas ?? [],
        falhas: dados.falhas?.length ? dados.falhas : base.falhas,
        medicoes: dados.medicoes ?? [],
      })
      return true
    } catch {
      return false
    }
  }, [])

  const equipamentoPorId = useCallback(
    (id: string) => db.equipamentos.find((e) => e.id === id),
    [db.equipamentos],
  )

  const valor = useMemo<ContextoManutencao>(
    () => ({
      db,
      pronto,
      salvarEquipamento,
      removerEquipamento,
      criarOrdem,
      atualizarOrdem,
      mudarStatusOrdem,
      removerOrdem,
      salvarPlano,
      removerPlano,
      gerarOSDoPlano,
      salvarPeca,
      removerPeca,
      movimentarEstoque,
      registrarMedicao,
      restaurarPadrao,
      importar,
      exportar,
      equipamentoPorId,
    }),
    [
      db,
      pronto,
      salvarEquipamento,
      removerEquipamento,
      criarOrdem,
      atualizarOrdem,
      mudarStatusOrdem,
      removerOrdem,
      salvarPlano,
      removerPlano,
      gerarOSDoPlano,
      salvarPeca,
      removerPeca,
      movimentarEstoque,
      registrarMedicao,
      restaurarPadrao,
      importar,
      exportar,
      equipamentoPorId,
    ],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useManutencao(): ContextoManutencao {
  const ctx = useContext(Contexto)
  if (!ctx)
    throw new Error("useManutencao deve ser usado dentro de <ProvedorManutencao>")
  return ctx
}
