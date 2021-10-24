import fs from 'fs'
import BinanceClient from "../client/binance/Binance";
import logger from "../../utils/logger";
import { Balance } from "../../types/Wallet";
import { Coins } from "../../types/Candle";
import { Order, OrderEmitterTypes } from "../../types/Order";
import OrderEventEmitter from "../event/Event";

interface WalletConfig {
  binanceClient: BinanceClient,
   symbol: Coins,
   buyWith: string,
   sellWith: string,
   symbolPrecision: number,
   minimumValue: number
   orderEvent: OrderEventEmitter
}

class Wallet {
  balance: Balance  = {} as Balance
  binanceClient: BinanceClient
  currentValue = 0
  lastTradedValue = 0
  symbolPrecision = 0
  minimumValue = 0
  symbol = '' as Coins
  buyWith = ''
  sellWith = ''
  private lastOrder = {} as Order
  private orderStatusCheckCount = 1
  orderEvent: OrderEventEmitter

  constructor(config: WalletConfig  ) {
    this.binanceClient = config.binanceClient
    this.symbol = config.symbol
    this.buyWith = config.buyWith
    this.sellWith = config.sellWith
    this.symbolPrecision = config.symbolPrecision
    this.minimumValue = config.minimumValue
    this.orderEvent = config.orderEvent
  }

  write(type: string, diff: number) {
    fs.appendFile("/home/ruan/Code/projects/cryptoTrader/tmp/log",
     `${this.symbol} ${type} ${this.currentValue} ${(diff*100).toFixed(2)}% ${String(new Date()).slice(8, 33)}\r\n`, function(err) {
      if(err) {
          return console.log(err);
      }
      logger.log('WALLET', 'Saving transaction on file')

    }); 
  }

  logging(type: 'BUY' | 'SELL') {
    if (type==='BUY') {
      logger.log('WALLET', `Buying at ${this.currentValue}`)
      this.write('BUY', 0.0)
    } else {
      const difference = this.currentValue / this.lastTradedValue
      logger.log('WALLET', `Selling at ${this.currentValue}`)
      console.table([{ current: this.currentValue, sellingAt: difference > 1 ? 'PROFIT' : 'LOST', diff: difference }])
      this.write('SELL', difference)
    }
  }

  fixeNumber(number: number | string): number {
    const splitted = String(number).split('.')
    const fixed = splitted[1].slice(0, this.symbolPrecision)
    return Number(splitted[0]+'.'+fixed)
  }

  async buy(cb?: Function) {
    await this.updateBalance()
    try {
      const coin = this.sellWith+this.buyWith as Coins

      this.currentValue = await this.binanceClient.currentPrice(coin)
      const quantityWithoufix = Number(this.balance[this.buyWith].available) / this.currentValue
      const quantity = this.fixeNumber(quantityWithoufix)

      logger.log('WALLET', `${this.balance[this.buyWith].available} of ${this.buyWith}`)
      logger.log('WALLET', `Buying ${quantity} ${this.buyWith} of ${this.sellWith}`)

      this.lastOrder = await this.binanceClient.createBuyOrder(coin, quantity, this.currentValue)
      this.awaitOrderToFill((orderStatus) => {
        if(orderStatus === 'FILLED'){
          this.logging('BUY')
          cb && cb()
        }
      })
    } catch(err) {
      logger.log('WALLET', 'on try to buy')
      setTimeout(() => {
        logger.log('ERROR', 'trying again to buy')
        
        this.buy()}, 2000)
    }
  }

  async sell(cb?: Function) {
    try {
      await this.updateBalance()
      const coin = this.sellWith+this.buyWith as Coins
      const quantity = this.fixeNumber(Number(this.balance[this.sellWith].available))
      logger.log('WALLET', `${quantity} of ${this.sellWith}`)
      if(quantity >= this.minimumValue){
        this.currentValue = await this.binanceClient.currentPrice(this.symbol)
        logger.log('WALLET', `Selling ${quantity} of ${this.sellWith}`)
        this.lastOrder = await this.binanceClient.createSellOrder(coin, quantity, this.currentValue)
        this.awaitOrderToFill((orderStatus) => {
          if(orderStatus === 'FILLED'){
            this.lastTradedValue = this.currentValue
            this.logging('SELL')
            cb && cb()
          }
        })
      }
    } catch (err) {
      setTimeout(() => {
        logger.log('WALLET', 'trying again to sell')
        
        this.sell()
      }, 2000)
      console.log(err)

      logger.log('WALLET', 'on try to sell')
    }
  }

  async awaitOrderToFill(cb: (status: 'FILLED' | 'NOT_FILLED') => void ) {
    logger.log('WALLET', `Waiting for order to finish: ${this.lastOrder.orderId}`)
    
    const interval = setInterval(async () => {
      logger.log('WALLET', `Tries: ${this.orderStatusCheckCount}`)
      
      if (this.orderStatusCheckCount >= 5) {
        logger.log('WALLET', `Max wait time of order to fill achieved`)
        logger.log('WALLET', `Order unfilled: ${this.lastOrder.orderId}`)
        this.orderStatusCheckCount = 1
        try{
            clearInterval(interval)
            await this.cancelOrder()
            cb('NOT_FILLED')
          } catch (err) {
            logger.log('WALLET', `Erro while canceling order: ${this.lastOrder.orderId}`)
            logger.log('WALLET', `Considering order filled`)
            console.log(err)
            cb('FILLED')
          }
      } else{
        const order = this.lastOrder
        try{
          const updatedOrder = await this.binanceClient.orderStatus(order)
          if(updatedOrder.status === 'FILLED') {
            logger.log('WALLET', `Order ${updatedOrder.status}: ${order.orderId}`)
            cb('FILLED')
            clearInterval(interval)
            this.orderStatusCheckCount = 1
          } else {
            this.orderStatusCheckCount += 1
          }

        }catch(err) {
          logger.log('WALLET', 'error while trying to update order status')
        }
    }
    }, 6000)
  }

  async cancelOrder() {
    await this.binanceClient.cancelOrder(this.lastOrder)
    this.orderEvent.emitter('REVERT')
  }

  async updateBalance() {
    try {
      const balanceResponse =  await this.binanceClient.currentBalance();
      this.balance = balanceResponse
    } catch (err) {
      logger.log('ERROR', 'while updating balance')
    }
  }
}

export default Wallet