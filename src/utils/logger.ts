import chalk from 'chalk';

type AppModules = 'APP' | 'BINANCE CLIENT' | 'INDICATOR' | 'EVENT' | 'WALLET' | 'ERROR' | 'REFEREE' | 'STRATEGIE' | 'STRATEGIE BUILDER' | 'CRYPTO APP' | 'ORDER SERVICE'

const colors = {
  app: chalk.bold.hex('#fafafa'),
  error: chalk.bold.hex('#b71c1c'),
  event: chalk.bold.hex('ffff00'),
  binance: chalk.hex('#ff9800'),
  cryptoApp: chalk.hex('#cddc39'),
  strategie: chalk.hex('#b85cff'),
  wallet: chalk.hex('#b0fcff'),
  referee: chalk.hex('#a1887f'),
  indicator: chalk.hex('#039be5'),
  orderService: chalk.hex('#a5d6a7'),
  time: chalk.hex('#81c784')
}

const logger =  {
  log: (from: AppModules, message: string, type?: 'green' | 'red') => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5);
    
    switch(from){
      case 'APP':
        console.log(colors.time(localISOTime) + ' ' + colors.app(`[${from}] ${message}`))
        break
      case 'BINANCE CLIENT':
        console.log(colors.time(localISOTime) + ' ' + colors.binance(`[${from}] ${message}`))
        break
      case 'CRYPTO APP':
        if(type){
          if(type === 'green'){
            console.log(colors.time(localISOTime) + ' ' + colors.cryptoApp(`[${from}]`) + chalk.green.bold(` ${message}`))
          } else if(type === 'red'){
            console.log(colors.time(localISOTime) + ' ' + colors.cryptoApp(`[${from}]`) + colors.error(` ${message}`))
          }
        } else {
          console.log(colors.time(localISOTime) + ' ' + colors.cryptoApp(`[${from}] ${message}`))
        }
        break
      case 'ERROR':
        console.log(colors.time(localISOTime) + ' ' + colors.error(`[${from}] ${message}`))
        break
      case 'EVENT':
        console.log(colors.time(localISOTime) + ' ' + chalk.hex('#000').bgYellow(`[${from}]`) + colors.event(` ${message}`))
        break
      case 'INDICATOR':
        console.log(colors.time(localISOTime) + ' ' + colors.indicator(`[${from}] ${message}`))
        break
      case 'REFEREE':
        console.log(colors.time(localISOTime) + ' ' + colors.referee(`[${from}] ${message}`))
        break
      case 'STRATEGIE':
        console.log(colors.time(localISOTime) + ' ' + colors.strategie(`[${from}] ${message}`))
        break
      case 'STRATEGIE BUILDER':
        console.log(colors.time(localISOTime) + ' ' + colors.strategie(`[${from}] ${message}`))
        break
      case 'WALLET':
        console.log(colors.time(localISOTime) + ' ' + colors.wallet(`[${from}] ${message}`))
        break
      case 'ORDER SERVICE':
        console.log(colors.time(localISOTime) + ' ' + chalk.hex('#000').bgGreen(`[${from}]`) + colors.orderService(` ${message}`))
        break
    }
  }
}
export default logger