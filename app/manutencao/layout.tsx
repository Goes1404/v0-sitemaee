import type { Metadata } from "next"
import { ProvedorManutencao } from "@/lib/manutencao/store"
import { BarraLateral, BarraTopoMobile } from "@/components/manutencao/navegacao"

export const metadata: Metadata = {
  title: "ServoManut | Gestão de manutenção de servomotores e servodrives",
  description:
    "Sistema de gestão de manutenção (CMMS) para servomotores e servodrives: equipamentos, ordens de serviço, planos preventivos, estoque de peças e indicadores.",
}

export default function LayoutManutencao({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProvedorManutencao>
      <div className="min-h-screen bg-slate-50 lg:flex">
        <BarraLateral />
        <div className="min-w-0 flex-1">
          <BarraTopoMobile />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ProvedorManutencao>
  )
}
