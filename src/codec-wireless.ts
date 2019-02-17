import { Codec, Message, PushCallback } from '@electricui/core'

import { bitMask, MAX_UINT16, XBoxControllerState } from './codec-common'

export class XboxOneWirelessControllerDecoderCodec extends Codec {
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

    // if it's a xbox button press, we handle the special event
    if (message.payload[0] === 0x02) {
      return true
    }

    // this codec processes all incoming event packets as well
    return message.messageID === 'event' && message.payload[0] === 0x01
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

    // if this is an xbox button press
    if (data[0] === 0x02) {
      // these events always come in on their own, so we can just bail early
      // if it's pressed it's 0x02 0x01
      // if it's not     it's 0x02 0x00
      const xbox = new Message('xbox', data[1] === 0x01)
      return push(xbox)
    }

    if (data[0] !== 0x01) {
      console.log(
        "An xbox packet came over the line that we don't understand yet, probably the heartbeat thing?",
      )
      console.log(data)
      return Promise.resolve()
    }

    // 1
    // 2
    // normalize to -1 left to 1 right
    const leftThumbHorizontal = (data.readUInt16LE(1) / MAX_UINT16) * 2 - 1

    // 3
    // 4
    // normalize to -1 top to 1 bottom
    const leftThumbVertical = (data.readUInt16LE(3) / MAX_UINT16) * 2 - 1

    // 5
    // 6
    // normalize to -1 right to 1 right
    const rightThumbHorizontal = (data.readUInt16LE(5) / MAX_UINT16) * 2 - 1

    // 7
    // 8
    // normalize to -1 top to 1 bottom
    const rightThumbVertical = (data.readUInt16LE(7) / MAX_UINT16) * 2 - 1

    // 9
    let leftTrigger = data[9]

    // 10
    const leftTriggerAlias = data[10] & 0b00000011
    const leftTriggerOneQuarter = leftTriggerAlias === 0b00000001
    const leftTriggerTwoQuarterPress = leftTriggerAlias === 0b00000010
    const leftTriggerThreeQuarterPress = leftTriggerAlias === 0b00000011

    if (leftTriggerOneQuarter) leftTrigger = leftTrigger + 256 + 1
    if (leftTriggerTwoQuarterPress) leftTrigger = leftTrigger + 256 * 2 + 1
    if (leftTriggerThreeQuarterPress) leftTrigger = leftTrigger + 256 * 3 + 1
    leftTrigger = leftTrigger / 1024

    // 11
    let rightTrigger = data[11]

    // 12
    const rightTriggerAlias = data[12] & 0b00000011
    const rightTriggerOneQuarter = rightTriggerAlias === 0b00000001
    const rightTriggerTwoQuarterPress = rightTriggerAlias === 0b00000010
    const rightTriggerThreeQuarterPress = rightTriggerAlias === 0b00000011

    if (rightTriggerOneQuarter) rightTrigger = rightTrigger + 256 + 1
    if (rightTriggerTwoQuarterPress) rightTrigger = rightTrigger + 256 * 2 + 1
    if (rightTriggerThreeQuarterPress) rightTrigger = rightTrigger + 256 * 3 + 1
    rightTrigger = rightTrigger / 1024

    // 13
    //  d is a clock like count using the last 4 bits of byte 13,
    //  1 represents 'up', 2 represents 'up+right', 3 represents 'right', etc.
    const dPad = data[13] & 0b00001111
    const dUp =
      dPad === 0b00000001 || dPad === 0b00000010 || dPad === 0b00001000
    const dDown =
      dPad === 0b00000101 || dPad === 0b00000100 || dPad === 0b00000110
    const dLeft =
      dPad === 0b00000111 || dPad === 0b00000110 || dPad === 0b00001000
    const dRight =
      dPad === 0b00000011 || dPad === 0b00000100 || dPad === 0b00000010

    // 14
    const a = bitMask(data[14], 0b00000001)
    const b = bitMask(data[14], 0b00000010)
    const x = bitMask(data[14], 0b00001000)
    const y = bitMask(data[14], 0b00010000)
    const leftBumper = bitMask(data[14], 0b01000000)
    const rightBumper = bitMask(data[14], 0b10000000)

    // 15
    const hambuger = bitMask(data[15], 0b00001000)
    const thumbLeftPressed = bitMask(data[15], 0b00100000)
    const thumbRightPressed = bitMask(data[15], 0b01000000)

    // 16
    const windows = bitMask(data[16], 0b00000001)

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
      ].filter(promise => promise !== null),
    )
  }
}

export class XboxOneWirelessControllerVibrationCodec extends Codec {
  filter(message: Message): boolean {
    // this codec processes outgoing vibration modes
    return message.messageID === 'vibrate'
  }

  encode(message: Message, push: PushCallback) {
    const payload = message.payload
    message.payload = [
      0x03, // reportID
      0xff, // activationMask
      (payload.ltMagnitude / 1) * 0x65, // ltMagnitude: 0 - 1
      (payload.rtMagnitude / 1) * 0x65, // rtMagnitude: 0 - 1
      (payload.leftMagnitude / 1) * 0x65, // leftMagnitude: 0 - 1
      (payload.rightMagnitude / 1) * 0x65, // rightMagnitude: 0 - 1
      payload.duration, // duration: 0 - 255
      payload.startDelay, // startDelay: 0 - 255
      payload.loopCount, // loopCount: 0 - 255
    ]

    return push(message)
  }

  decode(message: Message, push: PushCallback) {
    return push(message)
  }
}
