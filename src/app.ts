import BinanceClient from './client/Binance'
import { Candle, CandleSize, Coins, Window } from './types/Candle'
import logger from './utils/logger'
import models from './models'
import Order from './Core/Event'
import Wallet from './Core/Wallet'
import Referee, { Position } from './Core/Referee'

interface AppConfig {
  buyWith: string
  sellWith: string
  symbol: Coins
  binanceApiKey: string
  binanceApiSecret: string
  modelName: keyof typeof models
  window: Window
  candleSize: CandleSize
  updateInterval: number
  candleInterval: number
  startPosition: Position
  coinPrecision: number
  coinStep: number
  reference: {
    toBuy: keyof Candle,
    toSell: keyof Candle
  }
}

class App {
  window
  updateInterval
  candleInterval
  candleSize
  reference: {
    toBuy: keyof Candle,
    toSell: keyof Candle
  }
  startPosition: Position
  private symbol
  private binanceClient
  private models
  private wallet
  private order
  private referee

  constructor({window,reference,symbol, startPosition, buyWith, coinPrecision, coinStep, sellWith, candleSize, updateInterval,candleInterval, binanceApiKey, binanceApiSecret, modelName}: AppConfig) {
    this.window = window
    this.updateInterval = updateInterval
    this.candleInterval = candleInterval
    this.candleSize = candleSize
    this.models = models[modelName]
    this.reference = reference
    this.symbol = symbol
    this.startPosition = startPosition

    this.binanceClient = new BinanceClient({
      apiKey: binanceApiKey,
      apiSecret: binanceApiSecret,
      useServerTime: true
    })
    this.order = new Order()
    
    this.wallet = new Wallet({
      binanceClient: this.binanceClient,
      symbol: this.symbol,
      buyWith: buyWith,
      sellWith: sellWith,
      symbolPrecision: coinPrecision,
      minimumValue: coinStep,
      orderEvent: this.order
    })

    this.order.setListener({event: 'BUY', execute: () => logger.log('EVENT', 'Start a buy')})
    this.order.setListener({event: 'BUY', execute: () => this.wallet.buy(() => this.models.updateCandleReferenceValue(this.reference.toSell))})
    
    this.order.setListener({event: 'SELL', execute: () => logger.log('EVENT', 'Start a reverse')})
    this.order.setListener({event: 'SELL', execute: () => this.wallet.sell(() => this.models.updateCandleReferenceValue(this.reference.toBuy))})
    
    this.referee = new Referee(this.startPosition, 5, this.order)

    this.order.setListener({event: 'REVERT', execute: () => logger.log('EVENT', 'Start a reverse')})
    this.order.setListener({event: 'REVERT', execute: () => this.referee.reverse()})
  }

  async start(cb: Function) {
      try {
        const candles = await this.binanceClient.getHistorical({ symbol: this.symbol, interval: this.candleSize, window: this.window })
        if (!candles) {
          logger.log('ERROR', 'Error while loading initial data')
          throw Error('No initial candle')
        }
        
        this.models.config(candles, this.window)
        
        cb()
      } catch (err) {
        logger.log('ERROR', 'Error while loading initial data')
      }
  }

  async startObserve() {
    this.binanceClient.wait(() => {
      logger.log("APP", `Updating the model every ${this.candleInterval}ms from now`)
      setInterval(async () => {
        logger.log("APP", "Updating the model")
        try {
          const candle = await this.binanceClient.getLastCandle({ symbol: this.symbol, interval: this.candleSize })
          if (!candle) {
            return
          }
          this.models.update(candle)
        } catch (err) {
          logger.log('ERROR', 'on get last candle')
        }
        }, this.candleInterval)
    })
  }

  async startIntervalCheck() {
    logger.log("APP", `Updating the model decision every ${this.updateInterval}ms from now`)
    this.binanceClient.wait(() => {
      setInterval(async () => {
        logger.log("APP", "Verifying if there is a new candle value")
        try {
          const candle = await this.binanceClient.getLastCandle({ symbol: this.symbol, interval: this.candleSize })
          if (!candle) {
            return
          }
          this.referee.updateDecision(this.models.verifyOpportunity(candle))
        } catch (err) {
          logger.log('ERROR', 'on get last candle')
        }
        }, this.updateInterval)
    })
  }
}

export default App