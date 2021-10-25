const logger =  {
  log: (from: 'APP'| 'BINANCE CLIENT' | 'MODELS' | 'EVENT' | 'WALLET' | 'ERROR' | 'REFEREE' | 'STRATEGIE' | 'STRATEGIE BUILDER', message: string) => {
    console.log(`[${from}] ${message}`)
  }
}
export default logger