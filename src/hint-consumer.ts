import { HID } from 'node-hid'

import { DiscoveryHintConsumer, Hint } from '@electricui/core'

import { XboxOneControllerTransportFactory } from './transport-factory'
import { isWiredXBoxController, isWirelessXBoxController } from './utils'

export default function XboxOneControllerHintConsumerFactory(HID: any) {
  const consumer = new DiscoveryHintConsumer({
    factory: XboxOneControllerTransportFactory,
    canConsume: (hint: Hint) => {
      if (hint.getTransportKey() === 'hid') {
        const identification = hint.getIdentification()

        // return both
        return (
          isWirelessXBoxController(identification) ||
          isWiredXBoxController(identification)
        )
      }
      return false
    },
    configure: (hint: Hint) => {
      const identification = hint.getIdentification()
      const configuration = hint.getConfiguration()

      let controllerCodec = 'unknown'

      if (isWirelessXBoxController(identification)) {
        controllerCodec = 'wireless'
      } else if (isWiredXBoxController(identification)) {
        controllerCodec = 'wired'
      }

      return {
        HID: HID,
        path: identification.path,
        controllerCodec,
      }
    },
  })

  return consumer
}
