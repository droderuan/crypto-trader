import chalk from 'chalk';

type AppModules = 'APP'| 'BINANCE CLIENT' | 'MODELS' | 'EVENT' | 'WALLET' | 'ERROR' | 'REFEREE' | 'STRATEGIE' | 'STRATEGIE BUILDER' | 'CRYPTO APP'

const orange = chalk.hex('#e39400')
const blue = chalk.hex('#008cff')
const purple = chalk.hex('#b85cff')
const blueEsmerald = chalk.hex('#b0fcff')

const logger =  {
  log: (from: AppModules, message: string) => {
    switch(from){
      case 'APP':
        console.log(chalk.blueBright(`[${from}] ${message}`))
        break
      case 'BINANCE CLIENT':
        console.log(orange(`[${from}] ${message}`))
        break
      case 'CRYPTO APP':
        console.log(blueEsmerald(`[${from}] ${message}`))
        break
      case 'ERROR':
        console.log(chalk.bold.red(`[${from}] ${message}`))
        break
      case 'EVENT':
        console.log(chalk.yellow(`[${from}] ${message}`))
        break
      case 'MODELS':
        console.log(blue(`[${from}] ${message}`))
        break
      case 'REFEREE':
        console.log(chalk.cyanBright(`[${from}] ${message}`))
        break
      case 'STRATEGIE':
        console.log(purple(`[${from}] ${message}`))
        break
      case 'STRATEGIE BUILDER':
        console.log(purple(`[${from}] ${message}`))
        break
      case 'WALLET':
        console.log(chalk.cyan(`[${from}] ${message}`))
        break
    }
  }
}
export default logger