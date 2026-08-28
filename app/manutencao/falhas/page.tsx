"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { AlertTriangle, ChevronDown, Search, Wrench } from "lucide-react"
import {
  Cartao,
  CabecalhoCartao,
  Entrada,
  Etiqueta,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import { useManutencao } from "@/lib/manutencao/store"
import { rotuloSeveridade } from "@/lib/manutencao/format"

export default function PaginaFalhas() {
  const { db } = useManutencao()
  const [busca, setBusca] = useState("")
  const [fabricante, setFabricante] = useState("todos")
  const [severidade, setSeveridade] = useState("todas")
  const [aberto, setAberto] = useState<string | null>(null)

  const fabricantes = useMemo(
    () => Array.from(new Set(db.falhas.map((f) => f.fabricante))).sort(),
    [db.falhas],
  )

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return db.falhas
      .filter((f) => (fabricante === "todos" ? true : f.fabricante === fabricante))
      .filter((f) => (severidade === "todas" ? true : f.severidade === severidade))
      .filter((f) =>
        termo
          ? [f.codigo, f.descricao, f.linha, ...f.causasProvaveis, ...f.acoesRecomendadas]
              .join(" ")
              .toLowerCase()
              .includes(termo)
          : true,
      )
      .sort((a, b) => a.fabricante.localeCompare(b.fabricante) || a.codigo.localeCompare(b.codigo))
  }, [db.falhas, busca, fabricante, severidade])

  /** Quantas OS já registraram cada código de alarme. */
  const ocorrencias = useMemo(() => {
    const mapa = new Map<string, number>()
    db.ordens.forEach((o) => {
      if (!o.codigoAlarme) return
      const chave = o.codigoAlarme.toLowerCase()
      mapa.set(chave, (mapa.get(chave) ?? 0) + 1)
    })
    return mapa
  }, [db.ordens])

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina
        titulo="Catálogo de falhas"
        descricao="Códigos de alarme de servodrives por fabricante, com causas prováveis e ações recomendadas de diagnóstico."
      />

      <Cartao className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Entrada
              placeholder="Buscar por código ou sintoma..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Selecao value={fabricante} onChange={(e) => setFabricante(e.target.value)}>
            <option value="todos">Todos os fabricantes</option>
            {fabricantes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Selecao>
          <Selecao value={severidade} onChange={(e) => setSeveridade(e.target.value)}>
            <option value="todas">Todas as severidades</option>
            {Object.entries(rotuloSeveridade).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
        </div>
      </Cartao>

      <Cartao>
        <CabecalhoCartao
          titulo={`${lista.length} código(s) de falha`}
          descricao="Clique em um item para ver o roteiro de diagnóstico."
        />
        {lista.length === 0 ? (
          <Vazio mensagem="Nenhum código encontrado." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {lista.map((falha) => {
              const expandido = aberto === falha.id
              const vezes = ocorrencias.get(falha.codigo.toLowerCase()) ?? 0
              return (
                <li key={falha.id}>
                  <button
                    type="button"
                    onClick={() => setAberto(expandido ? null : falha.id)}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-slate-50"
                    aria-expanded={expandido}
                  >
                    <AlertTriangle
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        falha.severidade === "critica"
                          ? "text-red-600"
                          : falha.severidade === "alta"
                            ? "text-orange-500"
                            : "text-amber-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs text-white">
                          {falha.codigo}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {falha.fabricante} · {falha.linha}
                        </span>
                        <Etiqueta {...rotuloSeveridade[falha.severidade]} />
                        {vezes > 0 ? (
                          <span className="text-xs text-slate-500">
                            {vezes} ocorrência(s) registrada(s)
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{falha.descricao}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expandido ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandido ? (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Causas prováveis
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                            {falha.causasProvaveis.map((c) => (
                              <li key={c}>{c}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Ações recomendadas
                          </p>
                          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-700">
                            {falha.acoesRecomendadas.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                      <Link
                        href={`/manutencao/ordens?nova=1&alarme=${encodeURIComponent(falha.codigo)}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        <Wrench className="h-4 w-4" />
                        Abrir OS com este alarme
                      </Link>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </Cartao>
    </div>
  )
}
