"use client"

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Cartao({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CabecalhoCartao({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
        {descricao ? (
          <p className="mt-0.5 text-sm text-slate-500">{descricao}</p>
        ) : null}
      </div>
      {acao}
    </div>
  )
}

export function Etiqueta({
  texto,
  classe,
  className,
}: {
  texto: string
  classe: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        classe,
        className,
      )}
    >
      {texto}
    </span>
  )
}

export function IndicadorCartao({
  titulo,
  valor,
  unidade,
  detalhe,
  icone,
  tom = "slate",
}: {
  titulo: string
  valor: string | number
  unidade?: string
  detalhe?: string
  icone?: ReactNode
  tom?: "slate" | "emerald" | "amber" | "red" | "sky" | "violet"
}) {
  const tons: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
  }
  return (
    <Cartao className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {valor}
            {unidade ? (
              <span className="ml-1 text-base font-medium text-slate-500">
                {unidade}
              </span>
            ) : null}
          </p>
          {detalhe ? <p className="mt-1 text-xs text-slate-500">{detalhe}</p> : null}
        </div>
        {icone ? (
          <span className={cn("rounded-lg p-2", tons[tom])}>{icone}</span>
        ) : null}
      </div>
    </Cartao>
  )
}

export function Botao({
  children,
  variante = "primario",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario" | "perigo" | "fantasma"
}) {
  const variantes = {
    primario: "bg-slate-900 text-white hover:bg-slate-700",
    secundario: "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
    perigo: "bg-red-600 text-white hover:bg-red-500",
    fantasma: "text-slate-600 hover:bg-slate-100",
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantes[variante],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Campo({
  rotulo,
  children,
  dica,
  className,
}: {
  rotulo: string
  children: ReactNode
  dica?: string
  className?: string
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{rotulo}</span>
      {children}
      {dica ? <span className="mt-1 block text-xs text-slate-500">{dica}</span> : null}
    </label>
  )
}

const estiloEntrada =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"

export function Entrada(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(estiloEntrada, props.className)} />
}

export function AreaTexto(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(estiloEntrada, "min-h-20", props.className)} />
}

export function Selecao(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(estiloEntrada, props.className)} />
}

export function Modal({
  aberto,
  titulo,
  descricao,
  onFechar,
  children,
  rodape,
  largura = "max-w-2xl",
}: {
  aberto: boolean
  titulo: string
  descricao?: string
  onFechar: () => void
  children: ReactNode
  rodape?: ReactNode
  largura?: string
}) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar()
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [aberto, onFechar])

  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8">
      <div
        className={cn(
          "w-full rounded-xl bg-white shadow-xl ring-1 ring-slate-200",
          largura,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
            {descricao ? (
              <p className="mt-0.5 text-sm text-slate-500">{descricao}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {rodape ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
            {rodape}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Vazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-slate-500">{mensagem}</div>
  )
}

export function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-500">{rotulo}</span>
      <span className="text-right text-sm font-medium text-slate-900">{valor}</span>
    </div>
  )
}

export function TituloPagina({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string
  descricao?: string
  acoes?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {titulo}
        </h1>
        {descricao ? <p className="mt-1 text-sm text-slate-500">{descricao}</p> : null}
      </div>
      {acoes ? <div className="flex flex-wrap gap-2">{acoes}</div> : null}
    </div>
  )
}
