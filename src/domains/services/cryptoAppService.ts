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
      console.log(err)
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
        await this.orderService.createBuyOrder({
          PairInfo: this.pair, 
          quantity: this.wallet.getBalance().toBuy.available 
        })
        this.orderLock = true
      } catch (err) {
        console.log(err)
        this.orderLock = false
      }
    } else {
      logger.log('CRYPTO APP', 'On order lock. Waiting current order to finish')
    }
    this.lastOrderUpdate()
  }

  async sell() {
    if (!this.orderLock){
      try{
        await this.orderService.createSellOrder({
          PairInfo: this.pair, 
          quantity: this.wallet.getBalance().toSell.available 
        })
        this.orderLock = true
      } catch (err) {
        console.log(err)
        this.orderLock = false
      }
    } else {
      logger.log('CRYPTO APP', 'On order lock. Waiting current order to finish')
    }
    this.lastOrderUpdate()
  }

  async lastOrderUpdate() {
    const interval = setInterval(() => {
      const lastOrder = this.wallet.getLastOrder()
      if(lastOrder.status === 'FILLED') {
        clearInterval(interval)
        this.orderLock = false
      }
    }, 5000)
  }
}

export default CryptoAppService