// import BinanceClient from '../client/binance/Binance'
// import { Candlestick, Window } from '../../types/Candle'
// import strategies from '../strategies'
// import logger from '../../utils/logger'
// import OrderEventEmitter from '../event/Event'
// import Wallet from '../user/Wallet'
// import Referee from '../observer/Referee'
// import BotConfig from './BotConfig'

// class App {
//   botConfig: BotConfig
//   private strategie
//   private OrderEventEmitter
//   private referee

//   constructor(botConfig: BotConfig) {
//     this.botConfig = botConfig
//     const botParams = this.botConfig.config
//     const SelectedStrategie = strategies[botParams.strategie.name]
//     this.strategie = new SelectedStrategie()

//     this.OrderEventEmitter = new OrderEventEmitter()
    
//     let modelBuyCallback: Function | undefined = undefined
//     let modelSellCallback: Function | undefined = undefined

    
//     if (botParams.strategie.name === 'Simple SMA') {
//       const position = botParams.startPosition
//       const reference = botParams.strategie.config.reference
//       this.strategie.updateCandleReferenceValue(position === 'BOUGHT' ? reference.toSell : reference.toBuy)

//       modelBuyCallback = () => this.strategie.updateCandleReferenceValue(reference.toSell)
//       modelSellCallback = () => this.strategie.updateCandleReferenceValue(reference.toBuy)
//     }

//     this.OrderEventEmitter.setListener({
//       event: 'BUY', 
//       execute: () => logger.log('EVENT', 'Start a buy')})
//     this.OrderEventEmitter.setListener({
//       event: 'BUY', 
//       execute: () => this.wallet.buy(modelBuyCallback)
//       })
    
//     this.OrderEventEmitter.setListener({
//       event: 'SELL', 
//       execute: () => logger.log('EVENT', 'Start a sell')})
//     this.OrderEventEmitter.setListener({
//       event: 'SELL', 
//       execute: () => this.wallet.sell(modelSellCallback)
//     })
    
//     this.referee = new Referee(botParams.startPosition, this.OrderEventEmitter)

//     this.OrderEventEmitter.setListener({event: 'REVERT', execute: () => logger.log('EVENT', 'Start a reverse')})
//     this.OrderEventEmitter.setListener({event: 'REVERT', execute: () => this.referee.reverse()})
//   }

//   async start(cb: Function) {
//     const { strategie, symbol, candleSize } = this.botConfig.config
//       try {
//         let window = 0
//         logger.log('APP', `Using ${strategie.name}`)
//         if(strategie.name === 'Simple SMA'){
//           window = strategie.config.window
//         }
//         if(strategie.name === 'SMA Crossover') {
//           window = strategie.config.slower?.window || 0
//         }  
        
//         if(window === 0) {
//           throw Error('window cannot be 0')
//         }

//         const res = await this.binanceClient.PairInfo('BTCUSDT')
//         console.log(res)
//         throw Error('finish')

//         const candles = await this.binanceClient.getHistorical({ 
//           symbol: symbol,
//           interval: candleSize,
//           window: window as Window })
//         if (!candles) {
//           logger.log('ERROR', 'Error while loading initial data')
//           throw Error('No initial candle')
//         }
        
//         this.strategie.config(candles, strategie.config as any)
        
//         cb()
//       } catch (err) {
//         console.log(err)
//         logger.log('ERROR', 'Error while loading initial data')
//       }
//   }

//   async startObserve() {
//     const botParams = this.botConfig.config
//     await this.updateModel()
//     logger.log("APP", `Updating the model every ${botParams.candleInterval}s from now`)
//     setInterval(async () => {
//       this.updateModel()
//     }, botParams.candleInterval * 1000)
      
//   }

//   async updateModel() {
//     return new Promise<void>((resolve, reject) => {
//       const botParams = this.botConfig.config
//       this.binanceClient.wait(async () => {
//           logger.log("APP", "Updating the model")
//           try {
//             const candle = await this.binanceClient.getLastCandle({ symbol: botParams.symbol, interval: botParams.candleSize })
//             if (!candle) {
//               return
//             }
//             await this.strategie.update(candle)
//             resolve()
//           } catch (err) {
//             logger.log('ERROR', 'on get last candle')
//           }
//       })
//     })
//   }

//   async lastValueCheck() {
//     const { symbol, candleSize } = this.botConfig.config
//     logger.log("APP", "Verifying if there is a new candle value")
//     try {
//       const candle = await this.binanceClient.getLastCandle({
//         symbol: symbol,
//         interval: candleSize })

//       if (!candle) {
//         return
//       }
//       this.referee.updateDecision(this.strategie.verifyOpportunity(candle))
//     } catch (err) {
//       logger.log('ERROR', 'on get last candle')
//     }
//   }

//   async startIntervalCheck() {
//     const botParams = this.botConfig.config
//     logger.log("APP", `Updating the model decision every ${botParams.updateInterval}s from now`)
//     await this.lastValueCheck()
//     this.binanceClient.wait(() => {
//       setInterval(async () => {
//         await this.lastValueCheck()
//         }, botParams.updateInterval * 1000)
//     })
//   }
// }

// export default App