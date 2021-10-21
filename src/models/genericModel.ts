import { Candle } from "../types/Candle";
import { opinion } from "../types/Decision";

export default abstract class GenericModel {
  abstract config(initialValues: Candle[], window: number, parameter: {
    toBuy: keyof Candle | 'currentValue',
    toSell: keyof Candle | 'currentValue'
  }): void

  abstract opinion(): opinion
  
  abstract update(newCandle: Candle): void

  abstract log(): void

  abstract checkIfIsBelow(): boolean
}