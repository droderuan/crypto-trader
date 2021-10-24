import { Coins } from "./Candle";

export type OrderEmitterTypes = 'BUY' | 'SELL' | 'REVERT'

export interface OrderBuyParams{
  type: 'BUY'
  params: {
    value: number
    pair: number
  }
}

export interface OrderSellParams {
  type: 'SELL'
  params: {
    value: number
    pair: number
  }
}

export interface OrderRevertParams {
  type: 'REVERT'
}

export interface setBuyListener {
  event: 'BUY'
  execute: (params: OrderBuyParams) => void
}

export interface setSellListener {
  event: 'SELL'
  execute: (params: OrderSellParams) => void
}

export interface setRevertListener {
  event: 'REVERT'
  execute: (params: OrderRevertParams) => void
}

export interface Order {
  symbol: Coins,
  orderId: number,
  clientOrderId: string,
  transactTime: number,
  price: string,
  origQty: string,
  executedQty: string,
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY' | 'SELL'
}