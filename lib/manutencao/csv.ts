/** Utilitários de exportação para planilhas e backup. */

function escapar(valor: unknown): string {
  const texto = valor == null ? "" : String(valor)
  return `"${texto.replace(/"/g, '""')}"`
}

export interface ColunaCSV<T> {
  /** Nome da propriedade ou identificador da coluna calculada. */
  chave: string
  titulo: string
  /** Valor calculado — quando ausente, usa a propriedade indicada em `chave`. */
  valor?: (linha: T) => unknown
}

export function paraCSV<T>(linhas: T[], colunas: Array<ColunaCSV<T>>): string {
  const cabecalho = colunas.map((c) => escapar(c.titulo)).join(";")
  const corpo = linhas.map((linha) =>
    colunas
      .map((c) =>
        escapar(
          c.valor ? c.valor(linha) : (linha as Record<string, unknown>)[c.chave],
        ),
      )
      .join(";"),
  )
  // BOM para o Excel reconhecer acentuação em UTF-8
  return "\ufeff" + [cabecalho, ...corpo].join("\r\n")
}

export function baixarArquivo(nome: string, conteudo: string, tipo = "text/csv;charset=utf-8") {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
