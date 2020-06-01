const example = {
  update_at: null,
  positions: [
    {
      description: "Nome da conta",
      total_amount: 99.99,
      quantity: 1,
      unit_price: 99.99,
      amount_urrency: "BRL",
      initial_amount: 0,
      averagePrice: 0,
      investment: {
        category: null,
        sub_type: null
      },
      external_id: 123,
      position_type: 1, //1- Conta corrente ; 2- Posicao
      bankDetails: {
        agency: '0001',
        account: '***812',
        account_digit: '6',
        bank_dd: null
      }
    }
  ],
  movements: [
    {
      movement_date: null,
      description: null,
      value: null,
      balance: null,
      code: null
    }
  ]
}


module.exports = (params) => {
  return params;
}