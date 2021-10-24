import { OrderBuyParams, OrderEmitterTypes, OrderRevertParams, OrderSellParams, setBuyListener, setRevertListener, setSellListener } from "../../types/Order";
import logger from "../../utils/logger";

type Listeners = {
  'BUY': ((input: OrderBuyParams) => void)[]
  'SELL': ((input: OrderSellParams) => void)[]
  'REVERT': ((input: OrderRevertParams) => void)[]
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

  emitter(input: 'BUY' | 'SELL' | 'REVERT'){
    logger.log('EVENT', `${input}`)
    this.listeners[input].forEach(action => action(input as any))
  }
}

export default OrderEventEmitter