import { StrategieDecision } from "../strategies/types"
import logger from "../../utils/logger"
import Order from "../event/Event"

export type Position = 'BOUGHT' | 'EMPTY'

class Referee {
  orderEventEmitter: Order
  currentPosition: Position = 'BOUGHT'

  constructor(currentPosition: Position, order: Order) {
    this.orderEventEmitter = order
    this.currentPosition = currentPosition
  }

  updateDecision(decision: StrategieDecision) {
    this.judge(decision)
    console.table([{ pricePosition: decision === 'TO_SELL' ? 'below' : 'above', position: this.currentPosition}])
  }

  judge(decision: StrategieDecision) {
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
    }
  }

  emitBuyOrder() {
    if (this.currentPosition === 'BOUGHT') {
      logger.log('REFEREE', `Already in BOUGHT`)
      return logger.log('REFEREE', 'Doing nothing...')
    }
    this.orderEventEmitter.emitter('BUY')
    this.currentPosition = 'BOUGHT'
  }

  emitSellOrder() {
    if (this.currentPosition === 'EMPTY') {
      logger.log('REFEREE', `Already in EMPTY`)
      return logger.log('REFEREE', 'Doing nothing...')
   }

   this.orderEventEmitter.emitter('SELL')
   this.currentPosition = 'EMPTY'
  }

  reverse() {
    this.currentPosition = this.currentPosition === 'BOUGHT' ? 'EMPTY' : 'BOUGHT'
  }
}

export default Referee