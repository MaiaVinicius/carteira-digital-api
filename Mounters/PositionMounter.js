const example = {
  update_at: null,
  positions: [
    {
      description: "Nome da conta",
      totalAmount: 99.99,
      quantity: 1,
      unitPrice: 99.99,
      amountCurrency: "BRL",
      initialAmount: 0,
      averagePrice: 0,
      investment: {
        category: null,
        subType: null
      },
      external_id: 123,
      position_type: 1, //1- Conta corrente ; 2- Posicao
      bankDetails: {
        agency: '0001',
        account: '***812',
        accountDigit: '6',
        bankId: null
      }
    }
  ],
  movements: []
}


module.exports = (params) => {
  return params;
}