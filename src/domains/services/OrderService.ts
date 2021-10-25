import { binanceClient } from "../../main";
import { PairInfo } from "../../types/Pair";

interface CreateOrder{
  PairInfo: PairInfo,
  quantity: number
}

class OrderService {
  async create({PairInfo}: CreateOrder){
    const pair = PairInfo.symbol
    const currentValue = await binanceClient.currentPrice(pair)
    const quantityWithoufix = Number(this.balance[this.buyWith].available) / this.currentValue
    const quantity = this.fixeNumber(quantityWithoufix)

    logger.log('WALLET', `${this.balance[this.buyWith].available} of ${this.buyWith}`)
    logger.log('WALLET', `Buying ${quantity} ${this.buyWith} of ${this.sellWith}`)

    this.lastOrder = await this.binanceClient.createBuyOrder(pair, quantity, this.currentValue)
  }
}

export default OrderService