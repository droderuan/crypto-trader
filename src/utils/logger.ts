const logger =  {
  log: (from: 'APP'| 'BINANCE CLIENT' | 'MODELS' | 'EVENT' | 'WALLET' | 'ERROR', message: string) => {
    console.log(`[${from}] ${message}`)
  }
}
export default logger