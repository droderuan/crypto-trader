import { SimpleSmaConfig } from "../strategies/SimpleSMA";
import { SmaCrossOverConfig } from "../strategies/SMACrossover";
import { CandleInterval } from "../../types/Candle";
import { Symbols } from "../../types/Symbol";

import { Position } from "../observer/Referee";
import { Strategies } from "../strategies/types";

interface SimpleSMA {
  name: "Simple SMA",
  config: SimpleSmaConfig
}

interface SMACrossover {
  name: "SMA Crossover",
  config: SmaCrossOverConfig
}

export type StrategieConfig = SimpleSMA | SMACrossover

interface BotConfigParams {
  symbol: Symbols
  strategie: StrategieConfig
  candleSize: CandleInterval
  updateInterval: number
  candleInterval: number
  startPosition: Position
}

class BotConfig {
  config: BotConfigParams

  constructor(config: BotConfigParams) {
    this.config = config
  }
}

export default BotConfig