// import BinanceClient from "../client/binance/Binance";
// import logger from "../../utils/logger";
// import { SymbolInfo, Symbols } from "../../types/Symbol";
// import { Order } from "../../types/Order";
// import OrderEventEmitter from "../event/Event";
// import { binanceClient } from '../../main';

// interface WalletConfig {
//   binanceClient: BinanceClient,
//   symbol: SymbolInfo,
//   orderEvent: OrderEventEmitter
// }

// export interface Balance {
//   [key: string]: {
//     available: number,
//     onOrder: number
//   }
// }

// interface CurrentBalance {
//   coin: string
//   available: number
//   onOrder: number
// }

// class UserWalletService {
//   private balanceToBuy: CurrentBalance  = {} as CurrentBalance
//   private balanceToSell: CurrentBalance  = {} as CurrentBalance
//   private symbolInfo: SymbolInfo = {} as SymbolInfo
//   private lastOrder = {} as Order
//   private orderStatusCheckCount = 1
//   orderEvent: OrderEventEmitter

//   constructor(config: WalletConfig ) {
//     this.symbolInfo = config.symbol
//     this.orderEvent = config.orderEvent
//   }

//   fixeNumber(number: number | string): number {
//     const splitted = String(number).split('.')
//     const fixed = splitted[1].slice(0, this.symbolInfo.precisionRound)
//     return Number(splitted[0]+'.'+fixed)
//   }

//   async startBalanceAndOrderUpdate(symbol: SymbolInfo) {
//     binanceClient.createWsBalanceAndOrderUpdate({
//       balanceCallback: (balance) => this.balanceUpdate(balance),
//       orderCallback: (order) => this.orderUpdate(order)
//     })
//   }

//   balanceUpdate(balances: Balance){
//     this.balanceToBuy = {
//       ...balances[this.symbolInfo.buyCoin],
//       coin: this.symbolInfo.buyCoin
//     }
//     this.balanceToSell = {
//       ...balances[this.symbolInfo.sellCoin],
//       coin: this.symbolInfo.sellCoin
//     }
//   }

//   orderUpdate(order: Order) {
//     this.lastOrder = order
//   }

//   getBalance() {
//     return {toBuy: this.balanceToBuy, toSell: this.balanceToSell }
//   }

//   async buy(cb?: Function) {
//     await this.updateBalance()
//     try {
      
//       this.awaitOrderToFill((orderStatus) => {
//         if(orderStatus === 'FILLED'){
//           this.logging('BUY')
//           cb && cb()
//         }
//       })
//     } catch(err) {
//       logger.log('WALLET', 'on try to buy')
//       setTimeout(() => {
//         logger.log('ERROR', 'trying again to buy')
        
//         this.buy()}, 2000)
//     }
//   }

//   async sell(cb?: Function) {
//     try {
//       await this.updateBalance()
//       const coin = this.sellWith+this.buyWith as Symbols
//       const quantity = this.fixeNumber(Number(this.balance[this.sellWith].available))
//       logger.log('WALLET', `${quantity} of ${this.sellWith}`)
//       if(quantity >= this.minimumValue){
//         this.currentValue = await this.binanceClient.currentPrice(this.symbol)
//         logger.log('WALLET', `Selling ${quantity} of ${this.sellWith}`)
//         this.lastOrder = await this.binanceClient.createSellOrder(coin, quantity, this.currentValue)
//         this.awaitOrderToFill((orderStatus) => {
//           if(orderStatus === 'FILLED'){
//             this.lastTradedValue = this.currentValue
//             this.logging('SELL')
//             cb && cb()
//           }
//         })
//       }
//     } catch (err) {
//       setTimeout(() => {
//         logger.log('WALLET', 'trying again to sell')
        
//         this.sell()
//       }, 2000)
//       console.log(err)

//       logger.log('WALLET', 'on try to sell')
//     }
//   }

//   async awaitOrderToFill(cb: (status: 'FILLED' | 'NOT_FILLED') => void ) {
//     logger.log('WALLET', `Waiting for order to finish: ${this.lastOrder.orderId}`)
    
//     const interval = setInterval(async () => {
//       logger.log('WALLET', `Tries: ${this.orderStatusCheckCount}`)
      
//       if (this.orderStatusCheckCount >= 5) {
//         logger.log('WALLET', `Max wait time of order to fill achieved`)
//         logger.log('WALLET', `Order unfilled: ${this.lastOrder.orderId}`)
//         this.orderStatusCheckCount = 1
//         try{
//             clearInterval(interval)
//             await this.cancelOrder()
//             cb('NOT_FILLED')
//           } catch (err) {
//             logger.log('WALLET', `Erro while canceling order: ${this.lastOrder.orderId}`)
//             logger.log('WALLET', `Considering order filled`)
//             console.log(err)
//             cb('FILLED')
//           }
//       } else{
//         const order = this.lastOrder
//         try{
//           const updatedOrder = await this.binanceClient.orderStatus(order)
//           if(updatedOrder.status === 'FILLED') {
//             logger.log('WALLET', `Order ${updatedOrder.status}: ${order.orderId}`)
//             cb('FILLED')
//             clearInterval(interval)
//             this.orderStatusCheckCount = 1
//           } else {
//             this.orderStatusCheckCount += 1
//           }

//         }catch(err) {
//           logger.log('WALLET', 'error while trying to update order status')
//         }
//     }
//     }, 6000)
//   }

//   async cancelOrder() {
//     await this.binanceClient.cancelOrder(this.lastOrder)
//     this.orderEvent.emitter('REVERT')
//   }

//   async updateBalance() {
//     try {
//       const balanceResponse =  await this.binanceClient.currentBalance();
//       this.balance = balanceResponse
//     } catch (err) {
//       logger.log('ERROR', 'while updating balance')
//     }
//   }
// }

// export default UserWalletService