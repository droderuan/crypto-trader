import logger from './utils/logger'
import env from './utils/env'
import App from './domains/app/App'
import BotConfig from './domains/app/BotConfig'

logger.log('APP', 'Starting...')

export const botConfig = new BotConfig({
  buyWith: 'USDT', 
  sellWith: 'BTC',
  symbol: 'BTCUSDT',
  startPosition: 'BOUGHT',
  candleSize: '5m',
  model: {
    modelName: 'SMA Crossover',
    modelConfig: {
      reference: 'current',
      faster: {
        window: 9
      },
      slower: {
        window: 21
      }
    }
  },
  candleInterval: 300,
  updateInterval: 300,
  coinPrecision: 5,
  coinStep: 0.00001,
  binanceApiKey: env.binanceApiKey,
  binanceApiSecret: env.binanceApiSecret
})

const app = new App(botConfig)

app.start(async () => {
  logger.log('APP', 'Started app')
  await app.startObserve()
  app.startIntervalCheck()
})
