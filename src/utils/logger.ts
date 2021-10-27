import chalk, { ChalkFunction } from 'chalk';

type AppModules = 'APP' | 'BINANCE CLIENT' | 'INDICATOR' | 'EVENT' | 'WALLET' | 'ERROR' | 'REFEREE' | 'STRATEGIE' | 'STRATEGIE BUILDER' | 'CRYPTO APP' | 'ORDER SERVICE'

interface Log {
  from: AppModules
  message: string
  bold?: boolean
  type?: 'ERROR' | 'LOG' | 'SUCCESS'
}

const colors = {
  APP: '#fafafa',
  ERROR: '#b71c1c',
  SUCCESS: '#00e676',
  EVENT: 'ffff00',
  BINANCE: '#ff9800',
  'CRYPTO APP': '#cddc39',
  STRATEGIE: '#b85cff',
  WALLET: '#b0fcff',
  REFEREE: '#a1887f',
  INDICATOR: '#039be5',
  'ORDER SERVICE': '#a5d6a7',
  TIME: '#76ff03'
}

const chalkObject = {
  'SUCCESS': {
    fromLog: () => chalk.bgHex(colors.SUCCESS),
    messageLog: (color: string) => chalk.hex(color)
  },
  'ERROR': {
    fromLog: () => chalk.bgHex(colors.ERROR),
    messageLog: (color: string) => chalk.hex(color)
  }, 
  'LOG': {
    fromLog: (color: string) => chalk.hex(color),
    messageLog: (color: string) => chalk.hex(color)
  },
  'BOLD': {
    fromLog: (color: string) => chalk.bgHex(color),
    messageLog: (color: string) => chalk.bold.hex(color)
  }
}

const logger =  {
  log: ({ from, message, bold, type='LOG' }: Log) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5);
    localISOTime = localISOTime.replaceAll('-', '/').replace('T',' ')
    
    const timeLog = chalk.hex(colors.TIME)
    const color = colors[from] as string

   const { fromLog, messageLog } = bold ? chalkObject.BOLD : chalkObject[type]
    
   console.log(`[${fromLog(color)(from)}] \t${timeLog(localISOTime)} \t${messageLog(color)(message)}`)
  }
}
export default logger