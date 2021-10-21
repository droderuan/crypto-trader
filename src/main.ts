import main from './app'
import logger from './utils/logger'
import env from './utils/env'
import App from './app'

logger.log('APP', 'Starting...')

const app = new App({
  window: 5,
  reference: {
    toBuy: 'low',
    toSell: 'high'
  },
  candleSize: '15m',
  modelName: 'sma',
  updateInterval: 60000,
  binanceApiKey: env.binanceApiKey,
  binanceApiSecret: env.binanceApiSecret
})

app.start(() => {
  logger.log('APP', 'Started app')
  app.startObserve()
})

