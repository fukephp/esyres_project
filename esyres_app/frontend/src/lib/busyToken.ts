export type BusyLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type BusyToken = 'busy-free' | 'busy-moderate' | 'busy-busy'

const tokens: Record<BusyLevel, BusyToken> = {
  LOW: 'busy-free',
  MEDIUM: 'busy-moderate',
  HIGH: 'busy-busy',
}

export function busyToken(level: BusyLevel): BusyToken {
  return tokens[level]
}
