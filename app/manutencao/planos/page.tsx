"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CalendarClock, ClipboardList, Pencil, Plus, Trash2, Wrench } from "lucide-react"
import {
  Botao,
  CabecalhoCartao,
  Campo,
  Cartao,
  Entrada,
  Etiqueta,
  IndicadorCartao,
  Modal,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import { useManutencao } from "@/lib/manutencao/store"
import type { PlanoManutencao } from "@/lib/manutencao/types"
import { formatarData, hoje, iso, novoId } from "@/lib/manutencao/format"
import {
  consumoHoras,
  diasParaVencer,
  proximaExecucao,
  situacaoPlano,
} from "@/lib/manutencao/metrics"

const ROTULO_SITUACAO = {
  vencido: { texto: "Vencido", classe: "bg-red-100 text-red-800 ring-red-600/20" },
  proximo: { texto: "Vence em breve", classe: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  em_dia: { texto: "Em dia", classe: "bg-emerald-100 text-emerald-800 ring-emerald-600/20" },
  inativo: { texto: "Inativo", classe: "bg-slate-200 text-slate-700 ring-slate-500/20" },
} as const

function planoVazio(equipamentoId: string): PlanoManutencao {
  return {
    id: novoId("pl"),
    nome: "",
    equipamentoId,
    tipo: "preventiva",
    intervaloDias: 180,
    ultimaExecucao: iso(hoje()),
    duracaoEstimadaH: 2,
    responsavel: "",
    checklist: [],
    ativo: true,
  }
}

export default function PaginaPlanos() {
  const { db, salvarPlano, removerPlano, gerarOSDoPlano } = useManutencao()
  const [emEdicao, setEmEdicao] = useState<PlanoManutencao | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<PlanoManutencao | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const planos = useMemo(
    () => db.planos.slice().sort((a, b) => diasParaVencer(a) - diasParaVencer(b)),
    [db.planos],
  )

  const resumo = useMemo(() => {
    const situacoes = db.planos.map(situacaoPlano)
    return {
      total: db.planos.length,
      vencidos: situacoes.filter((s) => s === "vencido").length,
      proximos: situacoes.filter((s) => s === "proximo").length,
      horas: db.planos
        .filter((p) => p.ativo)
        .reduce((s, p) => s + p.duracaoEstimadaH, 0),
    }
  }, [db.planos])

  const equipamentoPor = (id: string) => db.equipamentos.find((e) => e.id === id)

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo="Planos de manutenção preventiva"
        descricao="Rotinas programadas por calendário e por horas de operação, com checklist de execução."
        acoes={
          <Botao onClick={() => setEmEdicao(planoVazio(db.equipamentos[0]?.id ?? ""))}>
            <Plus className="h-4 w-4" />
            Novo plano
          </Botao>
        }
      />

      {aviso ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {aviso}{" "}
          <Link href="/manutencao/ordens" className="font-medium underline">
            Ver ordens de serviço
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCartao titulo="Planos cadastrados" valor={resumo.total} icone={<ClipboardList className="h-5 w-5" />} />
        <IndicadorCartao
          titulo="Vencidos"
          valor={resumo.vencidos}
          tom={resumo.vencidos ? "red" : "emerald"}
          icone={<CalendarClock className="h-5 w-5" />}
        />
        <IndicadorCartao titulo="Vencem em até 15 dias" valor={resumo.proximos} tom="amber" />
        <IndicadorCartao
          titulo="Carga programada"
          valor={resumo.horas}
          unidade="h"
          detalhe="Somatório da duração estimada dos planos ativos"
        />
      </div>

      <Cartao className="mt-6">
        <CabecalhoCartao
          titulo="Programação"
          descricao="Ordenada pela proximidade do vencimento."
        />
        {planos.length === 0 ? (
          <Vazio mensagem="Nenhum plano cadastrado." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {planos.map((plano) => {
              const equipamento = equipamentoPor(plano.equipamentoId)
              const situacao = situacaoPlano(plano)
              const dias = diasParaVencer(plano)
              const consumo = consumoHoras(plano, equipamento)
              const aberto = expandido === plano.id
              return (
                <li key={plano.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{plano.nome}</p>
                        <Etiqueta {...ROTULO_SITUACAO[situacao]} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {equipamento ? (
                          <Link
                            href={`/manutencao/equipamentos/${equipamento.id}`}
                            className="hover:underline"
                          >
                            {equipamento.tag}
                          </Link>
                        ) : (
                          "Equipamento removido"
                        )}{" "}
                        · a cada {plano.intervaloDias} dias
                        {plano.intervaloHoras
                          ? ` ou ${plano.intervaloHoras.toLocaleString("pt-BR")} h`
                          : ""}{" "}
                        · {plano.duracaoEstimadaH} h estimadas · {plano.responsavel || "sem responsável"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Última execução {formatarData(plano.ultimaExecucao)} · próxima{" "}
                        {formatarData(proximaExecucao(plano))} (
                        {dias < 0 ? `${Math.abs(dias)} dia(s) em atraso` : `em ${dias} dia(s)`})
                        {consumo != null ? ` · ${consumo}% do intervalo em horas` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Botao
                        variante="secundario"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => setExpandido(aberto ? null : plano.id)}
                      >
                        {aberto ? "Ocultar checklist" : "Ver checklist"}
                      </Botao>
                      <Botao
                        variante="secundario"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => {
                          const os = gerarOSDoPlano(plano.id)
                          if (os) setAviso(`Ordem de serviço gerada para "${plano.nome}".`)
                        }}
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        Gerar OS
                      </Botao>
                      <Botao
                        variante="fantasma"
                        aria-label={`Editar ${plano.nome}`}
                        onClick={() => setEmEdicao(plano)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Botao>
                      <Botao
                        variante="fantasma"
                        aria-label={`Excluir ${plano.nome}`}
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setConfirmarExclusao(plano)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Botao>
                    </div>
                  </div>
                  {aberto ? (
                    <ol className="mt-3 space-y-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      {plano.checklist.length === 0 ? (
                        <li className="text-slate-500">Checklist não definido.</li>
                      ) : (
                        plano.checklist.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="font-mono text-xs text-slate-400">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {item}
                          </li>
                        ))
                      )}
                    </ol>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </Cartao>

      {emEdicao ? (
        <FormularioPlano
          plano={emEdicao}
          onFechar={() => setEmEdicao(null)}
          onSalvar={(plano) => {
            salvarPlano(plano)
            setEmEdicao(null)
          }}
        />
      ) : null}

      <Modal
        aberto={Boolean(confirmarExclusao)}
        titulo="Excluir plano"
        onFechar={() => setConfirmarExclusao(null)}
        largura="max-w-md"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setConfirmarExclusao(null)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              onClick={() => {
                if (confirmarExclusao) removerPlano(confirmarExclusao.id)
                setConfirmarExclusao(null)
              }}
            >
              Excluir
            </Botao>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Confirma a exclusão do plano{" "}
          <strong className="text-slate-900">{confirmarExclusao?.nome}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function FormularioPlano({
  plano,
  onFechar,
  onSalvar,
}: {
  plano: PlanoManutencao
  onFechar: () => void
  onSalvar: (plano: PlanoManutencao) => void
}) {
  const { db } = useManutencao()
  const [dados, setDados] = useState<PlanoManutencao>(plano)
  const [checklistTexto, setChecklistTexto] = useState(plano.checklist.join("\n"))

  const alterar = <K extends keyof PlanoManutencao>(
    campo: K,
    valor: PlanoManutencao[K],
  ) => setDados((atual) => ({ ...atual, [campo]: valor }))

  const valido = dados.nome.trim() && dados.equipamentoId && dados.intervaloDias > 0

  return (
    <Modal
      aberto
      titulo={plano.nome ? `Editar ${plano.nome}` : "Novo plano de manutenção"}
      descricao="Defina a periodicidade e o roteiro de execução."
      onFechar={onFechar}
      largura="max-w-2xl"
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao
            disabled={!valido}
            onClick={() =>
              onSalvar({
                ...dados,
                checklist: checklistTexto
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean),
              })
            }
          >
            Salvar
          </Botao>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome do plano *" className="sm:col-span-2">
          <Entrada
            value={dados.nome}
            onChange={(e) => alterar("nome", e.target.value)}
            placeholder="Preventiva semestral - servomotor eixo X"
          />
        </Campo>
        <Campo rotulo="Equipamento *" className="sm:col-span-2">
          <Selecao
            value={dados.equipamentoId}
            onChange={(e) => alterar("equipamentoId", e.target.value)}
          >
            {db.equipamentos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.tag} — {eq.maquina}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Tipo">
          <Selecao
            value={dados.tipo}
            onChange={(e) => alterar("tipo", e.target.value as PlanoManutencao["tipo"])}
          >
            <option value="preventiva">Preventiva</option>
            <option value="preditiva">Preditiva</option>
            <option value="calibracao">Calibração</option>
          </Selecao>
        </Campo>
        <Campo rotulo="Responsável">
          <Entrada
            value={dados.responsavel}
            onChange={(e) => alterar("responsavel", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Intervalo (dias) *">
          <Entrada
            type="number"
            min={1}
            value={dados.intervaloDias}
            onChange={(e) => alterar("intervaloDias", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Intervalo (horas de operação)" dica="Opcional — o que vencer primeiro.">
          <Entrada
            type="number"
            min={0}
            value={dados.intervaloHoras ?? ""}
            onChange={(e) =>
              alterar("intervaloHoras", e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </Campo>
        <Campo rotulo="Última execução">
          <Entrada
            type="date"
            value={dados.ultimaExecucao}
            onChange={(e) => alterar("ultimaExecucao", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Duração estimada (h)">
          <Entrada
            type="number"
            step="0.5"
            min={0}
            value={dados.duracaoEstimadaH}
            onChange={(e) => alterar("duracaoEstimadaH", Number(e.target.value))}
          />
        </Campo>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={dados.ativo}
            onChange={(e) => alterar("ativo", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Plano ativo na programação
        </label>
        <Campo
          rotulo="Checklist de execução"
          dica="Um item por linha."
          className="sm:col-span-2"
        >
          <textarea
            value={checklistTexto}
            onChange={(e) => setChecklistTexto(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder={"Medir resistência de isolamento\nAnalisar vibração dos mancais\nVerificar folga do acoplamento"}
          />
        </Campo>
      </div>
    </Modal>
  )
}
