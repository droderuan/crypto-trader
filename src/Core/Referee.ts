import { modelDecision } from "../models/genericModel"
import { Opinion } from "../types/Decision"
import logger from "../utils/logger"
import Order from "./Event"

export type Position = 'BOUGHT' | 'EMPTY'

type Actions = {[key in Opinion]: Function}

class Referee {
  consecutiveSells = 0
  lockFor = 0
  lock = 0

  action = {} as Actions
  order: Order
  currentPosition: Position = 'BOUGHT'

  constructor(currentPosition: Position, lockFor=5, order: Order) {
    this.order = order
    this.lockFor = lockFor
    this.currentPosition = currentPosition
  }

  updateDecision(modelDecision: modelDecision) {
    this.judge(modelDecision)
    console.table([{ pricePosition: modelDecision === 'TO_SELL' ? 'below' : 'above', position: this.currentPosition, consecutiveSells: this.consecutiveSells}])
   
  }

  judge(modelDecision: modelDecision) {
    logger.log('REFEREE', `Model said ${modelDecision}`)
    if(modelDecision === 'TO_BUY') {

      if (this.currentPosition === 'BOUGHT') {
        logger.log('REFEREE', `Already in BOUGHT`)
        return logger.log('REFEREE', 'Doing nothing...')
      }

      this.order.emitter('BUY')
      this.currentPosition = 'BOUGHT'
    } else if (modelDecision === 'TO_SELL') {

      if (this.currentPosition === 'EMPTY') {
         logger.log('REFEREE', `Already in EMPTY`)
         return logger.log('REFEREE', 'Doing nothing...')
      }

      this.order.emitter('SELL')
      this.currentPosition = 'EMPTY'
    } else {
      logger.log('REFEREE', 'Doing nothing...')
    }
  }

  reverse() {
    this.currentPosition = this.currentPosition === 'BOUGHT' ? 'EMPTY' : 'BOUGHT'
  }
}

export default Referee