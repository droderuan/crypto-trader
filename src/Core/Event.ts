import { orderBuyParams, orderSellParams } from "../types/Order";
import logger from "../utils/logger";

type OrderConfig = {
  'BUY': ((input: orderBuyParams) => void)[]
  'SELL': ((input: orderSellParams) => void)[]
}

type emitterParams = orderBuyParams | orderSellParams

class Order {
  private listeners: OrderConfig = {} as OrderConfig

  constructor(config: OrderConfig) {
    this.listeners = config
  }

  emitter(input: 'BUY' | 'SELL'){
    logger.log('EVENT', `${input}`)
    this.listeners[input].forEach(action => action(input as any))
  }
}

export default Order