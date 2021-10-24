import logger from './utils/logger'
import env from './utils/env'
import App from './app'
import BotConfig from './Core/BotConfig'

logger.log('APP', 'Starting...')

export const botConfig = new BotConfig({
  buyWith: 'BUSD', 
  sellWith: 'BNB',
  symbol: 'BNBBUSD',
  startPosition: 'BOUGHT',
  candleSize: '5m',
  model: {
    modelName: 'SMA',
    modelConfig: {
      window: 5,
      reference: {
        toBuy: 'low',
        toSell: 'high'
      }
    }
  },
  candleInterval: 300,
  updateInterval: 300,
  coinPrecision: 3,
  coinStep: 0.001,
  binanceApiKey: env.binanceApiKey,
  binanceApiSecret: env.binanceApiSecret
})

const app = new App(botConfig)

app.start(() => {
  logger.log('APP', 'Started app')
  app.startObserve()
  app.startIntervalCheck()
})

