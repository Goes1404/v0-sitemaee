"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react"
import {
  AreaTexto,
  Botao,
  Campo,
  Cartao,
  Entrada,
  Etiqueta,
  Modal,
  Selecao,
  TituloPagina,
  Vazio,
} from "@/components/manutencao/ui"
import { useManutencao } from "@/lib/manutencao/store"
import type { Equipamento } from "@/lib/manutencao/types"
import {
  formatarData,
  novoId,
  rotuloCriticidade,
  rotuloStatusEquipamento,
} from "@/lib/manutencao/format"
import { baixarArquivo, paraCSV } from "@/lib/manutencao/csv"

function equipamentoVazio(): Equipamento {
  return {
    id: novoId("eq"),
    tag: "",
    tipo: "servomotor",
    fabricante: "",
    modelo: "",
    numeroSerie: "",
    setor: "",
    maquina: "",
    eixo: "",
    status: "operando",
    criticidade: "media",
    instaladoEm: new Date().toISOString().slice(0, 10),
    horasOperacao: 0,
    freio: false,
  }
}

export default function PaginaEquipamentos() {
  const { db, salvarEquipamento, removerEquipamento } = useManutencao()
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroSetor, setFiltroSetor] = useState("todos")
  const [emEdicao, setEmEdicao] = useState<Equipamento | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<Equipamento | null>(null)

  const setores = useMemo(
    () => Array.from(new Set(db.equipamentos.map((e) => e.setor))).sort(),
    [db.equipamentos],
  )

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return db.equipamentos
      .filter((e) => (filtroTipo === "todos" ? true : e.tipo === filtroTipo))
      .filter((e) => (filtroStatus === "todos" ? true : e.status === filtroStatus))
      .filter((e) => (filtroSetor === "todos" ? true : e.setor === filtroSetor))
      .filter((e) =>
        termo
          ? [e.tag, e.modelo, e.fabricante, e.maquina, e.numeroSerie]
              .join(" ")
              .toLowerCase()
              .includes(termo)
          : true,
      )
      .sort((a, b) => a.tag.localeCompare(b.tag))
  }, [db.equipamentos, busca, filtroTipo, filtroStatus, filtroSetor])

  const osAbertasPorEquipamento = useMemo(() => {
    const mapa = new Map<string, number>()
    db.ordens
      .filter((o) => !["concluida", "cancelada"].includes(o.status))
      .forEach((o) => mapa.set(o.equipamentoId, (mapa.get(o.equipamentoId) ?? 0) + 1))
    return mapa
  }, [db.ordens])

  function exportar() {
    const csv = paraCSV(lista, [
      { chave: "tag", titulo: "TAG" },
      { chave: "tipo", titulo: "Tipo" },
      { chave: "fabricante", titulo: "Fabricante" },
      { chave: "modelo", titulo: "Modelo" },
      { chave: "numeroSerie", titulo: "Número de série" },
      { chave: "setor", titulo: "Setor" },
      { chave: "maquina", titulo: "Máquina" },
      { chave: "eixo", titulo: "Eixo/função" },
      { chave: "status", titulo: "Status" },
      { chave: "criticidade", titulo: "Criticidade" },
      { chave: "horasOperacao", titulo: "Horas de operação" },
      { chave: "instaladoEm", titulo: "Instalado em" },
    ])
    baixarArquivo("equipamentos.csv", csv)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo="Equipamentos"
        descricao="Cadastro técnico de servomotores e servodrives do parque fabril."
        acoes={
          <>
            <Botao variante="secundario" onClick={exportar}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Botao>
            <Botao onClick={() => setEmEdicao(equipamentoVazio())}>
              <Plus className="h-4 w-4" />
              Novo equipamento
            </Botao>
          </>
        }
      />

      <Cartao className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Entrada
              placeholder="Buscar por TAG, modelo, série..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Selecao value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="servomotor">Servomotores</option>
            <option value="servodrive">Servodrives</option>
          </Selecao>
          <Selecao value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            {Object.entries(rotuloStatusEquipamento).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
          <Selecao value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)}>
            <option value="todos">Todos os setores</option>
            {setores.map((setor) => (
              <option key={setor} value={setor}>
                {setor}
              </option>
            ))}
          </Selecao>
        </div>
      </Cartao>

      <Cartao>
        {lista.length === 0 ? (
          <Vazio mensagem="Nenhum equipamento encontrado com os filtros aplicados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">TAG / modelo</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Local</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Criticidade</th>
                  <th className="px-5 py-3 font-medium">Horas</th>
                  <th className="px-5 py-3 font-medium">OS abertas</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/manutencao/equipamentos/${eq.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {eq.tag}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {eq.fabricante} {eq.modelo}
                      </p>
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-700">{eq.tipo}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {eq.maquina}
                      <p className="text-xs text-slate-500">
                        {eq.setor} · {eq.eixo}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <Etiqueta {...rotuloStatusEquipamento[eq.status]} />
                    </td>
                    <td className="px-5 py-3">
                      <Etiqueta {...rotuloCriticidade[eq.criticidade]} />
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {eq.horasOperacao.toLocaleString("pt-BR")} h
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {osAbertasPorEquipamento.get(eq.id) ?? 0}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Botao
                          variante="fantasma"
                          onClick={() => setEmEdicao(eq)}
                          aria-label={`Editar ${eq.tag}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Botao>
                        <Botao
                          variante="fantasma"
                          onClick={() => setConfirmarExclusao(eq)}
                          aria-label={`Excluir ${eq.tag}`}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Botao>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      {emEdicao ? (
        <FormularioEquipamento
          equipamento={emEdicao}
          onFechar={() => setEmEdicao(null)}
          onSalvar={(eq) => {
            salvarEquipamento(eq)
            setEmEdicao(null)
          }}
        />
      ) : null}

      <Modal
        aberto={Boolean(confirmarExclusao)}
        titulo="Excluir equipamento"
        descricao="As ordens de serviço, planos e medições vinculados também serão removidos."
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
                if (confirmarExclusao) removerEquipamento(confirmarExclusao.id)
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
          <strong className="text-slate-900">{confirmarExclusao?.tag}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function FormularioEquipamento({
  equipamento,
  onFechar,
  onSalvar,
}: {
  equipamento: Equipamento
  onFechar: () => void
  onSalvar: (eq: Equipamento) => void
}) {
  const [dados, setDados] = useState<Equipamento>(equipamento)
  const alterar = <K extends keyof Equipamento>(campo: K, valor: Equipamento[K]) =>
    setDados((atual) => ({ ...atual, [campo]: valor }))
  const valido = dados.tag.trim() && dados.modelo.trim() && dados.fabricante.trim()

  return (
    <Modal
      aberto
      titulo={equipamento.tag ? `Editar ${equipamento.tag}` : "Novo equipamento"}
      descricao="Dados de identificação, localização e placa do equipamento."
      onFechar={onFechar}
      largura="max-w-3xl"
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
        <Campo rotulo="TAG *">
          <Entrada
            value={dados.tag}
            onChange={(e) => alterar("tag", e.target.value.toUpperCase())}
            placeholder="SM-USI-01"
          />
        </Campo>
        <Campo rotulo="Tipo *">
          <Selecao
            value={dados.tipo}
            onChange={(e) => alterar("tipo", e.target.value as Equipamento["tipo"])}
          >
            <option value="servomotor">Servomotor</option>
            <option value="servodrive">Servodrive</option>
          </Selecao>
        </Campo>
        <Campo rotulo="Fabricante *">
          <Entrada
            value={dados.fabricante}
            onChange={(e) => alterar("fabricante", e.target.value)}
            placeholder="Yaskawa, Fanuc, Siemens..."
          />
        </Campo>
        <Campo rotulo="Modelo *">
          <Entrada value={dados.modelo} onChange={(e) => alterar("modelo", e.target.value)} />
        </Campo>
        <Campo rotulo="Número de série">
          <Entrada
            value={dados.numeroSerie}
            onChange={(e) => alterar("numeroSerie", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Setor">
          <Entrada value={dados.setor} onChange={(e) => alterar("setor", e.target.value)} />
        </Campo>
        <Campo rotulo="Máquina">
          <Entrada value={dados.maquina} onChange={(e) => alterar("maquina", e.target.value)} />
        </Campo>
        <Campo rotulo="Eixo / função">
          <Entrada value={dados.eixo} onChange={(e) => alterar("eixo", e.target.value)} />
        </Campo>
        <Campo rotulo="Status">
          <Selecao
            value={dados.status}
            onChange={(e) => alterar("status", e.target.value as Equipamento["status"])}
          >
            {Object.entries(rotuloStatusEquipamento).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo.texto}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo rotulo="Criticidade">
          <Selecao
            value={dados.criticidade}
            onChange={(e) =>
              alterar("criticidade", e.target.value as Equipamento["criticidade"])
            }
          >
            <option value="alta">Crítico</option>
            <option value="media">Importante</option>
            <option value="baixa">Auxiliar</option>
          </Selecao>
        </Campo>
        <Campo rotulo="Instalado em">
          <Entrada
            type="date"
            value={dados.instaladoEm}
            onChange={(e) => alterar("instaladoEm", e.target.value)}
          />
        </Campo>
        <Campo rotulo="Horas de operação">
          <Entrada
            type="number"
            min={0}
            value={dados.horasOperacao}
            onChange={(e) => alterar("horasOperacao", Number(e.target.value))}
          />
        </Campo>
      </div>

      <h4 className="mt-6 mb-3 text-sm font-semibold text-slate-900">
        {dados.tipo === "servomotor" ? "Dados de placa do motor" : "Dados de placa do drive"}
      </h4>

      {dados.tipo === "servomotor" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Potência (kW)">
            <Entrada
              type="number"
              step="0.1"
              value={dados.potenciaKw ?? ""}
              onChange={(e) => alterar("potenciaKw", Number(e.target.value))}
            />
          </Campo>
          <Campo rotulo="Torque nominal (N·m)">
            <Entrada
              type="number"
              step="0.01"
              value={dados.torqueNominalNm ?? ""}
              onChange={(e) => alterar("torqueNominalNm", Number(e.target.value))}
            />
          </Campo>
          <Campo rotulo="Rotação nominal (rpm)">
            <Entrada
              type="number"
              value={dados.rotacaoNominalRpm ?? ""}
              onChange={(e) => alterar("rotacaoNominalRpm", Number(e.target.value))}
            />
          </Campo>
          <Campo rotulo="Corrente nominal (A)">
            <Entrada
              type="number"
              step="0.1"
              value={dados.correnteNominalA ?? ""}
              onChange={(e) => alterar("correnteNominalA", Number(e.target.value))}
            />
          </Campo>
          <Campo rotulo="Tipo de encoder">
            <Entrada
              value={dados.tipoEncoder ?? ""}
              onChange={(e) => alterar("tipoEncoder", e.target.value)}
              placeholder="Absoluto 20 bits, resolver..."
            />
          </Campo>
          <Campo rotulo="Grau de proteção">
            <Entrada
              value={dados.grauProtecao ?? ""}
              onChange={(e) => alterar("grauProtecao", e.target.value)}
              placeholder="IP65"
            />
          </Campo>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(dados.freio)}
              onChange={(e) => alterar("freio", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Possui freio eletromagnético
          </label>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Tensão de alimentação (V)">
            <Entrada
              type="number"
              value={dados.tensaoV ?? ""}
              onChange={(e) => alterar("tensaoV", Number(e.target.value))}
            />
          </Campo>
          <Campo rotulo="Corrente de saída (A)">
            <Entrada
              type="number"
              step="0.1"
              value={dados.correnteSaidaA ?? ""}
              onChange={(e) => alterar("correnteSaidaA", Number(e.target.value))}
            />
          </Campo>
          <Campo rotulo="Versão de firmware">
            <Entrada
              value={dados.firmware ?? ""}
              onChange={(e) => alterar("firmware", e.target.value)}
            />
          </Campo>
          <Campo rotulo="Modo de controle">
            <Entrada
              value={dados.modoControle ?? ""}
              onChange={(e) => alterar("modoControle", e.target.value)}
              placeholder="Posição, velocidade, torque..."
            />
          </Campo>
          <Campo rotulo="Realimentação">
            <Entrada
              value={dados.realimentacao ?? ""}
              onChange={(e) => alterar("realimentacao", e.target.value)}
              placeholder="Encoder absoluto, DRIVE-CLiQ..."
            />
          </Campo>
        </div>
      )}

      <Campo rotulo="Observações" className="mt-4">
        <AreaTexto
          value={dados.observacoes ?? ""}
          onChange={(e) => alterar("observacoes", e.target.value)}
          placeholder="Particularidades de instalação, histórico relevante, cuidados especiais..."
        />
      </Campo>

      <p className="mt-3 text-xs text-slate-500">
        Instalado em {formatarData(dados.instaladoEm)} · {dados.horasOperacao.toLocaleString("pt-BR")} h
        de operação acumuladas.
      </p>
    </Modal>
  )
}
