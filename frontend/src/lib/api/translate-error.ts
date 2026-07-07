const PATTERNS: [RegExp, string | ((match: RegExpMatchArray) => string)][] = [
  [/^Transport type .+ is not authorized for customer .+\.$/, "O tipo de transporte selecionado não está autorizado para este cliente."],
  [/^Invalid status transition: (.+) -> (.+)\.$/, (m) => `Transição de status inválida: ${m[1]} -> ${m[2]}.`],
  [
    /^The sales order cannot move to SCHEDULED without a confirmed scheduling\.$/,
    "A Ordem de Venda só pode avançar para AGENDADA com um agendamento confirmado.",
  ],
  [
    /^Transport type cannot be changed while the sales order is in status (.+)\.$/,
    (m) => `O transporte não pode ser alterado enquanto a Ordem de Venda estiver no status ${m[1]}.`,
  ],
  [/^Duplicate items are not allowed in the same sales order\.$/, "Não é permitido repetir o mesmo item na Ordem de Venda."],
  [/^Item\(s\) not found: .+$/, "Um ou mais itens informados não foram encontrados."],
  [/^No scheduling defined yet for sales order .+\.$/, "Nenhum agendamento foi definido para esta Ordem de Venda ainda."],
  [/^Customer .+ not found\.$/, "Cliente não encontrado."],
  [/^Transport type .+ not found\.$/, "Tipo de transporte não encontrado."],
  [/^Sales order .+ not found\.$/, "Ordem de Venda não encontrada."],
  [/^Record not found\.$/, "Registro não encontrado."],
  [/^Duplicate value for field\(s\): (.+)$/, (m) => `Já existe um registro com o mesmo valor para: ${m[1]}.`],
  [
    /^Invalid reference: the related entity does not exist, or this record is still referenced by other data and cannot be removed\.$/,
    "Não é possível concluir a operação: o registro relacionado não existe ou este item ainda está sendo utilizado em outro cadastro (ex: Ordens de Venda).",
  ],
  [/^Error processing database request\.$/, "Erro ao processar a solicitação no banco de dados."],
  [/^Internal server error\.$/, "Erro interno do servidor."],
];

export function translateApiMessage(message: string): string {
  for (const [pattern, replacement] of PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      return typeof replacement === "function" ? replacement(match) : replacement;
    }
  }
  return message;
}
