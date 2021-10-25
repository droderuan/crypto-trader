import { binanceClient } from "../../main";
import { SymbolInfo } from "../../types/Symbol";

interface CreateOrder{
  symbolInfo: SymbolInfo,
  quantity: number
}

class OrderService {
  async create({symbolInfo}: CreateOrder){
    const pair = symbolInfo.symbol
    const currentValue = await binanceClient.currentPrice(pair)
    const quantityWithoufix = Number(this.balance[this.buyWith].available) / this.currentValue
    const quantity = this.fixeNumber(quantityWithoufix)

    logger.log('WALLET', `${this.balance[this.buyWith].available} of ${this.buyWith}`)
    logger.log('WALLET', `Buying ${quantity} ${this.buyWith} of ${this.sellWith}`)

    this.lastOrder = await this.binanceClient.createBuyOrder(pair, quantity, this.currentValue)
  }
}

export default OrderService