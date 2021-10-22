export type Window = 1 | 2 | 3 | 4 | 5 | 10 | 15 | 20 | 30 | 40 | 50 | 100 | 200 | 300
export type CandleSize = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M"
export type Coins = 'BTCUSDT' | 'BNBBTC' | 'BTCBNB' | 'ADABUSD'

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  closeTime: number
  assetVolume: number
  trades: number
  buyBaseVolume: number
  buyAssetVolume: number
  ignored: number
}