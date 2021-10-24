import models from "../models";
import { SmaConfig } from "../models/arithmeticModels/sma";
import { SmaCrossOverConfig } from "../models/arithmeticModels/smaCrossover";
import { Candle, CandleSize, Coins } from "../../types/Candle";
import { Position } from "./Referee";

interface SMA {
  modelName: 'SMA',
  modelConfig: SmaConfig
}

interface SMACrossover {
  modelName: 'SMA Crossover',
  modelConfig: SmaCrossOverConfig
}

type modelConfig = SMA | SMACrossover

interface BotConfigParams {
  buyWith: string
  sellWith: string
  symbol: Coins
  binanceApiKey: string
  binanceApiSecret: string
  model: modelConfig
  candleSize: CandleSize
  updateInterval: number
  candleInterval: number
  startPosition: Position
  coinPrecision: number
  coinStep: number
  
}

class BotConfig {
  config: BotConfigParams

  constructor(config: BotConfigParams) {
    this.config = config
  }
}

export default BotConfig