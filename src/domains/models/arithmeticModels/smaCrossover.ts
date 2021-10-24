import { Candle, Window } from "../../types/Candle";
import logger from "../../utils/logger";
import GenericModel, { modelDecision } from "../genericModel";
import SMA, { SmaConfig } from "./sma";

export interface SmaCrossOverConfig {
  reference?: 'current'
  slower?: Omit<SmaConfig, 'reference'>
  faster?: Omit<SmaConfig, 'reference'>
}

class SmaCrossOver extends GenericModel {
  private faster: SMA = null as any
  private slower: SMA = null as any

  updateCandleReferenceValue (referenceValue: keyof Candle) {
    this.faster.updateCandleReferenceValue(referenceValue)
    this.slower.updateCandleReferenceValue(referenceValue)
  }

  config(initialValues: Candle[], params: SmaCrossOverConfig) {
    if(!params.faster || !params.slower) {
      throw new Error("Undefined params");
    }

    logger.log('MODELS', `Crossover - initializing`)

    this.faster = new SMA()
    this.faster.config(initialValues, {
      window: params.faster.window,
      reference: {
        toBuy: 'current',
        toSell: 'current'
      }
    })
    
    this.slower = new SMA()
    this.slower.config(initialValues, {
      window: params.slower.window,
      reference: {
        toBuy: 'current',
        toSell: 'current'
      }
    })

    logger.log('MODELS', `Crossover - initialized`)

  }

  verifyOpportunity(): modelDecision {
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

  async update(newCandle: Candle) {
    logger.log('MODELS', `SMA Crossover - updating faster model`)
    this.faster.update(newCandle, false)
    logger.log('MODELS', `SMA Crossover - updating slower model`)
    this.slower.update(newCandle, false)
    this.log()
  }

  log() {
    const currentFasterSmaValue = this.faster.currentSMA()
    const currentSlowerSmaValue = this.slower.currentSMA()

    logger.log('MODELS', `SMA Crossover`)
    console.table({
      "current faster SMA": currentFasterSmaValue,
      "current slower SMA": currentSlowerSmaValue,
    })
  }
}

export default SmaCrossOver