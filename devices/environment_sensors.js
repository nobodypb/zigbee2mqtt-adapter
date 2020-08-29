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
    }
}