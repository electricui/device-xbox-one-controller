import { DeviceCandidate, DiscoveryHintValidator, Hint } from '@electricui/core'

export default class HintValidatorXboxController extends DiscoveryHintValidator {
  canValidate(hint: Hint): boolean {
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
  }

  startValidation() {
    const identification = this.hint.getIdentification()

    const boardID = `xbox-one-controller-${identification.serialNumber}`

    const candidate = new DeviceCandidate(boardID, this.connection)

    candidate.setMetadata({
      type: 'Xbox Wireless Controller',
    })

    this.pushDeviceCandidate(candidate)

    this.complete()
  }
}
