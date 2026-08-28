"use client"

import { cn } from "@/lib/utils"

/** Gráfico de barras empilhadas em SVG puro (sem dependências externas). */
export function BarrasEmpilhadas({
  dados,
  series,
  altura = 180,
}: {
  dados: Array<Record<string, number | string>>
  series: Array<{ chave: string; rotulo: string; cor: string }>
  altura?: number
}) {
  const totais = dados.map((d) =>
    series.reduce((s, serie) => s + Number(d[serie.chave] ?? 0), 0),
  )
  const maximo = Math.max(1, ...totais)

  return (
    <div>
      <div
        className="flex items-end gap-3"
        style={{ height: altura }}
        role="img"
        aria-label="Gráfico de ordens de serviço por mês"
      >
        {dados.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1">
            <span className="text-center text-xs font-medium text-slate-500">
              {totais[i] || ""}
            </span>
            <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-md">
              {series.map((serie) => {
                const valor = Number(d[serie.chave] ?? 0)
                if (!valor) return null
                return (
                  <div
                    key={serie.chave}
                    className={serie.cor}
                    style={{ height: `${(valor / maximo) * (altura - 28)}px` }}
                    title={`${serie.rotulo}: ${valor}`}
                  />
                )
              })}
            </div>
            <span className="text-center text-xs capitalize text-slate-500">
              {String(d.rotulo)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        {series.map((serie) => (
          <span key={serie.chave} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={cn("h-2.5 w-2.5 rounded-sm", serie.cor)} />
            {serie.rotulo}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Barras horizontais proporcionais. */
export function BarrasHorizontais({
  itens,
}: {
  itens: Array<{ rotulo: string; valor: number; cor?: string; sufixo?: string }>
}) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor))
  return (
    <ul className="space-y-3">
      {itens.map((item) => (
        <li key={item.rotulo}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-slate-700">{item.rotulo}</span>
            <span className="font-medium text-slate-900">
              {item.valor.toLocaleString("pt-BR")}
              {item.sufixo ?? ""}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", item.cor ?? "bg-slate-800")}
              style={{ width: `${(item.valor / maximo) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Minigráfico de linha para tendências de medições preditivas. */
export function Tendencia({
  valores,
  limite,
  largura = 220,
  altura = 60,
}: {
  valores: number[]
  limite?: number
  largura?: number
  altura?: number
}) {
  if (valores.length < 2) {
    return <p className="text-xs text-slate-500">Dados insuficientes para tendência.</p>
  }
  const maximo = Math.max(...valores, limite ?? 0) * 1.1
  const minimo = Math.min(...valores, 0)
  const escalaY = (v: number) =>
    altura - ((v - minimo) / (maximo - minimo || 1)) * (altura - 6) - 3
  const passo = largura / (valores.length - 1)
  const pontos = valores.map((v, i) => `${i * passo},${escalaY(v)}`).join(" ")
  const excedeu = limite != null && valores[valores.length - 1] > limite

  return (
    <svg width={largura} height={altura} className="overflow-visible">
      {limite != null ? (
        <line
          x1={0}
          x2={largura}
          y1={escalaY(limite)}
          y2={escalaY(limite)}
          stroke="#dc2626"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
      ) : null}
      <polyline
        points={pontos}
        fill="none"
        stroke={excedeu ? "#dc2626" : "#0f172a"}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {valores.map((v, i) => (
        <circle
          key={i}
          cx={i * passo}
          cy={escalaY(v)}
          r={2.5}
          fill={excedeu && i === valores.length - 1 ? "#dc2626" : "#0f172a"}
        />
      ))}
    </svg>
  )
}

/** Rosca de distribuição. */
export function Rosca({
  fatias,
  tamanho = 160,
}: {
  fatias: Array<{ rotulo: string; valor: number; cor: string }>
  tamanho?: number
}) {
  const total = fatias.reduce((s, f) => s + f.valor, 0)
  const raio = tamanho / 2 - 12
  const circunferencia = 2 * Math.PI * raio
  let acumulado = 0

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={tamanho} height={tamanho} role="img" aria-label="Distribuição de ordens por tipo">
        <g transform={`translate(${tamanho / 2} ${tamanho / 2}) rotate(-90)`}>
          <circle r={raio} fill="none" stroke="#f1f5f9" strokeWidth={18} />
          {total > 0 &&
            fatias.map((fatia) => {
              const fracao = fatia.valor / total
              const dash = `${fracao * circunferencia} ${circunferencia}`
              const offset = -acumulado * circunferencia
              acumulado += fracao
              return (
                <circle
                  key={fatia.rotulo}
                  r={raio}
                  fill="none"
                  stroke={fatia.cor}
                  strokeWidth={18}
                  strokeDasharray={dash}
                  strokeDashoffset={offset}
                />
              )
            })}
        </g>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-900 text-lg font-semibold"
        >
          {total}
        </text>
      </svg>
      <ul className="space-y-2">
        {fatias.map((fatia) => (
          <li key={fatia.rotulo} className="flex items-center gap-2 text-sm text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: fatia.cor }}
            />
            <span className="capitalize">{fatia.rotulo}</span>
            <span className="font-medium text-slate-900">{fatia.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
