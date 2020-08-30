module.exports = {
  'lumi.sensor_magnet': {
    name: 'Xiaomi Magnet Contact Sensor',
    '@type': ['DoorSensor'],
    properties: {
      battery: {
        type: 'integer',
        unit: 'percent',
        minimum: 0,
        maximum: 100,
        readOnly: true,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
      contact: {
        type: 'boolean',
        '@type': 'OpenProperty',
        fromMqtt: v => !v,
        toMqtt: v => !v,
        readOnly: true,
      },
    },
  },
  'lumi.sensor_magnet.aq2': {
    name: 'Xiaomi Magnet Contact Sensor',
    '@type': ['DoorSensor'],
    properties: {
      battery: {
        type: 'integer',
        unit: 'percent',
        minimum: 0,
        maximum: 100,
        readOnly: true,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
      contact: {
        type: 'boolean',
        '@type': 'OpenProperty',
        fromMqtt: v => !v,
        toMqtt: v => !v,
        readOnly: true,
      },
    },
  }
}