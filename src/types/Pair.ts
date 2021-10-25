export type Pairs = 'BTCUSDT' | 'BNBBTC' | 'BTCBNB' | 'ADABUSD' | 'SHIBBUSD' | 'BTCBUSD' | 'BNBBUSD'

export interface PairInfo {
  symbol: Pairs,
  status: string,
  buyCoin: string
  buyCoinPrecision: number
  sellCoin: string
  sellCoinPrecision: number
  minQty: number
  maxQty: number
  stepSize: number
  precisionRound: number
}