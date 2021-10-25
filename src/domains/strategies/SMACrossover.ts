import { CandleStickReference, Candlestick } from "../../types/Candle";
import logger from "../../utils/logger";
import { GenericStrategie, StrategieDecision } from "./types";
import SMA from "../indicators/arithmeticModels/sma";
import { SimpleSmaConfig } from "./SimpleSMA";

export interface SmaCrossOverConfig {
  slower: SimpleSmaConfig
  faster: SimpleSmaConfig
}

export class SmaCrossover extends GenericStrategie {
  private faster: SMA = null as any
  private slower: SMA = null as any

  updateCandleReferenceValue (referenceValue: CandleStickReference) {
    this.faster.updateCandleReferenceValue(referenceValue)
    this.slower.updateCandleReferenceValue(referenceValue)
  }

  config(initialValues: Candlestick[], params: SmaCrossOverConfig) {
    if(!params.faster || !params.slower) {
      throw new Error("Undefined params");
    }

    logger.log('STRATEGIE', `SMA Crossover - initializing`)

    this.faster = new SMA()
    this.faster.config(initialValues, params.faster)
    
    this.slower = new SMA()
    this.slower.config(initialValues, params.slower)

    logger.log('STRATEGIE', `SMA Crossover - initialized`)

  }

  decision(): StrategieDecision {
    const currentFasterSmaValue = this.faster.lastSma()
    const currentSlowerSmaValue = this.slower.lastSma()

    if(currentFasterSmaValue>currentSlowerSmaValue){
      return 'TO_BUY'
    }
    
    if(currentFasterSmaValue<currentSlowerSmaValue){
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  verifyOpportunity() {
    const currentFasterSmaValue = this.faster.lastSma()
    const currentSlowerSmaValue = this.slower.lastSma()

    if(currentFasterSmaValue>currentSlowerSmaValue){
      return 'TO_BUY'
    }
    if(currentFasterSmaValue<currentSlowerSmaValue){
      return 'TO_SELL'
    }
    return 'NOTHING'
  }

  async update(newCandle: Candlestick) {
    logger.log('STRATEGIE', `SMA Crossover - updating faster model`)
    this.faster.update(newCandle, false)
    logger.log('STRATEGIE', `SMA Crossover - updating slower model`)
    this.slower.update(newCandle, false)
    this.log()
  }

  log() {
    const currentFasterSmaValue = this.faster.currentSMA()
    const currentSlowerSmaValue = this.slower.currentSMA()

    logger.log('STRATEGIE', `SMA Crossover`)
    console.table({
      "current faster SMA": currentFasterSmaValue,
      "current slower SMA": currentSlowerSmaValue,
    })
  }
}