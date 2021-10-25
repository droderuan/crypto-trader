import { Candlestick, Window } from '../../types/Candle'
import strategies from '../strategies'
import logger from '../../utils/logger'
import OrderEventEmitter from '../event/Event'
import Referee from '../observer/Referee'
import BotConfig, { StrategieConfig } from './BotConfig'
import { binanceClient } from '../../main'
import UserWalletService from '../services/WalletUserService'
import CryptoAppService from '../services/cryptoAppService'
import AppError from '../../utils/AppError'
import { StrategieBuilder } from '../strategies/StrategieBuilder'

class App {
  botConfig: BotConfig

  constructor(botConfig: BotConfig) {
    this.botConfig = botConfig
  }

  async start(cb?: Function) {
    const { strategie: strategieConfig, symbol, candleSize } = this.botConfig.config
    const cryptoApp = new CryptoAppService()

    await cryptoApp.setSymbol(symbol)
    
    const strategieBuilder = new StrategieBuilder()
    const strategie = await strategieBuilder.build({
      strategieConfig, 
      pair: symbol, 
      candleSize
    })

    cryptoApp.setStrategie(strategie)

    cryptoApp.init()
  }
}

export default App