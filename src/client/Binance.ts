import Binance from "node-binance-api";
import { Candle, candleSize, coins, window } from "../types/Candle";
import { Balance } from "../types/Wallet";
import logger from "../utils/logger";

interface historicalParams {
  symbol: 'BTCUSDT'
  interval: candleSize
  window?: window
}

class BinanceClient {
  client: Binance

  constructor({ apiKey, apiSecret, useServerTime }: { apiKey: string, apiSecret: string, useServerTime: boolean }) {
    const client = new Binance().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
      recvWindow: 10000,
      useServerTime
    })

    this.client = client
  }

  parseToCandle(value: (string) []) {
    return {
      time: parseFloat(value[0]),
      open: parseFloat(value[1]),
      high: parseFloat(value[2]),
      low: parseFloat(value[3]),
      close: parseFloat(value[4]),
      volume: parseFloat(value[5]),
      closeTime: parseFloat(value[6]),
      assetVolume: parseFloat(value[7]),
      trades: parseFloat(value[8]),
      buyBaseVolume: parseFloat(value[9]),
      buyAssetVolume: parseFloat(value[10]),
      ignored: parseFloat(value[11]),
    } as Candle
  }

  async getHistorical({ symbol, interval = '5m', window = 20 }: historicalParams) {
    logger.log('BINANCE CLIENT', `getting historical price of ${symbol}`)
    return new Promise<Candle[]>((resolve, reject) => {
      this.client.candlesticks(symbol, interval, (error: any, ticks: any[], symbol: any) => {
        if (error) {
          reject(error)
          return
        }
        const parsedTicks = ticks.map((tick: any) => this.parseToCandle(tick))

        resolve(parsedTicks)
        return 
      }, { limit: window*2 })
    });
  }

  async getLastCandle({ symbol, interval = '5m' }: historicalParams): Promise<null | Candle[]> {
    logger.log('BINANCE CLIENT', `getting last candle of ${symbol} with size ${interval}`)
    return new Promise((resolve, reject) => {
    this.client.candlesticks(symbol, interval, (error: any, ticks: any[], symbol: any) => {
      if (error) {
        reject(error)
        return
      }

      const parsedTicks = ticks.map((tick: any) => this.parseToCandle(tick))
      resolve(parsedTicks)
      return
    }, { limit: 1 });
  })

  }

  async currentPrice(symbol: coins): Promise<number>{
    return new Promise((resolve, reject) => {
      logger.log('BINANCE CLIENT', `Getting current value of ${symbol}`)
      this.client.prices(symbol, (error: any, ticker: {[key: string]: string}) => {
        if (error) {
          reject(error)
          return
        }
        resolve(parseFloat(ticker[symbol]))
        return
      });
    })
  }

  async wait(cb: any) {
    await this.client.useServerTime(cb)
  }

  async currentBalance(): Promise<Balance> {
    return new Promise((resolve, reject) => {
      this.client.balance((error, balances: Balance) => {
          if ( error ) {
            reject(error)
            return 
          }
          resolve(balances)
          return
      });
    })
  }

  async createBuyOrder(coin: coins, quantity: number, price: number) {
      await this.client.buy(coin, quantity, price)
  }

  async createSellOrder(coin: coins, quantity: number, price: number) {
      await this.client.sell(coin, quantity, price)
  }

  async symbolInfo(coin: string) {

  }
}

export default BinanceClient