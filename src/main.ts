import logger from './utils/logger'
import env from './utils/env'
import App from './domains/app/App'
import BotConfig from './domains/app/BotConfig'
import BinanceClient from './domains/client/binance/Binance'

logger.log('APP', 'Starting...')

// export const botConfig = new BotConfig({
//   pair: 'ADABUSD',
//   candleSize: '5m',
//   strategy: {
//     name: 'SMA Crossover',
//     config: {
//       faster: {
//         window: 9,
//         reference: {
//           toBuy: 'lowPrice',
//           toSell: 'highPrice'
//         }
//       },
//       slower: {
//         window: 21,
//         reference: {
//           toBuy: 'lowPrice',
//           toSell: 'highPrice'
//         }
//       }
//     }
//   },
//   candleInterval: 300,
//   updateInterval: 300,
// })

export const botConfig = new BotConfig({
  pair: 'BTCBUSD',
  candleSize: '1m',
  startPosition: 'EMPTY',
  strategy: {
    name: 'Simple SMA',
    config: {
      window: 5,
      reference: {
        toBuy: 'lowPrice',
        toSell: 'highPrice'
      }
    }
  },
  candleInterval: 300,
  updateInterval: 300,
})

export const binanceClient = new BinanceClient({
  apiKey: env.binanceApiKey,
  apiSecret: env.binanceApiSecret,
  useServerTime: true,
})

const app = new App(botConfig)

app.start()
