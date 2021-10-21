import { Candle } from "../../types/Candle"
import logger from "../../utils/logger"
import GenericModel from "../genericModel"

class SMA extends GenericModel {
  private values: Candle[] = []
  private window: number = 0
  private step: number = 0
  private position: string = ''
  private referenceParams: {
    toBuy: keyof Candle| 'currentValue',
    toSell: keyof Candle| 'currentValue'
  } = {
    toBuy: 'high',
    toSell: 'low'
  }
  current: number[] = []

  config(initialValues: Candle[], window: number, parameter: {
    toBuy: keyof Candle | 'currentValue',
    toSell: keyof Candle | 'currentValue'
  }) {
    logger.log('MODELS', `SMA - initializing`)

    this.values = initialValues
    this.window = window
    this.step = window - 1
    this.referenceParams = parameter
    this.initialCalculate()
    logger.log('MODELS', `SMA - initialized`)
  }

  checkIfIsBelow() {
    const currentSMA = this.current.slice(this.current.length - this.window)
    const currentValues = this.values.slice(this.current.length - this.window)
    const key = this.getKey()
    const comparedValues = currentValues.map((candle, index) => {
      const smaValue = currentSMA[index]
      if (candle[key] > smaValue){
        return 'above'
      } else if (candle[key] < smaValue) {
        return 'below'
      } else {
        return 'equal'
      }
    })
    const lastIndex =  comparedValues.length-1

    if (comparedValues[0] === 'above' && comparedValues[lastIndex] === 'above') {
      return false
    }
    if (comparedValues[0] === 'below' && comparedValues[lastIndex] === 'above') {
      return false
    }
    if (comparedValues[0] === 'above' && comparedValues[lastIndex] === 'below') {
      return true
    }
    if (comparedValues[0] === 'below' && comparedValues[lastIndex] === 'below') {
      return true
    }
    return currentSMA[lastIndex] > currentValues[lastIndex][key] ? true : false
  }

  private calculateSMA(index: number) {
    const startInterval = index - this.step
    const endInterval = index + 1
    const key = this.getKey()
    const intervalValues = this.values.slice(startInterval, endInterval)
    return intervalValues.reduce((total, curr) => total + curr[key], 0) / this.window
  }

  private initialCalculate() {
    if (this.values.length < this.window) {
      throw new Error(`Not enough data for a ${window} window`)
    }

    this.current = this.values.map((_, index) => {
      if (index < this.step) {
        return 0
      }
      return this.calculateSMA(index)
    })
  }

  opinion() {
    const currentWindow = this.current.slice(this.current.length - this.window - 1)
    
    let positive = 0
    let negative = 0

    currentWindow.forEach((value, index, allCandle) => {
      if(index===0) {
        return null
      }
      const increased = value / allCandle[index-1]
      if (increased > 1){
        ++positive
      } else if( increased < 1) {
        ++negative
      }
    })
    if (positive === this.window) {
      return "STRONG BUY"
    } else if (positive > negative) {
      return "BUY"
    } else if (positive === negative) {
      return "SUPPORT"
    } else if (positive < negative) {
      return "SELL"
    } else {
      return "STRONG SELL"
    }

  }
  
  private getKey() {
    return this.position === 'BUY' ? this.referenceParams.toSell as keyof Candle :  this.referenceParams.toBuy as keyof Candle
  }

  updatePosition (position: 'BUY' | 'SELL') {
    this.position = position
    this.initialCalculate()
  }

  update(newValue: Candle) {
    logger.log('MODELS', `SMA - updating...`)
    const key = this.getKey()
    logger.log('MODELS', `SMA - using ${key} price`)
    let lastIndex = this.values.length - 1

    if (this.values[lastIndex][key] === newValue[key]){
      logger.log('MODELS', `SMA - no changes`)
      return
    }
    this.values.push(newValue)
    lastIndex = this.values.length - 1
    const currentSMAValue = this.calculateSMA(lastIndex)
    logger.log('MODELS', `SMA - last coin value ${newValue[key]}`)
    logger.log('MODELS', `SMA - last sma value ${currentSMAValue}`)

    this.current.push(currentSMAValue)
    this.log()
  }

  currentSMA() {
    const current = this.current.slice(this.current.length - this.window)
    
    return current.join(' - ')
  }

  log() {
    const current = this.values.slice(this.current.length - this.window)
    const key = this.getKey()

    const parsed = current.reduce((str, candle) => {
      return `${str}-${candle[key]}`
    }, '')
    console.table([{ "current SMA": this.currentSMA(), "Last high": this.values[this.values.length-1].high }])
    console.table([{ "current prices": parsed, "Last high": current[this.current.length-1][key] }])
  }
}

export default SMA