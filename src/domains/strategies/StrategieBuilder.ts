import strategies from ".";
import { binanceClient } from "../../main";
import { CandleInterval, Window } from "../../types/Candle";
import { Symbols } from "../../types/Symbol";
import AppError from "../../utils/AppError";
import logger from "../../utils/logger";
import { StrategieConfig } from "../app/BotConfig";

interface StrategieBuilderParams {
  strategieConfig: StrategieConfig,
  pair: Symbols
  candleSize: CandleInterval
}

export class StrategieBuilder {
  private pair!: Symbols
  private candleSize!: CandleInterval

  async build({ strategieConfig, pair, candleSize  }: StrategieBuilderParams){
    this.pair = pair
    this.candleSize = candleSize
    logger.log('STRATEGIE BUILDER', `Building strategie ${strategieConfig.name}`)

    const strategie = await this.buildStrategie(strategieConfig)

    if(strategie === undefined){
      throw new AppError('STRATEGIE BUILDER', `Strategie ${strategieConfig.name} could not be started`)
    }

    logger.log('STRATEGIE BUILDER', 'Build finish')
    return strategie
  }

  private async buildStrategie(strategieConfig: StrategieConfig) {
    if(strategieConfig.name === 'Simple SMA'){
      const Strategie = strategies[strategieConfig.name]
      const candle = await this.getHistoricalCandleStick(strategieConfig.config.window)
      const appStrategie = new Strategie()
      appStrategie.config(candle, strategieConfig.config)
      return appStrategie
    } else if(strategieConfig.name === 'SMA Crossover'){
      const Strategie = strategies[strategieConfig.name]
      const candle = await this.getHistoricalCandleStick(strategieConfig.config.slower.window)
      const appStrategie = new Strategie()
      appStrategie.config(candle, strategieConfig.config)
      return appStrategie
    }
  }
 
  private async getHistoricalCandleStick(window: Window) {
    logger.log('STRATEGIE BUILDER', 'Loading historical candlestick data')

    const candles = await binanceClient.getHistorical({ 
      symbol: this.pair,
      interval: this.candleSize,
      window: window})
    if (!candles) {
      logger.log('STRATEGIE BUILDER', 'Error while loading initial data')
      throw Error('No initial candle')
    }
    return candles
  }
}