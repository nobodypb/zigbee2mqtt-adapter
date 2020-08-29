module.exports = {
    '8718696548738': {
        name: 'Philips Hue white ambiance E26/E27',
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
    '8718696695203': {
        name: 'Philips Hue white ambiance E14',
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
    '929002241201': {
        name: 'Philips Hue white filament Edison E27 LED',
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
}