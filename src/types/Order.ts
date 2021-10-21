
export interface orderBuyParams{
  type: 'BUY'
  params: {
    value: number
    pair: number}

}

export interface orderSellParams {
  type: 'SELL'
  params: {
    value: number
    pair: number
  }
}