const HID = require('node-hid')

const devices = HID.devices()

const controller = devices.filter(
  device => device.product === 'Xbox One Wired Controller',
)[0]

console.log('Found controller', controller)

device = new HID.HID(controller.path)

let lastData = Buffer.alloc(0)

function createBinaryString(nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (
    var nFlag = 0, nShifted = nMask, sMask = '';
    nFlag < 32;
    nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1
  );
  return sMask.substr(-8)
}

device.on('data', data => {
  if (lastData.equals(data)) {
    return
  }

  lastData = data
  const buttonMask1 = data[2]
  const buttonMask2 = data[3]

  //console.log(createBinaryString(buttonMask1), createBinaryString(buttonMask2))

  console.log(data)
})
