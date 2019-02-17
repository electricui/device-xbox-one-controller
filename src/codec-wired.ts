import { Codec, Message, PushCallback } from '@electricui/core'

import { bitMask, mapRange, MAX_UINT16, XBoxControllerState } from './codec-common'

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
    return (
      message.messageID === 'event' &&
      message.payload[0] === 0x00 &&
      message.payload[1] === 0x14
    )
  }

  encode(message: Message, push: PushCallback) {
    return push(message)
  }

  updateState = (
    key: keyof XBoxControllerState,
    val: boolean | number,
    push: PushCallback,
  ) => {
    const oldState = this.state[key]
    this.state[key] = val
    if (oldState !== val) {
      const message = new Message(key, val)
      return push(message)
    }

    return null
  }

  decode(message: Message, push: PushCallback) {
    const data = message.payload

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
    const leftThumbHorizontal = mapRange(
      data.readUInt16LE(6),
      0x0080,
      0xff7f,
      -1,
      1,
    )

    // 8
    // 9
    // normalize to -1 top to 1 bottom
    const leftThumbVertical = mapRange(
      data.readUInt16LE(8),
      0x0080,
      0xff7f,
      -1,
      1,
    )

    // 10
    // 11
    // normalize to -1 right to 1 right
    const rightThumbHorizontal = mapRange(
      data.readUInt16LE(10),
      0x0080,
      0xff7f,
      -1,
      1,
    )

    // 12
    // 13
    // normalize to -1 top to 1 bottom
    const rightThumbVertical = mapRange(
      data.readUInt16LE(12),
      0x0080,
      0xff7f,
      -1,
      1,
    )

    return Promise.all(
      [
        this.updateState('leftThumbHorizontal', leftThumbHorizontal, push), // prettier-ignore
        this.updateState('leftThumbVertical', leftThumbVertical, push), // prettier-ignore
        this.updateState('rightThumbHorizontal', rightThumbHorizontal, push), // prettier-ignore
        this.updateState('rightThumbVertical', rightThumbVertical, push), // prettier-ignore
        this.updateState('leftTrigger', leftTrigger, push), // prettier-ignore
        this.updateState('rightTrigger', rightTrigger, push), // prettier-ignore
        this.updateState('dUp', dUp, push), // prettier-ignore
        this.updateState('dDown', dDown, push), // prettier-ignore
        this.updateState('dLeft', dLeft, push), // prettier-ignore
        this.updateState('dRight', dRight, push), // prettier-ignore
        this.updateState('a', a, push), // prettier-ignore
        this.updateState('b', b, push), // prettier-ignore
        this.updateState('x', x, push), // prettier-ignore
        this.updateState('y', y, push), // prettier-ignore
        this.updateState('leftBumper', leftBumper, push), // prettier-ignore
        this.updateState('rightBumper', rightBumper, push), // prettier-ignore
        this.updateState('hambuger', hambuger, push), // prettier-ignore
        this.updateState('thumbLeftPressed', thumbLeftPressed, push), // prettier-ignore
        this.updateState('thumbRightPressed', thumbRightPressed, push), // prettier-ignore
        this.updateState('windows', windows, push), // prettier-ignore
        this.updateState('xbox', xbox, push), // prettier-ignore
      ].filter(promise => promise !== null),
    )
  }
}
