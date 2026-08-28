# ServoManut — Sistema de gestão de manutenção de servomotores e servodrives

Aplicação web (CMMS) para controlar o parque de servomotores e servodrives de uma
planta industrial: cadastro técnico, ordens de serviço, planos preventivos,
estoque de sobressalentes, catálogo de falhas por fabricante e indicadores de
desempenho.

Acesse em **`/manutencao`** (ex.: `http://localhost:3000/manutencao`).

## Módulos

| Rota | Módulo | O que faz |
| --- | --- | --- |
| `/manutencao` | Painel | KPIs (MTBF, MTTR, disponibilidade, custo, cumprimento do preventivo), gráficos de OS por mês e por tipo, ranking de equipamentos com maior parada e central de alertas. |
| `/manutencao/equipamentos` | Equipamentos | Cadastro de servomotores e servodrives com dados de placa, localização, criticidade, status e horas de operação. Busca, filtros e exportação CSV. |
| `/manutencao/equipamentos/[id]` | Ficha do equipamento | Ficha técnica completa, indicadores do ativo, histórico de intervenções, planos vinculados e monitoramento preditivo (temperatura, vibração, corrente, isolação) com gráfico de tendência e limite de alarme. |
| `/manutencao/ordens` | Ordens de serviço | Abertura, edição, mudança de status e exclusão de OS (preventiva, corretiva, preditiva, calibração, melhoria) com sintoma, diagnóstico, causa raiz, ações, horas de parada/mão de obra, peças aplicadas e custos. |
| `/manutencao/planos` | Planos preventivos | Rotinas por calendário e/ou por horas de operação, checklist de execução, situação (em dia / vence em breve / vencido) e geração de OS a partir do plano. |
| `/manutencao/estoque` | Peças e estoque | Sobressalentes (encoders, rolamentos, ventoinhas, módulos IGBT, cabos, baterias de encoder...) com ponto de ressuprimento, movimentação de entrada/saída e valor imobilizado. |
| `/manutencao/falhas` | Catálogo de falhas | Códigos de alarme de servodrives Yaskawa, Fanuc, Siemens, Mitsubishi, Allen-Bradley e WEG, com causas prováveis e roteiro de ações. Permite abrir uma OS já com o alarme preenchido. |
| `/manutencao/relatorios` | Relatórios | Indicadores por período (30/90/180/365 dias) e por setor, causas raiz recorrentes, alarmes mais frequentes, desempenho por equipamento e por técnico, exportação CSV e backup/restauração em JSON. |

## Regras de negócio implementadas

- **Conclusão de OS**: dá baixa automática no estoque das peças aplicadas, devolve o
  equipamento para `operando` e atualiza a data (e as horas) da última execução do
  plano vinculado.
- **Início de execução**: o equipamento passa automaticamente para `em manutenção`.
- **Numeração de OS**: sequencial por ano (`OS-2026-0001`), calculada a partir das
  ordens já existentes.
- **Vencimento de planos**: `próxima execução = última execução + intervalo em dias`;
  planos com intervalo em horas também exibem o percentual do intervalo consumido
  com base nas horas de operação do equipamento.
- **Alertas**: planos vencidos ou a vencer em até 15 dias, peças abaixo do estoque
  mínimo e leituras preditivas que atingiram 90% do limite de alarme.

## Indicadores

- **MTBF** — horas de operação por equipamento divididas pelo número de falhas
  (corretivas concluídas) no período.
- **MTTR** — média das horas de parada das corretivas concluídas.
- **Disponibilidade** — `(horas calendário − horas de parada) / horas calendário`,
  considerando 2 turnos (16 h/dia, 22 dias/mês) para os equipamentos ativos.
- **Cumprimento do preventivo** — preventivas concluídas sobre preventivas abertas
  no período.

## Arquitetura

```
app/manutencao/           Rotas (App Router) — painel, equipamentos, ordens, planos,
                          estoque, falhas, relatórios
components/manutencao/    UI (cartões, modais, campos, etiquetas), navegação e
                          gráficos em SVG puro
lib/manutencao/types.ts   Modelo de domínio
lib/manutencao/seed.ts    Base de demonstração (12 equipamentos, 14 OS, 7 planos,
                          12 peças, 14 códigos de falha, medições preditivas)
lib/manutencao/store.tsx  Contexto React com persistência em localStorage e regras
                          de negócio
lib/manutencao/metrics.ts Cálculo de KPIs, vencimentos e rankings
lib/manutencao/format.ts  Formatação pt-BR, rótulos e cores de status
lib/manutencao/csv.ts     Exportação CSV/JSON
```

## Persistência

Os dados ficam no `localStorage` do navegador (chave `servomanut:db:v1`), o que
permite usar o sistema sem backend. Em *Relatórios* é possível exportar um backup
JSON, importar um backup e restaurar a base de demonstração.

Para migrar para um backend real, basta substituir as funções de leitura/escrita de
`lib/manutencao/store.tsx` por chamadas de API — o restante da aplicação consome
apenas o contexto `useManutencao()`.

## Executar localmente

```bash
pnpm install   # ou npm install
pnpm dev       # http://localhost:3000/manutencao
```
