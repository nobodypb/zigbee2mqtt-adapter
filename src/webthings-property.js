'use strict';
const { Property } = require('gateway-addon');

const identity = v => v;

class MqttProperty extends Property {
  constructor(device, name, propertyDescription) {
    super(device, name, propertyDescription);

    this.options = propertyDescription;

    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);
  }

  async setValue(value) {
    const { toMqtt = identity } = this.options;
    this.device.adapter.publishMessage(`${this.device.id}/set`, {
      [this.name]: toMqtt(value),
    });

    await super.setValue(value);
    this.device.notifyPropertyChanged(this); // TODO: Should we wait for a MQTT Message indicating the change?
    return value;
  }

  setCachedValueFromMQTT(value) {
    if (this.options) {
      const { fromMqtt = identity } = this.options;
      value = fromMqtt(value)
    }

    return super.setCachedValue(value);
  }
}

module.exports = MqttProperty;