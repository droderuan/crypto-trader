import BinanceClient from "../client/binance/Binance";
import logger from "../../utils/logger";
import { PairInfo, Pairs } from "../../types/Pair";
import { Order } from "../../types/Order";
import { binanceClient } from '../../main';
import AppError from "../../utils/AppError";

interface WalletConfig {
  symbol: PairInfo,
}

export interface Balance {
  [key: string]: {
    available: number,
    onOrder: number
  }
}

interface CurrentBalance {
  coin: string
  available: number
  onOrder: number
}

class UserWalletService {
  private balanceToBuy: CurrentBalance  = {} as CurrentBalance
  private balanceToSell: CurrentBalance  = {} as CurrentBalance
  private PairInfo: PairInfo = {} as PairInfo
  private lastOrder = {} as Order

  constructor(config: WalletConfig ) {
    this.PairInfo = config.symbol
  }

  async getInitialBalance() {
    try {
      const balanceResponse =  await binanceClient.currentBalance([this.PairInfo.buyCoin, this.PairInfo.sellCoin]);
      this.balanceUpdate(balanceResponse)
    } catch (err) {
      if(err instanceof AppError) {
        logger.log('WALLET', `Error - ${err.message}`)
      }
      logger.log('ERROR', 'while updating balance')
    }
  }

  startBalanceAndOrderUpdate() {
    binanceClient.createWsBalanceAndOrderUpdate({
      balanceCallback: (balance) => this.balanceUpdate(balance),
      orderCallback: (order) => this.orderUpdate(order)
    })
  }

  private balanceUpdate(balances: Balance){
    if(!balances[this.PairInfo.buyCoin]) {
      throw new AppError('WALLET', `No balance found for ${this.PairInfo.buyCoin}`)
    }

    if(!balances[this.PairInfo.sellCoin]) {
      throw new AppError('WALLET', `No balance found for ${this.PairInfo.sellCoin}`)
    }

    // if(balances[this.PairInfo.buyCoin].available === 0) {
    //   throw new AppError('WALLET', `Balance for ${this.PairInfo.buyCoin} is 0.00`)
    // }

    // if(balances[this.PairInfo.sellCoin].available === 0) {
    //   throw new AppError('WALLET', `Balance for ${this.PairInfo.sellCoin} is 0.00`)
    // }

    this.balanceToBuy = {
      ...balances[this.PairInfo.buyCoin],
      coin: this.PairInfo.buyCoin
    }
    this.balanceToSell = {
      ...balances[this.PairInfo.sellCoin],
      coin: this.PairInfo.sellCoin
    }

    this.balanceUpdateLog()
  }

  private orderUpdate(order: Order) {
    this.lastOrder = order
    this.orderUpdateLog()
  }

  getBalance() {
    return {toBuy: this.balanceToBuy, toSell: this.balanceToSell }
  }

  getLastOrder() {
    return this.lastOrder
  }

  private balanceUpdateLog() {
    logger.log(
      'WALLET', 
      `BALANCE - coin: ${this.balanceToBuy.coin} \tavailable: ${this.balanceToBuy.available} \tonOrder: ${this.balanceToBuy.onOrder}`
    )
    logger.log(
      'WALLET', 
      `BALANCE - coin: ${this.balanceToSell.coin} \tavailable: ${this.balanceToSell.available} \tonOrder: ${this.balanceToSell.onOrder}`
    )
  }

  private orderUpdateLog() {
    logger.log(
      'WALLET', 
      `ORDER - id: ${this.lastOrder.id} execution \ttype: ${this.lastOrder.currentExecutionType} \tprice: ${this.lastOrder.price} \tquantity: ${this.lastOrder.quantity}`
    )
    logger.log(
      'WALLET', 
      `ORDER - status: ${this.lastOrder.status} \tside: ${this.lastOrder.side}`
    )
  }
}

export default UserWalletService