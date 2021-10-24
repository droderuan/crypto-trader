import { Candle, Window } from "../../types/Candle"
import logger from "../../utils/logger"
import GenericModel from "../genericModel"

export interface SmaConfig {
  window: Window
  reference: {
    toBuy: keyof Candle | 'current',
    toSell: keyof Candle | 'current'
  }
}

class SMA extends GenericModel {
  private candles: Candle[] = []
  private window: number = 0
  private step: number = 0
  private candleReferenceValue: keyof Candle | 'current'  = 'close'
  smaValues: number[] = []

  config(initialValues: Candle[], params: SmaConfig) {
    logger.log('MODELS', `SMA - initializing`)

    this.candles = initialValues
    this.window = params.window
    this.step = params.window - 1
    this.initialCalculate()

    logger.log('MODELS', `SMA - initialized`)
  }

  private calculate(index: number) {
    const startInterval = index - this.step
    const endInterval = index + 1
    const intervalValues = this.candles.slice(startInterval, endInterval)
    return intervalValues.reduce((total, curr) => total + curr[this.candleReferenceValue], 0) / this.window
  }

  private initialCalculate() {
    if (this.candles.length < this.window) {
      throw new Error(`Not enough data for a ${window} window`)
    }

    this.smaValues = this.candles.map((_, index) => {
      if (index < this.step) {
        return 0
      }
      return this.calculate(index)
    })
  }

  updateCandleReferenceValue (referenceValue: keyof Candle | 'current') {
    this.candleReferenceValue = referenceValue
    this.initialCalculate()
  }

  verifyOpportunity(candle: Candle): 'TO_BUY' | 'TO_SELL' | 'NOTHING' {
    logger.log('MODELS', `SMA - checking if candle is above or below`)
    this.log()
    const lastSmaValue = this.smaValues[this.smaValues.length-1]
    if (candle[this.candleReferenceValue] > lastSmaValue) {
      return 'TO_BUY'
    } else if (candle[this.candleReferenceValue] < lastSmaValue) {
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  update(newCandle: Candle, log=true) {
    logger.log('MODELS', `SMA - updating model..`)

    let lastIndex = this.candles.length - 1
    if (this.candles[lastIndex][this.candleReferenceValue] === newCandle[this.candleReferenceValue]){
      logger.log('MODELS', `SMA - no changes`)
      log && this.log()
      return
    }

    this.candles.push(newCandle)
    ++lastIndex

    const currentSMAValue = this.calculate(lastIndex)

    logger.log('MODELS', `SMA - last coin value ${newCandle[this.candleReferenceValue]}`)
    logger.log('MODELS', `SMA - last sma value ${currentSMAValue}`)

    this.smaValues.push(currentSMAValue)
    log && this.log()
  }

  lastSma() {
    return this.smaValues[this.smaValues.length -1]
  }

  currentSMA() {
    const current = this.smaValues.slice(this.smaValues.length - this.window)
    
    return current.join(' - ')
  }

  log() {
    const currentCandle = this.candles.slice(this.smaValues.length - this.window)

    const parsed = currentCandle.reduce((str, candle) => {
      return str.length > 1 ? `${str} - ${candle[this.candleReferenceValue]}` : String(candle[this.candleReferenceValue])
    }, '')

    logger.log('MODELS', `SMA - using ${this.candleReferenceValue} price`)
    console.table({
      "current SMA": this.currentSMA(),
      "current prices": parsed, 
      [`Last ${this.candleReferenceValue}`]: currentCandle[currentCandle.length-1][this.candleReferenceValue]
    })
  }
}

export default SMA