"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Plus, Search, Trash2 } from "lucide-react"
import {
  AreaTexto,
  Botao,
  CabecalhoCartao,
  Campo,
  Cartao,
  Entrada,
  Etiqueta,
  LinhaInfo,
  Modal,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import { useManutencao } from "@/lib/manutencao/store"
import type { OrdemServico, PecaAplicada, StatusOS } from "@/lib/manutencao/types"
import {
  STATUS_OS_ABERTOS,
  formatarData,
  formatarMoeda,
  formatarNumero,
  hoje,
  iso,
  rotuloPrioridade,
  rotuloStatusOS,
  rotuloTipoOS,
} from "@/lib/manutencao/format"
import { custoTotal } from "@/lib/manutencao/metrics"
import { baixarArquivo, paraCSV } from "@/lib/manutencao/csv"

function ordemVazia(equipamentoId: string): Omit<OrdemServico, "id" | "codigo"> {
  return {
    equipamentoId,
    tipo: "corretiva",
    status: "aberta",
    prioridade: "media",
    titulo: "",
    sintoma: "",
    tecnico: "",
    abertaEm: iso(hoje()),
    horasParada: 0,
    horasMaoDeObra: 0,
    custoPecas: 0,
    custoServicoExterno: 0,
    pecas: [],
  }
}

export default function PaginaOrdens() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Carregando ordens...</p>}>
      <ConteudoOrdens />
    </Suspense>
  )
}

function ConteudoOrdens() {
  const searchParams = useSearchParams()
  const { db, criarOrdem, atualizarOrdem, mudarStatusOrdem, removerOrdem } = useManutencao()

  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("abertas")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos")
  const [formulario, setFormulario] = useState<
    | { modo: "nova"; dados: Omit<OrdemServico, "id" | "codigo"> }
    | { modo: "edicao"; dados: OrdemServico }
    | null
  >(null)
  const [detalhe, setDetalhe] = useState<OrdemServico | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<OrdemServico | null>(null)

  // Abertura direta via link (?nova=1, ?os=<id>)
  useEffect(() => {
    if (searchParams.get("nova") === "1") {
      const equipamentoId =
        searchParams.get("equipamento") ?? db.equipamentos[0]?.id ?? ""
      const alarme = searchParams.get("alarme") ?? undefined
      setFormulario({
        modo: "nova",
        dados: { ...ordemVazia(equipamentoId), codigoAlarme: alarme },
      })
    }
    const osId = searchParams.get("os")
    if (osId) {
      const alvo = db.ordens.find((o) => o.id === osId)
      if (alvo) setDetalhe(alvo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, db.equipamentos.length])

  // Mantém o painel de detalhe sincronizado com o estado mais recente da OS
  useEffect(() => {
    if (!detalhe) return
    const atualizada = db.ordens.find((o) => o.id === detalhe.id)
    if (atualizada && atualizada !== detalhe) setDetalhe(atualizada)
  }, [db.ordens, detalhe])

  const equipamentoPor = (id: string) => db.equipamentos.find((e) => e.id === id)

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return db.ordens
      .filter((o) => {
        if (filtroStatus === "abertas") return STATUS_OS_ABERTOS.includes(o.status)
        if (filtroStatus === "todos") return true
        return o.status === filtroStatus
      })
      .filter((o) => (filtroTipo === "todos" ? true : o.tipo === filtroTipo))
      .filter((o) => (filtroPrioridade === "todos" ? true : o.prioridade === filtroPrioridade))
      .filter((o) => {
        if (!termo) return true
        const eq = equipamentoPor(o.equipamentoId)
        return [o.codigo, o.titulo, o.sintoma, o.tecnico, o.codigoAlarme, eq?.tag, eq?.maquina]
          .join(" ")
          .toLowerCase()
          .includes(termo)
      })
      .sort((a, b) => b.abertaEm.localeCompare(a.abertaEm))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.ordens, db.equipamentos, busca, filtroStatus, filtroTipo, filtroPrioridade])

  const resumo = useMemo(() => {
    const abertas = db.ordens.filter((o) => STATUS_OS_ABERTOS.includes(o.status))
    return {
      abertas: abertas.length,
      execucao: abertas.filter((o) => o.status === "em_execucao").length,
      aguardando: abertas.filter((o) => o.status === "aguardando_peca").length,
      atrasadas: abertas.filter((o) => o.programadaPara && o.programadaPara < iso(hoje()))
        .length,
    }
  }, [db.ordens])

  function exportar() {
    const csv = paraCSV(lista, [
      { chave: "codigo", titulo: "OS" },
      { chave: "equipamento", titulo: "Equipamento", valor: (o) => equipamentoPor(o.equipamentoId)?.tag ?? "" },
      { chave: "titulo", titulo: "Título" },
      { chave: "tipo", titulo: "Tipo" },
      { chave: "status", titulo: "Status" },
      { chave: "prioridade", titulo: "Prioridade" },
      { chave: "codigoAlarme", titulo: "Código de alarme" },
      { chave: "tecnico", titulo: "Técnico" },
      { chave: "abertaEm", titulo: "Aberta em" },
      { chave: "concluidaEm", titulo: "Concluída em" },
      { chave: "horasParada", titulo: "Horas de parada" },
      { chave: "horasMaoDeObra", titulo: "Horas de mão de obra" },
      { chave: "custo", titulo: "Custo total (R$)", valor: (o) => custoTotal(o) },
      { chave: "causaRaiz", titulo: "Causa raiz" },
    ])
    baixarArquivo("ordens-de-servico.csv", csv)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo="Ordens de serviço"
        descricao={`${resumo.abertas} em aberto · ${resumo.execucao} em execução · ${resumo.aguardando} aguardando peça · ${resumo.atrasadas} atrasada(s).`}
        acoes={
          <>
            <Botao variante="secundario" onClick={exportar}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Botao>
            <Botao
              onClick={() =>
                setFormulario({
                  modo: "nova",
                  dados: ordemVazia(db.equipamentos[0]?.id ?? ""),
                })
              }
            >
              <Plus className="h-4 w-4" />
              Nova OS
            </Botao>
          </>
        }
      />

      <Cartao className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Entrada
              placeholder="Buscar por OS, equipamento, alarme..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Selecao value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="abertas">Somente em aberto</option>
            <option value="todos">Todos os status</option>
            {Object.entries(rotuloStatusOS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
          <Selecao value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos os tipos</option>
            {Object.entries(rotuloTipoOS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
          <Selecao
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
          >
            <option value="todos">Todas as prioridades</option>
            {Object.entries(rotuloPrioridade).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
        </div>
      </Cartao>

      <Cartao>
        {lista.length === 0 ? (
          <Vazio mensagem="Nenhuma ordem de serviço encontrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">OS</th>
                  <th className="px-5 py-3 font-medium">Equipamento</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Prioridade</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Técnico</th>
                  <th className="px-5 py-3 font-medium">Abertura</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((os) => {
                  const eq = equipamentoPor(os.equipamentoId)
                  const atrasada =
                    os.programadaPara &&
                    os.programadaPara < iso(hoje()) &&
                    STATUS_OS_ABERTOS.includes(os.status)
                  return (
                    <tr key={os.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setDetalhe(os)}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {os.codigo}
                        </button>
                        <p className="max-w-64 truncate text-xs text-slate-500">{os.titulo}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {eq ? (
                          <Link
                            href={`/manutencao/equipamentos/${eq.id}`}
                            className="hover:underline"
                          >
                            {eq.tag}
                          </Link>
                        ) : (
                          "—"
                        )}
                        <p className="text-xs text-slate-500">{eq?.maquina}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Etiqueta {...rotuloTipoOS[os.tipo]} />
                      </td>
                      <td className="px-5 py-3">
                        <Etiqueta {...rotuloPrioridade[os.prioridade]} />
                      </td>
                      <td className="px-5 py-3">
                        <Selecao
                          value={os.status}
                          onChange={(e) => mudarStatusOrdem(os.id, e.target.value as StatusOS)}
                          className="w-36 !py-1 text-xs"
                          aria-label={`Status da ${os.codigo}`}
                        >
                          {Object.entries(rotuloStatusOS).map(([valor, rotulo]) => (
                            <option key={valor} value={valor}>
                              {rotulo.texto}
                            </option>
                          ))}
                        </Selecao>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                        {os.tecnico || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {formatarData(os.abertaEm)}
                        {atrasada ? (
                          <p className="text-xs font-medium text-red-600">
                            Programada {formatarData(os.programadaPara)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Botao
                            variante="secundario"
                            className="!px-2 !py-1 text-xs"
                            onClick={() => setFormulario({ modo: "edicao", dados: os })}
                          >
                            Editar
                          </Botao>
                          <Botao
                            variante="fantasma"
                            className="text-red-600 hover:bg-red-50"
                            aria-label={`Excluir ${os.codigo}`}
                            onClick={() => setConfirmarExclusao(os)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Botao>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      {formulario ? (
        <FormularioOrdem
          inicial={formulario.dados}
          modo={formulario.modo}
          onFechar={() => setFormulario(null)}
          onSalvar={(dados) => {
            if (formulario.modo === "edicao") {
              atualizarOrdem({ ...(formulario.dados as OrdemServico), ...dados })
            } else {
              criarOrdem(dados)
            }
            setFormulario(null)
          }}
        />
      ) : null}

      {detalhe ? (
        <DetalheOrdem
          os={detalhe}
          onFechar={() => setDetalhe(null)}
          onEditar={() => {
            setFormulario({ modo: "edicao", dados: detalhe })
            setDetalhe(null)
          }}
        />
      ) : null}

      <Modal
        aberto={Boolean(confirmarExclusao)}
        titulo="Excluir ordem de serviço"
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
                if (confirmarExclusao) removerOrdem(confirmarExclusao.id)
                setConfirmarExclusao(null)
              }}
            >
              Excluir
            </Botao>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Confirma a exclusão da OS{" "}
          <strong className="text-slate-900">{confirmarExclusao?.codigo}</strong>? O histórico
          do equipamento perderá este registro.
        </p>
      </Modal>
    </div>
  )
}

function FormularioOrdem({
  inicial,
  modo,
  onFechar,
  onSalvar,
}: {
  inicial: Omit<OrdemServico, "id" | "codigo">
  modo: "nova" | "edicao"
  onFechar: () => void
  onSalvar: (dados: Omit<OrdemServico, "id" | "codigo">) => void
}) {
  const { db } = useManutencao()
  const [dados, setDados] = useState<Omit<OrdemServico, "id" | "codigo">>({ ...inicial })

  const alterar = <K extends keyof OrdemServico>(campo: K, valor: OrdemServico[K]) =>
    setDados((atual) => ({ ...atual, [campo]: valor }))

  const equipamento = db.equipamentos.find((e) => e.id === dados.equipamentoId)
  const alarmesSugeridos = db.falhas.filter((f) =>
    equipamento ? f.fabricante === equipamento.fabricante : true,
  )

  const custoPecasCalculado = useMemo(
    () =>
      dados.pecas.reduce((soma, aplicada) => {
        const peca = db.pecas.find((p) => p.id === aplicada.pecaId)
        return soma + (peca ? peca.custoUnitario * aplicada.quantidade : 0)
      }, 0),
    [dados.pecas, db.pecas],
  )

  function adicionarPeca(pecaId: string) {
    if (!pecaId) return
    setDados((atual) =>
      atual.pecas.some((p) => p.pecaId === pecaId)
        ? atual
        : { ...atual, pecas: [...atual.pecas, { pecaId, quantidade: 1 }] },
    )
  }

  function alterarQuantidade(pecaId: string, quantidade: number) {
    setDados((atual) => ({
      ...atual,
      pecas: atual.pecas.map((p) =>
        p.pecaId === pecaId ? { ...p, quantidade: Math.max(1, quantidade) } : p,
      ),
    }))
  }

  function removerPeca(pecaId: string) {
    setDados((atual) => ({
      ...atual,
      pecas: atual.pecas.filter((p) => p.pecaId !== pecaId),
    }))
  }

  const valido = dados.titulo.trim() && dados.equipamentoId

  return (
    <Modal
      aberto
      titulo={modo === "nova" ? "Nova ordem de serviço" : "Editar ordem de serviço"}
      descricao="Registre sintoma, diagnóstico, ações e recursos consumidos."
      onFechar={onFechar}
      largura="max-w-3xl"
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
                custoPecas: custoPecasCalculado || dados.custoPecas,
                concluidaEm:
                  dados.status === "concluida"
                    ? dados.concluidaEm ?? iso(hoje())
                    : dados.concluidaEm,
              })
            }
          >
            Salvar
          </Botao>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Equipamento *" className="sm:col-span-2">
          <Selecao
            value={dados.equipamentoId}
            onChange={(e) => alterar("equipamentoId", e.target.value)}
          >
            {db.equipamentos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.tag} — {eq.fabricante} {eq.modelo} ({eq.maquina})
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Título *" className="sm:col-span-2">
          <Entrada
            value={dados.titulo}
            onChange={(e) => alterar("titulo", e.target.value)}
            placeholder="Ex.: Erro de comunicação com encoder"
          />
        </Campo>
        <Campo rotulo="Tipo">
          <Selecao
            value={dados.tipo}
            onChange={(e) => alterar("tipo", e.target.value as OrdemServico["tipo"])}
          >
            {Object.entries(rotuloTipoOS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Prioridade">
          <Selecao
            value={dados.prioridade}
            onChange={(e) =>
              alterar("prioridade", e.target.value as OrdemServico["prioridade"])
            }
          >
            {Object.entries(rotuloPrioridade).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Status">
          <Selecao
            value={dados.status}
            onChange={(e) => alterar("status", e.target.value as StatusOS)}
          >
            {Object.entries(rotuloStatusOS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Técnico responsável">
          <Entrada value={dados.tecnico} onChange={(e) => alterar("tecnico", e.target.value)} />
        </Campo>
        <Campo rotulo="Código de alarme" dica="Sugestões do fabricante do equipamento.">
          <Entrada
            list="alarmes-sugeridos"
            value={dados.codigoAlarme ?? ""}
            onChange={(e) => alterar("codigoAlarme", e.target.value)}
            placeholder="A.C90, F30001..."
          />
          <datalist id="alarmes-sugeridos">
            {alarmesSugeridos.map((f) => (
              <option key={f.id} value={f.codigo}>
                {f.descricao}
              </option>
            ))}
          </datalist>
        </Campo>
        <Campo rotulo="Aberta em">
          <Entrada
            type="date"
            value={dados.abertaEm}
            onChange={(e) => alterar("abertaEm", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Programada para">
          <Entrada
            type="date"
            value={dados.programadaPara ?? ""}
            onChange={(e) => alterar("programadaPara", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Concluída em">
          <Entrada
            type="date"
            value={dados.concluidaEm ?? ""}
            onChange={(e) => alterar("concluidaEm", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Sintoma relatado" className="sm:col-span-2">
          <AreaTexto
            value={dados.sintoma}
            onChange={(e) => alterar("sintoma", e.target.value)}
            placeholder="O que foi observado pelo operador ou pelo sistema?"
          />
        </Campo>
        <Campo rotulo="Diagnóstico técnico" className="sm:col-span-2">
          <AreaTexto
            value={dados.diagnostico ?? ""}
            onChange={(e) => alterar("diagnostico", e.target.value)}
            placeholder="Medições realizadas, testes e constatações."
          />
        </Campo>
        <Campo rotulo="Causa raiz" className="sm:col-span-2">
          <Entrada
            value={dados.causaRaiz ?? ""}
            onChange={(e) => alterar("causaRaiz", e.target.value)}
            placeholder="Ex.: raio de curvatura do cabo abaixo do especificado"
          />
        </Campo>
        <Campo rotulo="Ações executadas" className="sm:col-span-2">
          <AreaTexto
            value={dados.acoesExecutadas ?? ""}
            onChange={(e) => alterar("acoesExecutadas", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Horas de parada">
          <Entrada
            type="number"
            step="0.5"
            min={0}
            value={dados.horasParada}
            onChange={(e) => alterar("horasParada", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Horas de mão de obra">
          <Entrada
            type="number"
            step="0.5"
            min={0}
            value={dados.horasMaoDeObra}
            onChange={(e) => alterar("horasMaoDeObra", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Custo de serviço externo (R$)">
          <Entrada
            type="number"
            min={0}
            value={dados.custoServicoExterno}
            onChange={(e) => alterar("custoServicoExterno", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Custo de peças (R$)" dica="Calculado a partir das peças aplicadas.">
          <Entrada value={formatarMoeda(custoPecasCalculado)} disabled />
        </Campo>
      </div>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold text-slate-900">Peças aplicadas</h4>
        <p className="mb-3 text-xs text-slate-500">
          A baixa no estoque é feita automaticamente quando a OS é concluída.
        </p>
        <Selecao
          value=""
          onChange={(e) => adicionarPeca(e.target.value)}
          aria-label="Adicionar peça"
        >
          <option value="">Adicionar peça...</option>
          {db.pecas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.codigo} — {p.descricao} (estoque {p.estoque})
            </option>
          ))}
        </Selecao>
        {dados.pecas.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {dados.pecas.map((aplicada: PecaAplicada) => {
              const peca = db.pecas.find((p) => p.id === aplicada.pecaId)
              return (
                <li
                  key={aplicada.pecaId}
                  className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-slate-700">
                    {peca ? `${peca.codigo} — ${peca.descricao}` : aplicada.pecaId}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={aplicada.quantidade}
                    onChange={(e) =>
                      alterarQuantidade(aplicada.pecaId, Number(e.target.value))
                    }
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    aria-label="Quantidade"
                  />
                  <span className="w-24 text-right text-slate-600">
                    {formatarMoeda((peca?.custoUnitario ?? 0) * aplicada.quantidade)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removerPeca(aplicada.pecaId)}
                    className="text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </Modal>
  )
}

function DetalheOrdem({
  os,
  onFechar,
  onEditar,
}: {
  os: OrdemServico
  onFechar: () => void
  onEditar: () => void
}) {
  const { db, mudarStatusOrdem } = useManutencao()
  const equipamento = db.equipamentos.find((e) => e.id === os.equipamentoId)
  const falha = db.falhas.find(
    (f) => os.codigoAlarme && f.codigo.toLowerCase() === os.codigoAlarme.toLowerCase(),
  )

  return (
    <Modal
      aberto
      titulo={`${os.codigo} — ${os.titulo}`}
      descricao={equipamento ? `${equipamento.tag} · ${equipamento.maquina}` : undefined}
      onFechar={onFechar}
      largura="max-w-3xl"
      rodape={
        <>
          {os.status !== "concluida" ? (
            <Botao
              variante="secundario"
              onClick={() => {
                mudarStatusOrdem(os.id, "concluida")
                onFechar()
              }}
            >
              Concluir OS
            </Botao>
          ) : null}
          <Botao onClick={onEditar}>Editar</Botao>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Etiqueta {...rotuloTipoOS[os.tipo]} />
        <Etiqueta {...rotuloStatusOS[os.status]} />
        <Etiqueta {...rotuloPrioridade[os.prioridade]} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <CabecalhoCartao titulo="Execução" />
          <div className="pt-2">
            <LinhaInfo rotulo="Técnico" valor={os.tecnico || "—"} />
            <LinhaInfo rotulo="Aberta em" valor={formatarData(os.abertaEm)} />
            <LinhaInfo rotulo="Programada para" valor={formatarData(os.programadaPara)} />
            <LinhaInfo rotulo="Iniciada em" valor={formatarData(os.iniciadaEm)} />
            <LinhaInfo rotulo="Concluída em" valor={formatarData(os.concluidaEm)} />
          </div>
        </div>
        <div>
          <CabecalhoCartao titulo="Recursos" />
          <div className="pt-2">
            <LinhaInfo
              rotulo="Horas de parada"
              valor={`${formatarNumero(os.horasParada)} h`}
            />
            <LinhaInfo
              rotulo="Horas de mão de obra"
              valor={`${formatarNumero(os.horasMaoDeObra)} h`}
            />
            <LinhaInfo rotulo="Custo de peças" valor={formatarMoeda(os.custoPecas)} />
            <LinhaInfo
              rotulo="Serviço externo"
              valor={formatarMoeda(os.custoServicoExterno)}
            />
            <LinhaInfo rotulo="Custo total" valor={formatarMoeda(custoTotal(os))} />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <Bloco titulo="Sintoma relatado" texto={os.sintoma} />
        <Bloco titulo="Diagnóstico" texto={os.diagnostico} />
        <Bloco titulo="Causa raiz" texto={os.causaRaiz} />
        <Bloco titulo="Ações executadas" texto={os.acoesExecutadas} />
      </div>

      {os.pecas.length > 0 ? (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Peças aplicadas</h4>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
            {os.pecas.map((aplicada) => {
              const peca = db.pecas.find((p) => p.id === aplicada.pecaId)
              return (
                <li key={aplicada.pecaId} className="flex justify-between px-3 py-2">
                  <span className="text-slate-700">
                    {peca ? `${peca.codigo} — ${peca.descricao}` : aplicada.pecaId}
                  </span>
                  <span className="text-slate-600">{aplicada.quantidade} un.</span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {falha ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Catálogo de falhas — {falha.codigo} ({falha.fabricante} {falha.linha})
          </p>
          <p className="mt-1 text-sm text-amber-900">{falha.descricao}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Causas prováveis
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-amber-900">
                {falha.causasProvaveis.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Ações recomendadas
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-amber-900">
                {falha.acoesRecomendadas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

function Bloco({ titulo, texto }: { titulo: string; texto?: string }) {
  if (!texto) return null
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-1 whitespace-pre-line text-slate-700">{texto}</p>
    </div>
  )
}
