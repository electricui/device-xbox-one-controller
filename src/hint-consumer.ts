import { HID } from 'node-hid'

import { DiscoveryHintConsumer, Hint } from '@electricui/core'

import xboxOneControllerTransportFactory from './transport-factory'

export default function XboxOneControllerHintConsumerFactory(HID: any) {
  const consumer = new DiscoveryHintConsumer({
    factory: xboxOneControllerTransportFactory,
    canConsume: (hint: Hint) => {
      if (hint.getTransportKey() === 'hid') {
        const identification = hint.getIdentification()

        // check if it matches the right vendor and product IDs or it has the name there
        return (
          (identification.vendorId === 1118 &&
            identification.productId === 765) ||
          identification.product === 'Xbox Wireless Controller'
        )
      }
      return false
    },
    configure: (hint: Hint) => {
      const identification = hint.getIdentification()
      const configuration = hint.getConfiguration()

      return {
        HID: HID,
        path: identification.path,
      }
    },
  })

  return consumer
}
