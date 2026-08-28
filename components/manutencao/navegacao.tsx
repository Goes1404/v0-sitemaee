"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  Cpu,
  LayoutDashboard,
  Menu,
  Package,
  Wrench,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const itens = [
  { href: "/manutencao", rotulo: "Painel", icone: LayoutDashboard },
  { href: "/manutencao/equipamentos", rotulo: "Equipamentos", icone: Cpu },
  { href: "/manutencao/ordens", rotulo: "Ordens de serviço", icone: Wrench },
  { href: "/manutencao/planos", rotulo: "Planos preventivos", icone: CalendarCheck },
  { href: "/manutencao/estoque", rotulo: "Peças e estoque", icone: Package },
  { href: "/manutencao/falhas", rotulo: "Catálogo de falhas", icone: AlertTriangle },
  { href: "/manutencao/relatorios", rotulo: "Relatórios", icone: BarChart3 },
]

function estaAtivo(pathname: string, href: string) {
  return href === "/manutencao" ? pathname === href : pathname.startsWith(href)
}

function Lista({ aoNavegar }: { aoNavegar?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="space-y-1">
      {itens.map((item) => {
        const ativo = estaAtivo(pathname, item.href)
        const Icone = item.icone
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={aoNavegar}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              ativo
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
            )}
          >
            <Icone className="h-4 w-4 shrink-0" />
            {item.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}

export function BarraLateral() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="rounded-lg bg-sky-500/20 p-2 text-sky-300">
          <Cpu className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">ServoManut</p>
          <p className="text-xs text-slate-400">Servomotores e servodrives</p>
        </div>
      </div>
      <div className="px-3 pb-6">
        <Lista />
      </div>
    </aside>
  )
}

export function BarraTopoMobile() {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-sky-500/20 p-1.5 text-sky-300">
            <Cpu className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-white">ServoManut</span>
        </div>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
        >
          {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {aberto ? (
        <div className="border-b border-slate-800 bg-slate-900 px-3 py-3">
          <Lista aoNavegar={() => setAberto(false)} />
        </div>
      ) : null}
    </div>
  )
}
