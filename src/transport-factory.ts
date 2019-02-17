import {
  CodecDuplexPipeline,
  ConnectionInterface,
  DeliverabilityManagerDumb,
  QueryManagerNone,
  TransportFactory,
  TypeCache,
} from '@electricui/core'
import { HIDTransport } from '@electricui/transport-node-hid'

import { XboxOneWiredControllerDecoderCodec } from './codec-wired'
import {
  XboxOneWirelessControllerDecoderCodec,
  XboxOneWirelessControllerVibrationCodec,
} from './codec-wireless'

export const XboxOneControllerTransportFactory = new TransportFactory(
  options => {
    const connectionInterface = new ConnectionInterface()
    const controllerCodec = options.controllerCodec

    const transport = new HIDTransport(options)

    const deliverabilityManager = new DeliverabilityManagerDumb(
      connectionInterface,
    )
    const queryManager = new QueryManagerNone(connectionInterface)

    const codecPipeline = new CodecDuplexPipeline()

    let codec

    switch (controllerCodec) {
      case 'wired':
        codec = new XboxOneWiredControllerDecoderCodec()
        break

      case 'wireless':
        codec = new XboxOneWirelessControllerDecoderCodec()
        break

      default:
        throw new Error('Unknown XBox controller codec type.')
    }

    const vibrate = new XboxOneWirelessControllerVibrationCodec()
    codecPipeline.addCodecs([codec, vibrate])

    connectionInterface.setTransport(transport)
    connectionInterface.setQueryManager(queryManager)
    connectionInterface.setDeliverabilityManager(deliverabilityManager)
    connectionInterface.setPipelines([codecPipeline])

    connectionInterface.finalise()

    return connectionInterface
  },
)
