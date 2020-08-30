module.exports = {
  'lumi.sensor_cube': {
    name: 'Xiaomi Magic Cube',
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
    },
    events: {
      wakeup: {
        '@type': 'AlarmEvent',
      },
      tap: {
        '@type': 'PressedEvent',
        type: 'integer',
        mqttField: 'side',
      },
      rotate_left: {
        type: 'number',
        mqttField: 'angle',
      },
      rotate_right: {
        type: 'number',
        mqttField: 'angle',
      },
      slide: {
        type: 'integer',
        mqttField: 'side',
      },
      flip90: {
        type: 'string',
        mqttExpr: v => [v.from_side, v.to_side].join('->'),
      },
      flip180: {
        type: 'integer',
        mqttField: 'side',
      },
      shake: {},
      fall: {},
    },
  }
}