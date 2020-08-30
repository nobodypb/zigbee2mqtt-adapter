module.exports = {
  'LED1536G5': {
    name: 'IKEA TRADFRI LED bulb E12/E14 400 lumen',
    '@type': ['Light', 'OnOffSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'BrightnessProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 254) * 100,
        toMqtt: v => (v / 100) * 254,
      },
      color_temp: {
        '@type': 'ColorTemperatureProperty',
        type: 'integer',
        minimum: 0,
        maximum: 500,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
        value: 255
      },
    },
  },
  'T1820': {
    name: 'IKEA LEPTITER Recessed spot light',
    '@type': ['Light', 'OnOffSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'BrightnessProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 254) * 100,
        toMqtt: v => (v / 100) * 254,
      },
      color_temp: {
        '@type': 'ColorTemperatureProperty',
        type: 'integer',
        minimum: 0,
        maximum: 500,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
        value: 255
      },
    },
  }
}