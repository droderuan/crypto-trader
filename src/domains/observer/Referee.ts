import { StrategyDecision } from "../strategies/types/GenericStrategy"
import logger from "../../utils/logger"
import OrderEventEmitter from "../event/Event"

export type Position = 'BOUGHT' | 'EMPTY'

class Referee {
  orderEventEmitter: OrderEventEmitter
  currentPosition: Position

  constructor(currentPosition: Position, order: OrderEventEmitter) {
    this.orderEventEmitter = order
    this.currentPosition = currentPosition
  }

  updateDecision(decision: StrategyDecision) {
    this.judge(decision)
    console.table([{ pricePosition: decision === 'TO_SELL' ? 'below' : 'above', position: this.currentPosition}])
  }

  judge(decision: StrategyDecision) {
    logger.log('REFEREE', `Strategie said ${decision}`)
    switch(decision){
      case('TO_BUY'):
        this.emitBuyOrder()
        break
      case('TO_SELL'):
        this.emitSellOrder()
        break
      default:
        logger.log('REFEREE', 'Doing nothing...')
        break
    }
  }

  emitBuyOrder() {
    if (this.currentPosition === 'BOUGHT') {
      logger.log('REFEREE', `Already in BOUGHT`)
      logger.log('REFEREE', 'Doing nothing...')
      return
    }
    this.currentPosition = 'BOUGHT'
    this.orderEventEmitter.emitter('BUY')
  }

  emitSellOrder() {
    if (this.currentPosition === 'EMPTY') {
      logger.log('REFEREE', `Already in EMPTY`)
      return
   }

   this.currentPosition = 'EMPTY'
   this.orderEventEmitter.emitter('SELL')
  }

  reverse() {
    this.currentPosition = this.currentPosition === 'BOUGHT' ? 'EMPTY' : 'BOUGHT'
  }
}

export default Referee