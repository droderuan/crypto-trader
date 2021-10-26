import OrderEventEmitter from "../event/Event";
import Referee, { Position } from "../observer/Referee";
import { binanceClient } from "../../main";
import { PairInfo, Pairs } from "../../types/Pair";
import AppError from "../../utils/AppError";
import logger from "../../utils/logger";
import BotConfig from "../app/BotConfig";
import { GenericStrategy } from "../strategies/types";
import UserWalletService from "./WalletUserService";
import OrderService from "./OrderService";
import { Order } from "../../types/Order";

class CryptoAppService {
  private botConfig!: BotConfig 
  private strategy!: GenericStrategy 
  private pair!: PairInfo
  private wallet!: UserWalletService
  private referee!: Referee
  private orderEvent!: OrderEventEmitter
  private orderService!: OrderService
  private orderLock = false
  private position!: Position
  private orderUpdateTries = 1
  private maxOrderUpdateTries = 5

  private buyPrice = 0
  private sellPrice = 0

  async init() {
    this.wallet = new UserWalletService({
      pair: this.pair,
    })
    let currentPosition = this.botConfig.config.startPosition
    
    if(!currentPosition) {
      logger.log('CRYPTO APP', 'No start position detected - looking for the last order...')
      const lastCandle = await binanceClient.lastOrder(this.pair.pair)
      if(!lastCandle){
        currentPosition = 'EMPTY'
      } else {
        if (lastCandle.status !== 'FILLED') throw new AppError('Getting initial position', `Last candle status: ${lastCandle.status}. Unable to set inicial position. Set manually on bot config.`)
        currentPosition = lastCandle.side === 'BUY' ? 'BOUGHT' : 'EMPTY'
      }
      logger.log('CRYPTO APP', `Using start position: ${currentPosition}`)
    }

    this.position = currentPosition
    
    this.referee = new Referee(currentPosition, this.orderEvent)
    this.strategy.updateCandleReference(currentPosition)

    await this.wallet.getInitialBalance()
    this.wallet.startBalanceAndOrderUpdate()
    this.startUpdateStrategie()

    this.orderEvent.setListener({ event: 'BUY', execute: () => this.buy() })
    this.orderEvent.setListener({ event: 'SELL', execute: () => this.sell() })
  }

  setConfig(config: BotConfig) {
    this.botConfig = config
  }

  setOrderEvent( orderEvent: OrderEventEmitter) {
    this.orderEvent = orderEvent
  }

  setOrderService( orderService: OrderService) {
    this.orderService = orderService
  }

  async setPairInfo(pair: Pairs) {
    logger.log('CRYPTO APP', 'Getting pair info')
    try {
      const PairInfo = await binanceClient.PairInfo(pair)
      this.pair = PairInfo
    } catch (err) {
      throw new AppError('CRYPTO_SERVICE', 'Error on get pair info')
    }
  }

  getPair() {
    return this.pair
  }

  async setStrategie(strategy: GenericStrategy) {
    this.strategy = strategy
  }

  startUpdateStrategie() {
    logger.log('CRYPTO APP', 'Initializing strategy update')
    binanceClient.createWsCandleStickUpdate({ 
      pair: this.pair.pair, 
      updateCallback: async (candle) => {
        this.strategy.update(candle)
        const decision = this.strategy.verifyOpportunity()
        this.referee.judge(decision)
      }
    })
  }

  async buy() {
    if(!this.orderLock){
      try{
        this.referee.updatePosition('BOUGHT')
        const buyPrice = await this.orderService.createBuyOrder({
          PairInfo: this.pair, 
          quantity: this.wallet.getBalance().toBuy.available 
        })
        this.orderLock = true
        this.buyPrice = buyPrice || 0
        await this.lastOrderUpdate()
      } catch (err) {
        console.log(err)
        this.orderLock = false
      }
    } else {
      logger.log('CRYPTO APP', 'On order lock. Waiting current order to finish')
    }
  }

  async sell() {
    if (!this.orderLock){
      try{
        this.referee.updatePosition('EMPTY')
        const sellPrice = await this.orderService.createSellOrder({
          PairInfo: this.pair, 
          quantity: this.wallet.getBalance().toSell.available 
        })
        this.orderLock = true
        this.sellPrice = sellPrice || 0
        await this.lastOrderUpdate()
        this.calculateProfit()
      } catch (err) {
        console.log(err)
        this.orderLock = false
      }
    } else {
      const lastOrder = this.wallet.getLastOrder()
      logger.log('CRYPTO APP', 'On order lock. Waiting current order to finish')
      logger.log('CRYPTO APP', `Order: ${lastOrder.id} status: ${lastOrder.status} side: ${lastOrder.side}`)
    }
  }

  async calculateProfit() {
    if(this.buyPrice !== 0 && this.sellPrice !== 0){
      const diff = (this.sellPrice / this.buyPrice) * 100
      const percent = `${parseFloat(String(diff)).toFixed(3)}%`
      logger.log('CRYPTO APP', `SELLING ON ${diff > 100 ? 'PROFIT' : 'LOST'} of ${percent}`, diff > 100 ? 'green' : 'red')
    }
  }

  async lastOrderUpdate() {
    const interval = setInterval(async () => {
      const lastOrder = this.wallet.getLastOrder()
      if(lastOrder.status === 'FILLED') {
        logger.log('CRYPTO APP', `Order filled: ${lastOrder.id}`)
        clearInterval(interval)
        this.orderLock = false
        this.orderUpdateTries = 1
      } else {
        logger.log('CRYPTO APP', `Order update tries: ${this.orderUpdateTries}`)
        
        if(this.orderUpdateTries >= this.maxOrderUpdateTries){
          logger.log('CRYPTO APP', `Max order update tries achieved`)
          logger.log('CRYPTO APP', `Canceling order: ${lastOrder.id}`)

          this.referee.reverse()

          await binanceClient.cancelOrder(lastOrder).finally(() => {
            this.orderEvent.emitter('REVERT')
            this.orderUpdateTries = 1
            this.orderLock = false
          })
        } else {
          ++this.orderUpdateTries
        }
      }
    }, 5000)
  }
}

export default CryptoAppService