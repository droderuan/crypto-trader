export type candleInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M"

export interface Candlestick {
  symbol: string,
  startedAt: number,
  closedAt: number,
  interval: candleInterval,
  openPrice: string,
  closePrice: string,
  highPrice: string,
  lowPrice: string,
  closed: boolean,
}

export class Candlestick {
  
  static parse(candlestickDTO: CandleResponseDTO): Candlestick {
    return {
      symbol: candlestickDTO.s,
      startedAt: candlestickDTO.k.t,
      closedAt:candlestickDTO.k.T,
      interval:candlestickDTO.k.i,
      openPrice:candlestickDTO.k.o,
      closePrice:candlestickDTO.k.c,
      highPrice:candlestickDTO.k.h,
      lowPrice:candlestickDTO.k.l,
      closed:candlestickDTO.k.x,
    } as Candlestick
  }
}