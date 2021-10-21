export interface Balance {
  [key: string]: {
    available: number | string,
    onOrder: number | string
  }
}