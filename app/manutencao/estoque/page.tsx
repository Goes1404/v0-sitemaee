"use client"

import { useMemo, useState } from "react"
import { Download, Minus, Package, PackageMinus, Pencil, Plus, Trash2 } from "lucide-react"
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
import type { CategoriaPeca, Peca } from "@/lib/manutencao/types"
import { formatarMoeda, novoId, rotuloCategoriaPeca } from "@/lib/manutencao/format"
import { baixarArquivo, paraCSV } from "@/lib/manutencao/csv"

function pecaVazia(): Peca {
  return {
    id: novoId("pc"),
    codigo: "",
    descricao: "",
    categoria: "outros",
    fabricante: "",
    aplicacao: "",
    estoque: 0,
    estoqueMinimo: 1,
    custoUnitario: 0,
    localizacao: "",
    fornecedor: "",
  }
}

export default function PaginaEstoque() {
  const { db, salvarPeca, removerPeca, movimentarEstoque } = useManutencao()
  const [busca, setBusca] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [somenteCriticas, setSomenteCriticas] = useState(false)
  const [emEdicao, setEmEdicao] = useState<Peca | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<Peca | null>(null)

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return db.pecas
      .filter((p) => (filtroCategoria === "todas" ? true : p.categoria === filtroCategoria))
      .filter((p) => (somenteCriticas ? p.estoque < p.estoqueMinimo : true))
      .filter((p) =>
        termo
          ? [p.codigo, p.descricao, p.fabricante, p.aplicacao, p.fornecedor]
              .join(" ")
              .toLowerCase()
              .includes(termo)
          : true,
      )
      .sort((a, b) => a.codigo.localeCompare(b.codigo))
  }, [db.pecas, busca, filtroCategoria, somenteCriticas])

  const resumo = useMemo(
    () => ({
      itens: db.pecas.length,
      abaixoMinimo: db.pecas.filter((p) => p.estoque < p.estoqueMinimo).length,
      zerados: db.pecas.filter((p) => p.estoque === 0).length,
      valor: db.pecas.reduce((s, p) => s + p.estoque * p.custoUnitario, 0),
    }),
    [db.pecas],
  )

  function exportar() {
    const csv = paraCSV(lista, [
      { chave: "codigo", titulo: "Código" },
      { chave: "descricao", titulo: "Descrição" },
      { chave: "categoria", titulo: "Categoria", valor: (p) => rotuloCategoriaPeca[p.categoria] },
      { chave: "fabricante", titulo: "Fabricante" },
      { chave: "aplicacao", titulo: "Aplicação" },
      { chave: "estoque", titulo: "Estoque" },
      { chave: "estoqueMinimo", titulo: "Estoque mínimo" },
      { chave: "custoUnitario", titulo: "Custo unitário (R$)" },
      { chave: "localizacao", titulo: "Localização" },
      { chave: "fornecedor", titulo: "Fornecedor" },
    ])
    baixarArquivo("estoque-pecas.csv", csv)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo="Peças e estoque"
        descricao="Sobressalentes de servomotores e servodrives com ponto de ressuprimento."
        acoes={
          <>
            <Botao variante="secundario" onClick={exportar}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Botao>
            <Botao onClick={() => setEmEdicao(pecaVazia())}>
              <Plus className="h-4 w-4" />
              Nova peça
            </Botao>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicadorCartao titulo="Itens cadastrados" valor={resumo.itens} icone={<Package className="h-5 w-5" />} />
        <IndicadorCartao
          titulo="Abaixo do mínimo"
          valor={resumo.abaixoMinimo}
          tom={resumo.abaixoMinimo ? "red" : "emerald"}
          icone={<PackageMinus className="h-5 w-5" />}
        />
        <IndicadorCartao titulo="Sem estoque" valor={resumo.zerados} tom={resumo.zerados ? "red" : "emerald"} />
        <IndicadorCartao titulo="Valor imobilizado" valor={formatarMoeda(resumo.valor)} />
      </div>

      <Cartao className="my-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Entrada
            placeholder="Buscar por código, descrição, aplicação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Selecao
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todas">Todas as categorias</option>
            {Object.entries(rotuloCategoriaPeca).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Selecao>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={somenteCriticas}
              onChange={(e) => setSomenteCriticas(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Mostrar somente itens abaixo do mínimo
          </label>
        </div>
      </Cartao>

      <Cartao>
        <CabecalhoCartao
          titulo="Sobressalentes"
          descricao="Use os botões +/− para registrar entradas e saídas manuais."
        />
        {lista.length === 0 ? (
          <Vazio mensagem="Nenhuma peça encontrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Código / descrição</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Aplicação</th>
                  <th className="px-5 py-3 font-medium">Estoque</th>
                  <th className="px-5 py-3 font-medium">Custo unit.</th>
                  <th className="px-5 py-3 font-medium">Local</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((peca) => {
                  const critico = peca.estoque < peca.estoqueMinimo
                  return (
                    <tr key={peca.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{peca.codigo}</p>
                        <p className="text-xs text-slate-500">{peca.descricao}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {rotuloCategoriaPeca[peca.categoria]}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {peca.aplicacao}
                        <p className="text-xs text-slate-500">{peca.fabricante}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Baixar estoque de ${peca.codigo}`}
                            onClick={() => movimentarEstoque(peca.id, -1)}
                            className="rounded border border-slate-300 p-1 text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className={`w-8 text-center font-medium ${critico ? "text-red-600" : "text-slate-900"}`}
                          >
                            {peca.estoque}
                          </span>
                          <button
                            type="button"
                            aria-label={`Entrada de estoque de ${peca.codigo}`}
                            onClick={() => movimentarEstoque(peca.id, 1)}
                            className="rounded border border-slate-300 p-1 text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          {critico ? (
                            <Etiqueta
                              texto={`mín. ${peca.estoqueMinimo}`}
                              classe="bg-red-100 text-red-800 ring-red-600/20"
                            />
                          ) : (
                            <span className="text-xs text-slate-500">
                              mín. {peca.estoqueMinimo}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {formatarMoeda(peca.custoUnitario)}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {peca.localizacao}
                        <p className="text-xs text-slate-500">{peca.fornecedor}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Botao
                            variante="fantasma"
                            aria-label={`Editar ${peca.codigo}`}
                            onClick={() => setEmEdicao(peca)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Botao>
                          <Botao
                            variante="fantasma"
                            aria-label={`Excluir ${peca.codigo}`}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmarExclusao(peca)}
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

      {emEdicao ? (
        <FormularioPeca
          peca={emEdicao}
          onFechar={() => setEmEdicao(null)}
          onSalvar={(peca) => {
            salvarPeca(peca)
            setEmEdicao(null)
          }}
        />
      ) : null}

      <Modal
        aberto={Boolean(confirmarExclusao)}
        titulo="Excluir peça"
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
                if (confirmarExclusao) removerPeca(confirmarExclusao.id)
                setConfirmarExclusao(null)
              }}
            >
              Excluir
            </Botao>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Confirma a exclusão de{" "}
          <strong className="text-slate-900">{confirmarExclusao?.codigo}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function FormularioPeca({
  peca,
  onFechar,
  onSalvar,
}: {
  peca: Peca
  onFechar: () => void
  onSalvar: (peca: Peca) => void
}) {
  const [dados, setDados] = useState<Peca>(peca)
  const alterar = <K extends keyof Peca>(campo: K, valor: Peca[K]) =>
    setDados((atual) => ({ ...atual, [campo]: valor }))
  const valido = dados.codigo.trim() && dados.descricao.trim()

  return (
    <Modal
      aberto
      titulo={peca.codigo ? `Editar ${peca.codigo}` : "Nova peça"}
      onFechar={onFechar}
      largura="max-w-2xl"
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao disabled={!valido} onClick={() => onSalvar(dados)}>
            Salvar
          </Botao>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Código *">
          <Entrada
            value={dados.codigo}
            onChange={(e) => alterar("codigo", e.target.value.toUpperCase())}
          />
        </Campo>
        <Campo rotulo="Categoria">
          <Selecao
            value={dados.categoria}
            onChange={(e) => alterar("categoria", e.target.value as CategoriaPeca)}
          >
            {Object.entries(rotuloCategoriaPeca).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Descrição *" className="sm:col-span-2">
          <Entrada
            value={dados.descricao}
            onChange={(e) => alterar("descricao", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Fabricante">
          <Entrada
            value={dados.fabricante}
            onChange={(e) => alterar("fabricante", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Aplicação" dica="Modelos de motor/drive compatíveis.">
          <Entrada
            value={dados.aplicacao}
            onChange={(e) => alterar("aplicacao", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Estoque atual">
          <Entrada
            type="number"
            min={0}
            value={dados.estoque}
            onChange={(e) => alterar("estoque", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Estoque mínimo">
          <Entrada
            type="number"
            min={0}
            value={dados.estoqueMinimo}
            onChange={(e) => alterar("estoqueMinimo", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Custo unitário (R$)">
          <Entrada
            type="number"
            min={0}
            value={dados.custoUnitario}
            onChange={(e) => alterar("custoUnitario", Number(e.target.value))}
          />
        </Campo>
        <Campo rotulo="Localização">
          <Entrada
            value={dados.localizacao}
            onChange={(e) => alterar("localizacao", e.target.value)}
            placeholder="Almox. A-12"
          />
        </Campo>
        <Campo rotulo="Fornecedor" className="sm:col-span-2">
          <Entrada
            value={dados.fornecedor}
            onChange={(e) => alterar("fornecedor", e.target.value)}
          />
        </Campo>
      </div>
    </Modal>
  )
}
