import { Codec, Message } from '@electricui/core'
import { MAX_INT16, XBoxControllerState, bitMask } from './codec-common'

export class XboxOneWiredControllerDecoderCodec extends Codec {
  state: XBoxControllerState = {
    leftThumbHorizontal: 0,
    leftThumbVertical: 0,
    rightThumbHorizontal: 0,
    rightThumbVertical: 0,
    leftTrigger: 0,
    rightTrigger: 0,
    dUp: false,
    dDown: false,
    dLeft: false,
    dRight: false,
    a: false,
    b: false,
    x: false,
    y: false,
    leftBumper: false,
    rightBumper: false,
    hambuger: false,
    thumbLeftPressed: false,
    thumbRightPressed: false,
    windows: false,
    xbox: false,
  }

  filter(message: Message): boolean {
    // We don't process null payloads
    if (message.payload === null) {
      return false
    }

    // this codec processes all incoming event packets that start with 0x0014
    return message.messageID === 'event' && message.payload[0] === 0x00 && message.payload[1] === 0x14
  }

  encode(payload: never) {
    return payload
  }

  decode(data: Buffer) {
    // 00 14 00 00 ff 00 13 01 29 01 ea 02 55 06

    // [---] mask to say its a regular packet
    //       [---] button presses
    //             [] left trigger
    //                [] right trigger

    // 0
    // 1
    // just some kind of mask for the packets

    // 2
    const dUp =               bitMask(data[2], 0b00000001) // prettier-ignore
    const dDown =             bitMask(data[2], 0b00000010) // prettier-ignore
    const dLeft =             bitMask(data[2], 0b00000100) // prettier-ignore
    const dRight =            bitMask(data[2], 0b00001000) // prettier-ignore
    const hambuger =          bitMask(data[2], 0b00010000) // prettier-ignore
    const windows =           bitMask(data[2], 0b00100000) // prettier-ignore
    const thumbLeftPressed =  bitMask(data[2], 0b01000000) // prettier-ignore
    const thumbRightPressed = bitMask(data[2], 0b10000000) // prettier-ignore

    // 3
    const leftBumper =  bitMask(data[3], 0b00000001) // prettier-ignore
    const rightBumper = bitMask(data[3], 0b00000010) // prettier-ignore
    const xbox =        bitMask(data[3], 0b00000100) // prettier-ignore
    //    missing bit                    0b00001000
    const a =           bitMask(data[3], 0b00010000) // prettier-ignore
    const b =           bitMask(data[3], 0b00100000) // prettier-ignore
    const x =           bitMask(data[3], 0b01000000) // prettier-ignore
    const y =           bitMask(data[3], 0b10000000) // prettier-ignore

    // 4
    let leftTrigger = data[4] / 255

    // 5
    let rightTrigger = data[5] / 255

    // 6
    // 7
    // normalize to -1 left to 1 right

    // from 00 80 left to ff 7f right
    const leftThumbHorizontal = data.readInt16LE(6) / MAX_INT16

    // 8
    // 9
    // normalize to -1 top to 1 bottom
    const leftThumbVertical = data.readInt16LE(8) / MAX_INT16

    // 10
    // 11
    // normalize to -1 right to 1 right
    const rightThumbHorizontal = data.readInt16LE(10) / MAX_INT16

    // 12
    // 13
    // normalize to -1 top to 1 bottom
    const rightThumbVertical = data.readInt16LE(12) / MAX_INT16

    return {
      leftThumbHorizontal,
      leftThumbVertical,
      rightThumbHorizontal,
      rightThumbVertical,
      leftTrigger,
      rightTrigger,
      dUp,
      dDown,
      dLeft,
      dRight,
      a,
      b,
      x,
      y,
      leftBumper,
      rightBumper,
      hambuger,
      thumbLeftPressed,
      thumbRightPressed,
      windows,
      xbox,
    }
  }
}
