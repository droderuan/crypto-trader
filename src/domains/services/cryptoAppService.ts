import { binanceClient } from "../../main";
import { SymbolInfo, Symbols } from "../../types/Symbol";
import AppError from "../../utils/AppError";
import BotConfig from "../app/BotConfig";
import { GenericStrategie } from "../strategies/types";
import UserWalletService from "./WalletUserService";

class CryptoAppService {
  private config!: BotConfig 
  private strategie!: GenericStrategie 
  private symbol!: SymbolInfo
  private wallet!: UserWalletService

  setConfig(config: BotConfig) {
    this.config = config
  }

  async setSymbol(symbol: Symbols) {
    try {
      const symbolInfo = await binanceClient.symbolInfo(symbol)
      this.symbol = symbolInfo
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