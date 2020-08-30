module.exports = {
  "324131092621": {
    name: 'Philips Hue dimmer switch',
    '@type': ['BinarySensor'],
    properties: {
      battery: {
        type: 'integer',
        unit: 'percent',
        minimum: 0,
        maximum: 100,
        readOnly: true,
      },
      voltage: {
        type: 'integer',
        '@type': 'VoltageProperty',
        unit: 'volt',
        readOnly: true,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
  }
}