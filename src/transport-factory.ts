import {
  CodecDuplexPipeline,
  ConnectionInterface,
  DeliverabilityManagerDumb,
  QueryManagerNone,
  TransportFactory,
  TypeCache,
} from '@electricui/core'
import { HIDTransport } from '@electricui/transport-node-hid'

import { XboxOneControllerGeneralDecoderCodec, XboxOneControllerVibrationCodec } from './codec'

const xboxOneControllerTransportFactory = new TransportFactory(options => {
  const connectionInterface = new ConnectionInterface()

  const transport = new HIDTransport(options)

  const deliverabilityManager = new DeliverabilityManagerDumb(
    connectionInterface,
  )
  const queryManager = new QueryManagerNone(connectionInterface)

  const codecPipeline = new CodecDuplexPipeline()

  const codec = new XboxOneControllerGeneralDecoderCodec()
  const vibrate = new XboxOneControllerVibrationCodec()
  codecPipeline.addCodecs([codec, vibrate])

  connectionInterface.setTransport(transport)
  connectionInterface.setQueryManager(queryManager)
  connectionInterface.setDeliverabilityManager(deliverabilityManager)
  connectionInterface.setPipelines([codecPipeline])

  connectionInterface.finalise()

  return connectionInterface
})

export default xboxOneControllerTransportFactory
