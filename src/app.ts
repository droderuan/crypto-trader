import BinanceClient from './client/Binance'
import { Candle, candleSize, window } from './types/Candle'
import logger from './utils/logger'
import models from './models'
import Order from './Core/Event'
import Wallet from './Core/Wallet'
import Referee from './Core/Referee'

interface AppConfig {
  binanceApiKey: string
  binanceApiSecret: string
  modelName: keyof typeof models
  window: window
  candleSize: candleSize
  updateInterval: number
  reference: {
    toBuy: keyof Candle | 'currentValue',
    toSell: keyof Candle | 'currentValue'
  }
}

class App {
  window
  updateInterval
  candleSize
  reference: {
    toBuy: keyof Candle | 'currentValue',
    toSell: keyof Candle | 'currentValue'
  }
  private binanceClient
  private models
  private wallet
  private order
  private referee

  constructor({window,reference, candleSize, updateInterval, binanceApiKey, binanceApiSecret, modelName}: AppConfig) {
    this.window = window
    this.updateInterval = updateInterval
    this.candleSize = candleSize
    this.models = models[modelName]
    this.reference = reference

    this.binanceClient = new BinanceClient({
      apiKey: binanceApiKey,
      apiSecret: binanceApiSecret,
      useServerTime: true
    })
    
    this.wallet = new Wallet(this.binanceClient)
    this.order = new Order(
      {
        BUY: [
          () => this.wallet.buy(),
          () => logger.log('EVENT', 'Start a buy'),
          () => this.models.updatePosition('BUY')
        ],
        SELL: [
          () => this.wallet.sell(),
          () => this.models.updatePosition('SELL')
        ]})
    this.referee = new Referee(10, 2, 5, this.order)
  }

  async start(cb: Function) {
      try {
        const candles = await this.binanceClient.getHistorical({ symbol: 'BTCUSDT', interval: this.candleSize, window: this.window })
        if (!candles) {
          logger.log('ERROR', 'Error while loading initial data')
          throw Error('No initial candle')
        }
        
        logger.log("APP", `Updating the price every ${this.updateInterval}ms from now`)
        this.models.config(candles, this.window, this.reference)
        
        cb()
      } catch (err) {
        logger.log('ERROR', 'Error while loading initial data')
      }
  }

  async startObserve() {
    this.binanceClient.wait(() => {

      setInterval(async () => {
        
        logger.log("APP", "Updating the price")
        try {
          const candle = await this.binanceClient.getLastCandle({ symbol: 'BTCUSDT', interval: this.candleSize })
          if (!candle) {
            return
          }
          this.models.update(candle[0])
          this.referee.updateDecision(null, this.models.checkIfIsBelow())
        } catch (err) {
          logger.log('ERROR', 'on get last candle')
        }
        }, this.updateInterval)
    })
  }
}

export default App