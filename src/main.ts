import logger from './utils/logger'
import env from './utils/env'
import App from './app'

logger.log('APP', 'Starting...')

const app = new App({
  buyWith: 'BUSD', 
  sellWith: 'ADA',
  symbol: 'ADABUSD',
  startPosition: 'EMPTY',
  window: 5,
  reference: {
    toBuy: 'low',
    toSell: 'high'
  },
  candleSize: '5m',
  modelName: 'sma',
  candleInterval: 300000,
  updateInterval: 150000,
  coinPrecision: 1,
  coinStep: 0.1,
  binanceApiKey: env.binanceApiKey,
  binanceApiSecret: env.binanceApiSecret
})

app.start(() => {
  logger.log('APP', 'Started app')
  app.startObserve()
  app.startIntervalCheck()
})

