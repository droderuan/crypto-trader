import chalk from 'chalk';

type AppModules = 'APP'| 'BINANCE CLIENT' | 'INDICATOR' | 'EVENT' | 'WALLET' | 'ERROR' | 'REFEREE' | 'STRATEGIE' | 'STRATEGIE BUILDER' | 'CRYPTO APP'

const colors = {
  app: chalk.bold.hex('#fafafa'),
  error: chalk.bold.hex('#b71c1c'),
  event: chalk.bold.hex('ffff00'),
  binance: chalk.hex('#ff9800'),
  cryptoApp: chalk.hex('#cddc39'),
  strategie: chalk.hex('#b85cff'),
  wallet: chalk.hex('#b0fcff'),
  referee: chalk.hex('#3949ab'),
  indicator: chalk.hex('#039be5')
}

const logger =  {
  log: (from: AppModules, message: string) => {
    switch(from){
      case 'APP':
        console.log(colors.app(`[${from}] ${message}`))
        break
      case 'BINANCE CLIENT':
        console.log(colors.binance(`[${from}] ${message}`))
        break
      case 'CRYPTO APP':
        console.log(colors.cryptoApp(`[${from}] ${message}`))
        break
      case 'ERROR':
        console.log(colors.error(`[${from}] ${message}`))
        break
      case 'EVENT':
        console.log(colors.event(`[${from}] ${message}`))
        break
      case 'INDICATOR':
        console.log(colors.indicator(`[${from}] ${message}`))
        break
      case 'REFEREE':
        console.log(colors.referee(`[${from}] ${message}`))
        break
      case 'STRATEGIE':
        console.log(colors.strategie(`[${from}] ${message}`))
        break
      case 'STRATEGIE BUILDER':
        console.log(colors.strategie(`[${from}] ${message}`))
        break
      case 'WALLET':
        console.log(colors.wallet(`[${from}] ${message}`))
        break
    }
  }
}
export default logger