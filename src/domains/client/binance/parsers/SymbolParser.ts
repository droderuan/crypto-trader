import { SymbolInfo } from "../../../../types/Symbol"
import AppError from "../../../../utils/AppError"
import { SymbolsResponseDTO } from "../../dtos/SymbolResponseDTO"

export class SymbolParser {
  static parse({ symbols }: SymbolsResponseDTO) {
    return symbols.map(value => {
      const lotSize = value.filters.find((filter) => filter.filterType === 'LOT_SIZE')
      if(!lotSize || lotSize.filterType !== 'LOT_SIZE') {
        throw new AppError('SYMBOL_PARSER', 'No LOT_SIZE fitler find')
      }

      const precision = String(parseFloat(lotSize.stepSize)).split('.')[1].length

      return {
        symbol: value.symbol,
        buyCoin: value.quoteAsset,
        buyCoinPrecision: value.quoteAssetPrecision,
        sellCoin: value.baseAsset,
        sellCoinPrecision: value.baseAssetPrecision,
        maxQty: parseFloat(lotSize.maxQty),
        minQty: parseFloat(lotSize.maxQty),
        stepSize: parseFloat(lotSize.stepSize),
        status: value.status,
        precisionRound: precision
      } as SymbolInfo
    })
  }
}