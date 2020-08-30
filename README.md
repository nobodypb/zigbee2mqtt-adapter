Zigbee2Mqtt Adapter
-------------------

This adapter for [WebThings Gateway by Mozilla](https://iot.mozilla.org/gateway/) allows to use awesome [zigbee2mqtt](http://zigbee2mqtt.io/) project to support lots of zigbee devices on a cheap `cc2531` usb stick zigbee dongle.
Originally forked from [Kabbi](https://github.com/kabbi/zigbee2mqtt-adapter).

Currently supported devices:
- Aqara ZigBee Light Bulb
- Xiaomi Magnet Sensor (v1 and v2)
- Xiaomi Magic Cube
- MiJia Honeywell smoke detector
- Phillips Hue Bulbs
  - White ambiance E26/E27
  - White ambiance E14
  - White filament Edison E27 LED
- IKEA Bulbs
  - TRADFRI LED bulb E12/E14 400 lumen
  - LEPTITER Recessed spot light

You can add new ones to a `.js` file in `src/devices/`.

The syntax and possible options are found in the [Web Thing Description](https://iot.mozilla.org/wot/#web-thing-description).
Valid values for `@type` fields can be found in the [WoT Capability Schemas](https://iot.mozilla.org/schemas/).

Additionally you may provide functions to the fields `fromMqtt` and `toMqtt` in properties. Those will be called on property values to convert them from and to zigbee2mqtt values. 

The key of the provided device description must match the model id as provided by zigbee2mqtt. For e.g. `'T1280'` for an IKEA LEPTITER spot. 
You can find those ids on the [supported devices page of zigbee2mqtt](https://www.zigbee2mqtt.io/information/supported_devices.html).

Example:

```js
{
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
```
