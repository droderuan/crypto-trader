import BinanceClient from "../client/Binance";
import { orderBuyParams, orderSellParams } from "../types/Order";
import logger from "../utils/logger";
import fs from 'fs'
import { Balance } from "../types/Wallet";
import { coins } from "../types/Candle";

class Wallet {
  balance: Balance  = {} as Balance
  binanceClient: BinanceClient
  currentValue = 0
  lastTradedValue = 0
  symbolPrecision = 1
  symbol = '' as coins
  buyWith = ''
  sellWith = ''

  constructor(binanceClient: BinanceClient, symbol: coins, buyWith: string,sellWith: string ) {
    this.binanceClient = binanceClient
    this.symbol = symbol
    this.buyWith = buyWith
    this.sellWith = sellWith
  }

  write(type: string, diff: number) {
    fs.appendFile("/home/ruan/Code/projects/cryptoTrader/tmp/log", `${this.symbol} ${type} ${this.currentValue} ${(diff*100).toFixed(2)}% ${String(new Date()).slice(8, 33)}\r\n`, function(err) {
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

  async buy() {
    await this.updateBalance()
    try {
      const coin = this.sellWith+this.buyWith as coins
      this.currentValue = await this.binanceClient.currentPrice(coin)
      const quantityWithoufix = Number(this.balance[this.buyWith].available) / this.currentValue
      const quantity = this.fixeNumber(quantityWithoufix)
      logger.log('WALLET', `${quantity} of ${this.buyWith}`)
      logger.log('WALLET', `Buying ${this.balance[this.buyWith].available} ${this.buyWith} of ${this.sellWith}`)
      await this.binanceClient.createBuyOrder(coin, quantity, this.currentValue)
      this.logging('BUY')
    } catch(err) {
      logger.log('ERROR', 'on try to buy')
      
      setTimeout(() => {
        logger.log('ERROR', 'trying again to buy')
        
        this.buy()}, 2000)
    }
  }

  async sell() {
    this.lastTradedValue = this.currentValue
    try {
      await this.updateBalance()
      const coin = this.sellWith+this.buyWith as coins
      const quantity = this.fixeNumber(Number(this.balance[this.sellWith].available))
      logger.log('WALLET', `${quantity} of ${this.sellWith}`)
      if(quantity >= 0.1){
        this.currentValue = await this.binanceClient.currentPrice(this.symbol)

        logger.log('WALLET', `Selling ${quantity} of ${this.sellWith}`)

        await this.binanceClient.createSellOrder(coin, quantity, this.currentValue)
        
        this.logging('SELL')
      }
    } catch (err) {
      setTimeout(() => {
        logger.log('ERROR', 'trying again to sell')
        
        this.sell()
      }, 2000)
      console.log(err)

      logger.log('ERROR', 'on try to sell')
    }
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