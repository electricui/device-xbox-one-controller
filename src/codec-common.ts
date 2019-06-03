export function bitMask(byte: number, bitmask: number) {
  return !!(byte & bitmask)
}

export const MAX_UINT16 = 2 ** 16 - 1
export const MAX_INT16 = 2 ** 15 - 1

export type XBoxControllerState = {
  leftThumbHorizontal: number
  leftThumbVertical: number
  rightThumbHorizontal: number
  rightThumbVertical: number
  leftTrigger: number
  rightTrigger: number
  dUp: boolean
  dDown: boolean
  dLeft: boolean
  dRight: boolean
  a: boolean
  b: boolean
  x: boolean
  y: boolean
  leftBumper: boolean
  rightBumper: boolean
  hambuger: boolean
  thumbLeftPressed: boolean
  thumbRightPressed: boolean
  windows: boolean
  xbox: boolean

  // index type
  [key: string]: number | boolean
}
