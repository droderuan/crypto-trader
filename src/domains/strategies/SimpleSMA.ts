import { Candlestick, CandleStickReference, Window } from "../../types/Candle";
import logger from "../../utils/logger";
import SMA from "../indicators/arithmeticModels/sma";
import { GenericStrategie, StrategieDecision } from "./types";

export interface SimpleSmaConfig {
  window: Window
  reference: {
    toBuy: CandleStickReference,
    toSell: CandleStickReference
  }
}

export class SimpleSMA extends GenericStrategie {
  sma: SMA = null as any

  config(initialValues: Candlestick[], params: SimpleSmaConfig) {
    logger.log('STRATEGIE', `Simple SMA - initialized`)

    this.sma = new SMA()
    this.sma.config(initialValues, params)

    logger.log('STRATEGIE', `Simple SMA - initialized`)
  }

  decision(): StrategieDecision {
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

  verifyOpportunity(candle: Candlestick) {
    logger.log('STRATEGIE', `Simple SMA - checking if candle is above or below`)
    const smaValues = this.sma.smaValues
    const candleReference = this.sma.getCandleReference()
    const lastSmaValue = smaValues[smaValues.length-1]
    if (candle[candleReference] > lastSmaValue) {
      return 'TO_BUY'
    } else if (candle[candleReference] < lastSmaValue) {
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  updateCandleReferenceValue (referenceValue: CandleStickReference) {
    this.sma.updateCandleReferenceValue(referenceValue)
  }

  log() {
    logger.log('STRATEGIE', `SIMPLE SMA`)
    this.sma.log()
  }
}
