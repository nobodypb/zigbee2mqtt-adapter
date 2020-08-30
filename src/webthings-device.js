'use strict';
const { Device } = require('gateway-addon');
const MqttProperty = require('./webthings-property');

class MqttDevice extends Device {
  constructor(adapter, id, description, is_group = false) {
    super(adapter, id);

    this.name = description.name;

    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = description['@type'];

    for (const [name, desc] of Object.entries(description.properties || {})) {
      const property = new MqttProperty(this, name, desc);
      this.properties.set(name, property);
    }

    for (const [name, desc] of Object.entries(description.events || {})) {
      this.addEvent(name, desc);
    }
  }

}

module.exports = MqttDevice;