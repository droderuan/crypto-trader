import { binanceClient } from "../../main";
import { PairInfo, Pairs } from "../../types/Pair";
import AppError from "../../utils/AppError";
import BotConfig from "../app/BotConfig";
import { GenericStrategie } from "../strategies/types";
import UserWalletService from "./WalletUserService";

class CryptoAppService {
  private config!: BotConfig 
  private strategie!: GenericStrategie 
  private symbol!: PairInfo
  private wallet!: UserWalletService

  setConfig(config: BotConfig) {
    this.config = config
  }

  async setSymbol(symbol: Pairs) {
    try {
      const PairInfo = await binanceClient.PairInfo(symbol)
      this.symbol = PairInfo
    } catch (err) {
      throw new AppError('CRYPTO_SERVICE', 'Error on get symbol info')
    }
  }

  getSymbol() {
    return this.symbol
  }

  async setStrategie(strategie: GenericStrategie) {
    this.strategie = strategie
  }

  async init() {
    this.wallet = new UserWalletService({
      symbol: this.symbol
    })

    await this.wallet.getInitialBalance()
    this.wallet.startBalanceAndOrderUpdate()
  }
}

export default CryptoAppService