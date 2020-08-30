module.exports = {
  'lumi.sens': {
    name: 'Xiaomi Temperature & Humidity Sensor',
    '@type': ['TemperatureSensor'],
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
      temperature: {
        type: 'number',
        '@type': 'TemperatureProperty',
        unit: 'degree celsius',
        readOnly: true,
      },
      humidity: {
        type: 'number',
        unit: 'percent',
        readOnly: true,
      },
    },
  },
  'lumi.weather': {
    name: 'Xiaomi Aquara Temperature & Humidity & Pressure Sensor',
    '@type': ['TemperatureSensor'],
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
      temperature: {
        type: 'number',
        '@type': 'TemperatureProperty',
        unit: 'degree celsius',
        multipleOf: 0.1,
        readOnly: true,
      },
      humidity: {
        type: 'number',
        unit: 'percent',
        multipleOf: 0.5,
        readOnly: true,
      },
      pressure: {
        type: 'number',
        unit: 'hPa',
        multipleOf: 0.5,
        readOnly: true,
      },
    },
  },
  'WSDCGQ01LM': {
    name: 'Xiaomi MiJia Temperature & Humidity Sensor',
    '@type': ['TemperatureSensor'],
    properties: {
      battery: {
        type: 'integer',
        unit: 'percent',
        minimum: 0,
        maximum: 100,
        readOnly: true,
      },
      voltage: {
        '@type': 'VoltageProperty',
        type: 'number',
        minimum: 0,
        maximum: 3.3,
        multipleOf: 0.001,
        readOnly: true,
        fromMqtt: v => v / 1000
      },
      linkquality: {
        title: 'Link Quality',
        type: 'integer',
        readOnly: true,
        value: 255
      },
      temperature: {
        type: 'number',
        '@type': 'TemperatureProperty',
        unit: 'degree celsius',
        multipleOf: 0.01,
        readOnly: true,
      },
      humidity: {
        type: 'number',
        unit: 'percent',
        multipleOf: 0.01,
        readOnly: true,
      },
    },
  }
}