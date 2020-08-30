import { DeviceCandidate, DiscoveryHintValidator, Hint } from '@electricui/core'
import { isWiredXBoxController, isWirelessXBoxController } from './utils'

/*
Wireless XBox controller

{ 
  vendorId: 1118,
  productId: 765,
  path:
   'IOService:/IOResources/IOBluetoothHCIController/AppleBroadcomBluetoothHostController/IOBluetoothDevice/IOBluetoothL2CAPChannel/IOBluetoothHIDDriver',
  serialNumber: '5c-ba-37-f7-83-ee',
  manufacturer: 'Unknown',
  product: 'Xbox Wireless Controller',
  release: 2307,
  interface: -1,
  usagePage: 1,
  usage: 5 
}

Wired XBox controller

{ 
  vendorId: 1118,
  productId: 746,
  path:
   'IOService:/IOResources/AppleUSBHostResources/AppleUSBLegacyRoot/AppleUSBXHCI@14000000/Controller@14100000/Xbox360Peripheral/XboxOneControllerClass',
  serialNumber: '3032363030303037393236383130',
  manufacturer: 'Microsoft',
  product: 'Xbox One Wired Controller',
  release: 0,
  interface: -1,
  usagePage: 1,
  usage: 5 
}

*/

const deviceType = 'Xbox One Controller'

export default class HintValidatorXboxController extends DiscoveryHintValidator {
  canValidate(hint: Hint): boolean {
    if (hint.getTransportKey() === 'hid') {
      const identification = hint.getIdentification()

      // Since we can do this synchronously, we may as well just do it here once.
      return (
        isWirelessXBoxController(identification) ||
        isWiredXBoxController(identification)
      )
    }
    return false
  }

  startValidation() {
    const identification = this.hint.getIdentification()

    const boardID = `xbox-one-controller-${identification.serialNumber}`

    const candidate = new DeviceCandidate(boardID, this.connection)

    candidate.setMetadata({
      type: deviceType,
    })

    this.pushDeviceCandidate(candidate, this.cancellationToken)

    this.complete()
  }
}
