import axios, { AxiosInstance } from 'axios';
import https from 'https'
import Binance from "node-binance-api";
import { CandleInterval, Candlestick, Window } from "../../../types/Candle";
import { Symbols } from "../../../types/Symbol";
import { Order } from "../../../types/Order";
import { SymbolInfo } from '../../../types/Symbol';
import logger from "../../../utils/logger";
import { SymbolsResponseDTO } from '../dtos/SymbolResponseDTO';

import { CandlestickParser } from './parsers/CandleParser'
import { SymbolParser } from './parsers/SymbolParser';
import { BalanceUpdateDTO, updateBalanceDTO } from '../dtos/BalanceWebSocketDTO';
import { Balance } from '../../services/WalletUserService';
import { BalanceParser } from './parsers/BalanceParser';
import { OrderParser } from './parsers/OrderParser';
import { BalanceResponseDTO } from '../dtos/BalanceResponseDTO';

interface historicalParams {
  symbol: Symbols
  interval: CandleInterval
  window?: Window
}

class BinanceClient {
  client: Binance
  private axios: AxiosInstance

  constructor({ apiKey, apiSecret, useServerTime }: { apiKey: string, apiSecret: string, useServerTime: boolean }) {
    const client = new Binance().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
      recvWindow: 10000,
      useServerTime
    })

    this.axios = axios.create()

    this.client = client
  }

  async getHistorical({ symbol, interval = '5m', window = 20 }: historicalParams) {
    logger.log('BINANCE CLIENT', `getting historical price of ${symbol}`)
    return new Promise<Candlestick[]>((resolve, reject) => {
      this.client.candlesticks(symbol, interval, (error: any, ticks: any[], symbol: any) => {
        if (error) {
          reject(error)
          return
        }
        const parsedTicks = CandlestickParser.parseHistorical(symbol, interval, ticks)

        resolve(parsedTicks)
        return 
      }, { limit: window*2 })
    });
  }

  async getLastCandle({ symbol, interval = '5m' }: historicalParams): Promise<null | Candlestick> {
    logger.log('BINANCE CLIENT', `getting last candle of ${symbol} with size ${interval}`)
    return new Promise((resolve, reject) => {
    this.client.candlesticks(symbol, interval, async (error: any, ticks: any[], symbol: any) => {
      if (error) {
        reject(error)
        return
      }

      const parsedTicks = CandlestickParser.parseHistorical(symbol, interval, ticks)
      resolve(parsedTicks[0])
      return
    }, { limit: 1 });
  })

  }

  async currentPrice(symbol: Symbols): Promise<number>{
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

  async currentBalance(coins: string[]): Promise<Balance> {
    return new Promise((resolve, reject) => {
      this.client.balance((error, balances: BalanceResponseDTO) => {
          if ( error ) {
            reject(error)
            return 
          }
          const parsedBalance = BalanceParser.parseCurrentBalance(coins, balances)
          resolve(parsedBalance)
          return
      });
    })
  }

  async createBuyOrder(coin: Symbols, quantity: number, price: number): Promise<Order> {
    logger.log('BINANCE CLIENT', `Creating a buy order`)
    
    return new Promise((resolve, reject) => {
      this.client.buy(coin, quantity, price, {type:'LIMIT'}, (error, response: Order) => {
        if(error) {
          reject(error)
          return
        };
        logger.log('BINANCE CLIENT', `Buy order finish`)
        logger.log('BINANCE CLIENT', `Buy order: ${response.id}`)

        resolve(response)
        return
      })

    })  
  }

  async createSellOrder(coin: Symbols, quantity: number, price: number): Promise<Order> {
    logger.log('BINANCE CLIENT', `Creating a sell order`)
    return new Promise((resolve, reject) => {
      this.client.sell(coin, quantity, price, {type:'LIMIT'}, (error, response: Order) => {
        if(error) {
          reject(error)
          return
        };
        logger.log('BINANCE CLIENT', `Sell order finish`)
        logger.log('BINANCE CLIENT', `Sell order: ${response.id}`)

        resolve(response)
        return
      })
    })  
  }

  async orderStatus(order: Order): Promise<Order> {
    logger.log('BINANCE CLIENT', `Checking order status: ${order.id}`)
    return this.client.orderStatus(order.symbol, order.id)  
  }

  async cancelOrder(order: Order): Promise<void> {
    logger.log('BINANCE CLIENT', `Canceling order ${order.id}`)
    this.client.cancel(order.symbol, order.id)
    logger.log('BINANCE CLIENT', `Order canceled: ${order.id}`)
  }

  async symbolInfo(symbol: Symbols): Promise<SymbolInfo> {
    const response = await this.axios.get<SymbolsResponseDTO>(`https://api.binance.com/api/v3/exchangeInfo?symbol=${symbol}`)

    return SymbolParser.parse(response.data)[0]
  }

  async createWsBalanceAndOrderUpdate({ balanceCallback, orderCallback }: { balanceCallback: (balance: Balance) => void, orderCallback: (order: Order) => void }) {
    this.client.websockets.userData((update: updateBalanceDTO) => {
      switch(update.e){
        case 'outboundAccountPosition':
          const parsedBalance = BalanceParser.parse(update)
          console.log(parsedBalance)
          balanceCallback(parsedBalance)
          break
        case 'executionReport':
          const parsedOrder = OrderParser.parse(update)
          console.log(parsedOrder)
          orderCallback(parsedOrder)
          break
      }
    })
  }
}

export default BinanceClient