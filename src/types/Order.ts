import { OrderExecutionType, OrderSide, OrderStatus, OrderType } from "../domains/client/dtos/BalanceWebSocketDTO";
import { Symbols } from "./Symbol";

export interface OrderParams {
  symbol: Symbols
  quantity: number
  price: number
}

export interface Order {
  symbol: string,
  id: number,
  clientOrderId: string,
  eventTime: number,
  creationTime: number,
  price: number,
  quantity: number,
  currentExecutionType: OrderExecutionType
  type: OrderType,
  status: OrderStatus
  lastExecutedQuantity: number
  side: OrderSide
}