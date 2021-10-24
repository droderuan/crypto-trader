import BinanceClient from '../client/Binance'
import { Candle, CandleSize, Coins, Window } from '../../types/Candle'
import logger from '../../utils/logger'
import models from '../models'
import Order from '../event/Event'
import Wallet from '../user/Wallet'
import Referee, { Position } from './Referee'
import BotConfig from './BotConfig'

class App {
  botConfig: BotConfig
  private binanceClient
  private models
  private wallet
  private order
  private referee

  constructor(botConfig: BotConfig) {
    this.botConfig = botConfig
    const botParams = this.botConfig.config
    this.models = models[botParams.model.modelName]

    this.binanceClient = new BinanceClient({
      apiKey: botParams.binanceApiKey,
      apiSecret: botParams.binanceApiSecret,
      useServerTime: true
    })

    this.order = new Order()
    
    this.wallet = new Wallet({
      binanceClient: this.binanceClient,
      symbol: botParams.symbol,
      buyWith: botParams.buyWith,
      sellWith: botParams.sellWith,
      symbolPrecision: botParams.coinPrecision,
      minimumValue: botParams.coinStep,
      orderEvent: this.order
    })

    let modelBuyCallback: Function | undefined = undefined
    let modelSellCallback: Function | undefined = undefined

    
    if(botParams.model.modelName === 'SMA') {
      const position = botParams.startPosition
      const reference = botParams.model.modelConfig.reference
      this.models.updateCandleReferenceValue(position === 'BOUGHT' ? reference.toSell : reference.toBuy)


      modelBuyCallback = () => this.models.updateCandleReferenceValue(reference.toSell)
      modelSellCallback = () => this.models.updateCandleReferenceValue(reference.toBuy)
    }

    this.order.setListener({
      event: 'BUY', 
      execute: () => logger.log('EVENT', 'Start a buy')})
    this.order.setListener({
      event: 'BUY', 
      execute: () => this.wallet.buy(modelBuyCallback)
      })
    
    this.order.setListener({
      event: 'SELL', 
      execute: () => logger.log('EVENT', 'Start a sell')})
    this.order.setListener({
      event: 'SELL', 
      execute: () => this.wallet.sell(modelSellCallback)
    })
    
    this.referee = new Referee(botParams.startPosition, 5, this.order)

    this.order.setListener({event: 'REVERT', execute: () => logger.log('EVENT', 'Start a reverse')})
    this.order.setListener({event: 'REVERT', execute: () => this.referee.reverse()})
  }

  async start(cb: Function) {
    const { model, symbol, candleSize } = this.botConfig.config
      try {
        let window = 0
        logger.log('APP', `Using ${model.modelName}`)
        if(model.modelName === 'SMA'){
          window = model.modelConfig.window
        }
        if(model.modelName === 'SMA Crossover') {
          window = model.modelConfig.slower?.window || 0
        }  
        
        if(window === 0) {
          throw Error('window cannot be 0')
        }

        const candles = await this.binanceClient.getHistorical({ 
          symbol: symbol,
          interval: candleSize,
          window: window as Window })
        if (!candles) {
          logger.log('ERROR', 'Error while loading initial data')
          throw Error('No initial candle')
        }
        
        this.models.config(candles, model.modelConfig as any)
        
        cb()
      } catch (err) {
        console.log(err)
        logger.log('ERROR', 'Error while loading initial data')
      }
  }

  async startObserve() {
    const botParams = this.botConfig.config
    await this.updateModel()
    logger.log("APP", `Updating the model every ${botParams.candleInterval}s from now`)
    setInterval(async () => {
      this.updateModel()
    }, botParams.candleInterval * 1000)
      
  }

  async updateModel() {
    return new Promise<void>((resolve, reject) => {
      const botParams = this.botConfig.config
      this.binanceClient.wait(async () => {
          logger.log("APP", "Updating the model")
          try {
            const candle = await this.binanceClient.getLastCandle({ symbol: botParams.symbol, interval: botParams.candleSize })
            if (!candle) {
              return
            }
            await this.models.update(candle)
            resolve()
          } catch (err) {
            logger.log('ERROR', 'on get last candle')
          }
      })
    })
  }

  async lastValueCheck() {
    const botParams = this.botConfig.config
    logger.log("APP", "Verifying if there is a new candle value")
        try {
          let candle: Candle | null
          if(botParams.model.modelConfig.reference === 'current') {
            const currentValue = await this.binanceClient.currentPrice(botParams.symbol)
            candle = { currrent: currentValue } as unknown as Candle
          } else {
            candle = await this.binanceClient.getLastCandle({ symbol: botParams.symbol, interval: botParams.candleSize })
          }

          if (!candle) {
            return
          }
          this.referee.updateDecision(this.models.verifyOpportunity(candle))
        } catch (err) {
          logger.log('ERROR', 'on get last candle')
        }
  }

  async startIntervalCheck() {
    const botParams = this.botConfig.config
    logger.log("APP", `Updating the model decision every ${botParams.updateInterval}s from now`)
    await this.lastValueCheck()
    this.binanceClient.wait(() => {
      setInterval(async () => {
        await this.lastValueCheck()
        }, botParams.updateInterval * 1000)
    })
  }
}

export default App