import { HintIdentification } from '@electricui/core'

export function isWirelessXBoxController(identification: HintIdentification) {
  return (
    identification.vendorId === 1118 &&
    identification.productId === 765 &&
    identification.product === 'Xbox Wireless Controller'
  )
}

export function isWiredXBoxController(identification: HintIdentification) {
  return (
    identification.vendorId === 1118 &&
    identification.productId === 746 &&
    identification.product === 'Xbox One Wired Controller'
  )
}
