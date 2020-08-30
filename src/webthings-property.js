'use strict';
const { Property } = require('gateway-addon');

const identity = v => v;

const DESCR_FIELDS = [
  'fromMqtt',
  'toMqtt'
];

function copyDescrFieldsInto(target, source) {
  for (const field of DESCR_FIELDS) {
    if (source.options && source.options.hasOwnProperty(field)) {
      target[field] = source.options[field];
    }
    if (source.hasOwnProperty(field)) {
      target[field] = source[field];
    }
  }
}

class MqttProperty extends Property {
  constructor(device, name, propertyDescription) {
    super(device, name, propertyDescription);

    this.options = propertyDescription;

    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);
  }

  async setValue(value) {
    const { toMqtt = identity } = this.options;
    this.device.adapter.publishMessage(`${this.device.friendlyName}/set`, {
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

  asPropertyDescription() {
    const description = super.asPropertyDescription();
    copyDescrFieldsInto(description, this);
    return description;
  }
}

module.exports = MqttProperty;