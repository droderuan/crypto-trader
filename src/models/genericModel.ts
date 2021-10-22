import { Candle } from "../types/Candle";

export type modelDecision = 'TO_BUY' | 'TO_SELL' | 'NOTHING'

export default abstract class GenericModel {
  abstract config(initialValues: Candle[], window: number, parameter: {
    toBuy: keyof Candle | 'currentValue',
    toSell: keyof Candle | 'currentValue'
  }): void

  abstract verifyOpportunity(candle: Candle): modelDecision

  abstract update(newCandle: Candle): void

  abstract log(): void
}