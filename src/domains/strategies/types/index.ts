import { Candlestick } from "../../../types/Candle"

export type StrategieDecision = 'TO_BUY' | 'TO_SELL' | 'NOTHING'

export abstract class GenericStrategie {
  abstract config(...params: any): void

  abstract log(): void

  abstract update(newCandle: Candlestick): void

  abstract verifyOpportunity(candle: Candlestick): StrategieDecision
}

export type Strategies = 'Simple SMA' | 'SMA Crossover'