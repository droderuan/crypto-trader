import { Candle } from "../types/Candle";

export type modelDecision = 'TO_BUY' | 'TO_SELL' | 'NOTHING'

export default abstract class GenericModel {
  abstract config(...params: any): void

  abstract verifyOpportunity(candle: Candle): modelDecision

  abstract update(newCandle: Candle, log?: boolean): void

  abstract log(): void
}