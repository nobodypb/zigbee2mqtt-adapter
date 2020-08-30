module.exports = {
  "JTYJ-GD-01LM/BW": {
    name: 'MiJia Honeywell smoke detector',
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
      "smoke_density": {
        type: 'integer',
        readOnly: true,
      },
      "smoke": {
        type: 'boolean',
        '@type': 'BooleanProperty',
        readOnly: true,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
  }
}