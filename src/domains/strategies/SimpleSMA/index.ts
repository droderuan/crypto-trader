import { Candlestick, CandleStickReference, Window } from "../../../types/Candle";
import logger from "../../../utils/logger";
import SMA from "../../indicators/arithmeticModels/SMA";
import { Position } from "../../observer/Referee";
import { GenericStrategy, StrategyDecision } from "../types";

export interface SimpleSmaConfig {
  window: Window
  reference: {
    toBuy: CandleStickReference,
    toSell: CandleStickReference
  }
}

export class SimpleSMA extends GenericStrategy {
  sma: SMA = null as any
  params!: SimpleSmaConfig

  config(initialValues: Candlestick[], params: SimpleSmaConfig) {
    logger.log('STRATEGIE', `Simple SMA - initialized`)

    this.sma = new SMA()
    this.sma.config({ initialValues, window: params.window })
    this.params = params

    logger.log('STRATEGIE', `Simple SMA - initialized`)
  }

  decision(): StrategyDecision {
    logger.log('STRATEGIE', `Simple SMA - checking if candle is above or below`)
    this.log()

    const candle = this.sma.lastCandle()
    const lastSmaValue = this.sma.lastSma()

    if (candle[this.sma.getCandleReference()] > lastSmaValue) {
      return 'TO_BUY'
    } else if (candle[this.sma.getCandleReference()] < lastSmaValue) {
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  async update(newCandle: Candlestick) {
    logger.log('STRATEGIE', `Simple SMA - updating indicator`)
    this.sma.update(newCandle, false)
    this.log()
  }

  verifyOpportunity() {
    logger.log('STRATEGIE', `Simple SMA - checking if candle is above or below`)
    const smaValues = this.sma.smaValues
    const candleReference = this.sma.getCandleReference()
    const lastSmaValue = smaValues[smaValues.length-1]
    const lastCandle = this.sma.lastCandle()
    if (lastCandle[candleReference] > lastSmaValue) {
      return 'TO_BUY'
    } else if (lastCandle[candleReference] < lastSmaValue) {
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  updateCandleReference(position: Position) {
    const reference = position === 'BOUGHT' ? this.params.reference.toSell : this.params.reference.toBuy

    this.sma.setReferenceValue(reference)
  }


  log() {
    logger.log('STRATEGIE', `SIMPLE SMA`)
    this.sma.log()
  }
}
