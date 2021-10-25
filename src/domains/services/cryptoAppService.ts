import { binanceClient } from "../../main";
import { PairInfo, Pairs } from "../../types/Pair";
import AppError from "../../utils/AppError";
import logger from "../../utils/logger";
import BotConfig from "../app/BotConfig";
import { GenericStrategy } from "../strategies/types";
import UserWalletService from "./WalletUserService";

class CryptoAppService {
  private botConfig!: BotConfig 
  private strategy!: GenericStrategy 
  private pair!: PairInfo
  private wallet!: UserWalletService

  async init() {
    this.wallet = new UserWalletService({
      pair: this.pair
    })
    
    let currentPosition = this.botConfig.config.startPosition

    if(!currentPosition) {
      logger.log('CRYPTO APP', 'No start position detected - looking for the last order...')
      const lastCandle = await binanceClient.lastOrder(this.pair.pair)
      currentPosition = lastCandle.side === 'BUY' ? 'BOUGHT' : 'EMPTY'
      logger.log('CRYPTO APP', `Using start position: ${currentPosition}`)

    }

    this.strategy.updateCandleReference(currentPosition)

    await this.wallet.getInitialBalance()
    this.wallet.startBalanceAndOrderUpdate()
    this.startUpdateStrategie()
  }

  setConfig(config: BotConfig) {
    this.botConfig = config
  }

  async setPairInfo(pair: Pairs) {
    logger.log('CRYPTO APP', 'Getting pair info')
    try {
      const PairInfo = await binanceClient.PairInfo(pair)
      this.pair = PairInfo
    } catch (err) {
      console.log(err)
      throw new AppError('CRYPTO_SERVICE', 'Error on get pair info')
    }
  }

  getPair() {
    return this.pair
  }

  async setStrategie(strategy: GenericStrategy) {
    this.strategy = strategy
  }

  startUpdateStrategie() {
    logger.log('CRYPTO APP', 'Initializing strategy update')
    binanceClient.createWsCandleStickUpdate({ pair: this.pair.pair, updateCallback: (candle) => {
      this.strategy.update(candle)
    }})
  }
}

export default CryptoAppService