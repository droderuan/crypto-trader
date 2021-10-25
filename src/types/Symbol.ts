export type Symbols = 'BTCUSDT' | 'BNBBTC' | 'BTCBNB' | 'ADABUSD' | 'SHIBBUSD' | 'BTCBUSD' | 'BNBBUSD'

export interface SymbolInfo {
  symbol: Symbols,
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