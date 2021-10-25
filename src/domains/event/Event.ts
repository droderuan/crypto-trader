import logger from "../../utils/logger";
import { Strategies } from "../strategies/types";

export type OrderEmitterTypes = 'BUY' | 'SELL' | 'REVERT'

interface BuyOrderEvent {
  type: 'BUY',
  params: {
    pair: pair
    quantity: number
    strategy: Strategies
  }
}

interface SellOrderEvent {
  type: 'SELL',
  params: {
    pair: pair
    quantity: number
    strategy: Strategies
  }
}

interface RevertEvent {
  type: 'REVERT',
  params: {
    reason: string
    strategy: Strategies
  }
}

type Event = BuyOrderEvent | SellOrderEvent | RevertEvent

type Listeners = {
  'BUY': Function[]
  'SELL': Function[]
  'REVERT': Function[]

}

export interface setBuyListener {
  event: 'BUY'
  execute: () => void
}

export interface setSellListener {
  event: 'SELL'
  execute: () => void
}

export interface setRevertListener {
  event: 'REVERT'
  execute: () => void
}

class OrderEventEmitter {
  private listeners: Listeners = {} as Listeners

  constructor(){
    this.listeners = {
      BUY: [],
      SELL: [],
      REVERT: []
    }
  }

  setListener(params: setBuyListener | setSellListener | setRevertListener) {
    this.listeners[params.event].push(params.execute as any)
  }

  emitter(event: OrderEmitterTypes){
    logger.log('EVENT', `${event}`)
    this.listeners[event].forEach(action => action())
  }
}

export default OrderEventEmitter