import { opinion } from "../types/Decision"
import logger from "../utils/logger"
import Order from "./Event"

type actions = {[key in opinion]: Function}

class Referee {
  private buyScore = 14
  minimumScore = 0
  scoreMultiplier = 0
  consecutiveSells = 0
  sellDecreaser = 0

  lockFor = 0
  lock = 0

  action = {} as actions
  order: Order
  currentPosition = 'BOUGHT'

  constructor(minimumScoreToBuy: number, multiplier=1, lockFor=5, order: Order) {
    this.minimumScore = minimumScoreToBuy
    this.scoreMultiplier = multiplier
    this.sellDecreaser = multiplier
    this.order = order
    this.lockFor = lockFor

    this.action = {
      "STRONG BUY": () => this.increaseScore('STRONG BUY'),
      "BUY": () => this.increaseScore('BUY'),
      "SUPPORT": () => this.buyScore + 0,
      "SELL": () => this.decreaseScore('SELL'),
      "STRONG SELL": () => this.decreaseScore('STRONG SELL'),
    } as actions
  }

  updateDecision(opinion: opinion | null, priceBelow: boolean) {
    if (opinion === null){
      this.judge(priceBelow)
      console.table([{ pricePosition: priceBelow ? 'below' : 'above', position: this.currentPosition, consecutiveSells: this.consecutiveSells, lock: this.lock>0 }])
    }else {
      this.action[opinion]()
      this.judge()
      console.table([{ lastOpinion: opinion, score: this.buyScore, targetToBuy: this.minimumScore, position: this.currentPosition, consecutiveSells: this.consecutiveSells, lock: this.lock>0 }])
    }
  }

  judge(priceBelow?: boolean) {
    if (this.lock <=0){
      if(priceBelow === undefined) {
        this.checkAndBuyByScore()
      } else {
        this.checkAndBuyByModel(priceBelow)
      }
    }
    this.lock = this.lock - 1 === 0 ? 0 : this.lock - 1
  }

  checkAndBuyByModel(sell: boolean) {
    if(!sell  && this.currentPosition === 'EMPTY') {
      this.order.emitter('BUY')
      this.lock = this.lockFor
      this.currentPosition = 'BOUGHT'
    } else if (sell && this.currentPosition === 'BOUGHT') {
      this.order.emitter('SELL')
      this.lock = this.lockFor
      this.currentPosition = 'EMPTY'
    }
  }

  checkAndBuyByScore() {
    if (this.buyScore >= this.minimumScore && this.currentPosition === 'EMPTY' ) {
      this.order.emitter('BUY')
      this.lock = this.lockFor
      this.currentPosition = 'BOUGHT'
    } else if (this.buyScore < this.minimumScore && this.currentPosition === 'BOUGHT'){
      this.order.emitter('SELL')
      this.lock = this.lockFor
      this.currentPosition = 'EMPTY'
    }
  }

  increaseScore(type:  "BUY" | "STRONG BUY") {
    this.consecutiveSells = 0

    if (type==='STRONG BUY') {
      this.buyScore += this.scoreMultiplier
    } else {
      this.buyScore += 1
    }

    if (this.buyScore>20) {
      this.buyScore = 20
    }

  }

  decreaseScore(type:  "SELL" | "STRONG SELL") {
    this.consecutiveSells += 1
    if (this.consecutiveSells % 3 === 0) {
      this.sellDecreaser += this.scoreMultiplier
    }

    if (type === 'SELL') {
      this.buyScore -= 1
    } else {
      this.buyScore -= this.sellDecreaser
    }


    if(this.buyScore <= 0) {
      this.buyScore = 0
      this.sellDecreaser = this.scoreMultiplier
    }
  }

}

export default Referee