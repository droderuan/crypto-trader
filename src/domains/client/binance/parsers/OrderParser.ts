import { Order } from "../../../../types/Order"
import { OrderUpdateDTO } from "../../dtos/BalanceWebSocketDTO"

export class OrderParser {
  static parse(order: OrderUpdateDTO): Order {
    return {
      symbol: order.s,
      id: order.i,
      clientOrderId: order.c,
      eventTime: order.E,
      price: parseFloat(order.p),
      quantity: parseFloat(order.q),
      currentExecutionType: order.x,
      type: order.o,
      status: order.X,
      lastExecutedQuantity: parseFloat(order.l),
      side: order.S,
      creationTime: order.O
    } as Order
  }
}