import env from './utils/env'
import App from './domains/app/App'
import BotConfig from './domains/app/BotConfig'
import BinanceClient from './domains/client/binance/Binance'

export const botConfig = new BotConfig({
  pair: 'SHIBBUSD',
  candleSize: '15m',
  strategy: {
    name: 'SMA Crossover',
    config: {
      faster: {
        window: 7,
        reference: {
          toBuy: 'lowPrice',
          toSell: 'lowPrice'
        }
      },
      slower: {
        window: 30,
        reference: {
          toBuy: 'lowPrice',
          toSell: 'highPrice'
        }
      }
    }
  },
})

// export const botConfig = new BotConfig({
//   pair: 'SHIBUSDT',
//   candleSize: '1m',
//   startPosition: 'BOUGHT',
//   strategy: {
//     name: 'Simple SMA',
//     config: {
//       window: 5,
//       reference: {
//         toBuy: 'lowPrice',
//         toSell: 'highPrice'
//       }
//     }
//   },
// })

export const binanceClient = new BinanceClient({
  apiKey: env.binanceApiKey,
  apiSecret: env.binanceApiSecret,
  useServerTime: true,
})

const app = new App(botConfig)

binanceClient.wait(() => app.start())

