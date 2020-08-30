/**
 * zigbee2mqtt-adapter.js - Adapter to use all those zigbee devices via
 * zigbee2mqtt.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

const mqtt = require('mqtt');
const { Adapter, Event } = require('gateway-addon');
const MqttDevice = require('./webthings-device');

const Devices = require('./devices');

class ZigbeeMqttAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, 'ZigbeeMqttAdapter', manifest.name);
    this.config = manifest.moziot.config;
    addonManager.addAdapter(this);

    this.client = mqtt.connect(this.config.mqtt);
    this.client.on('error', error => console.error('mqtt error', error));
    this.client.on('message', this.handleIncomingMessage.bind(this));
    this.client.subscribe(`${this.config.prefix}/+/availability`); // TODO: Actually use this
    this.client.subscribe(`${this.config.prefix}/bridge/config/devices`);

    // Get information about all devices
    this.client.publish(`${this.config.prefix}/bridge/config/devices/get`);
  }

  /**
   * 
   * @param {String} topic 
   * @param {String | null} data 
   */
  handleIncomingMessage(topic, data) {
    if (topic.endsWith('availability') || topic.endsWith('get')) {
      // TODO: Display availability?
      return;
    }

    let msg = {};

    try {
      msg = JSON.parse(data.toString());
    }
    catch {
      // TODO: Gracefully handle JSON errors
      return;
    }

    // Here we add a new thing.
    if (topic.startsWith(`${this.config.prefix}/bridge/config/devices`)) {
      for (const device of msg) {
        this.addDevice(device);
      }
    }

    // Here we deal with incoming messages from things, such as state changes or new values from sensors.
    if (!topic.startsWith(`${this.config.prefix}/bridge`)) {
      var possibleModelId = "";
      var possibleFriendlyName = "";

      if ('device' in msg) {                 // In some cases it's a complex message with a device dictionary in it.
        possibleFriendlyName = msg.device.friendlyName;
        possibleModelId = msg.device.modelId;
      }
      else {                                 // In other cases it's a simple message, just a list of new values.
        var parts = topic.split("/");
        possibleFriendlyName = parts.pop();
      }

      // If we found the device ID in the incoming message, then we can look-up the existing thing.
      const device = this.devices[possibleFriendlyName];
      if (!device) {
        return;
      }

      // We loop over all the attributes of the incoming message, and try to match it to the properties in the existing thing.
      for (const key of Object.keys(msg)) {
        const property = device.findProperty(key);
        if (!property) {
          continue;
        }

        property.setCachedValueFromMQTT(msg[key]);
        device.notifyPropertyChanged(property); // Notify the Gateway that this property's value has updated.
      }

      // If it's a complex message, then it may hold an event update
      if (msg.action && possibleModelId) {
        const description = Devices[possibleModelId];
        if (description.events[msg.action]) {
          const event = new Event(
            device,
            msg.action,
            msg[description.events[msg.action]],
          );
          device.eventNotify(event);
        }
      }
    }
  }

  getDevice(msg) {
    let friendlyName = null;

    if (typeof msg === 'string') {
      friendlyName = msg;
    }
    else {
      friendlyName = msg.device.friendlyName || msg.device.friendly_name;
    }

    const device = this.devices[friendlyName];
    if (!device) {
      this.addDevice(msg.device);
    }
    return this.devices[friendlyName];
  }

  publishMessage(topic, msg) {
    this.client.publish(`${this.config.prefix}/${topic}`, JSON.stringify(msg));
  }

  _addDevice(friendlyName, description, is_group = false) {
    const device = new MqttDevice(this, friendlyName, description, is_group);
    this.client.subscribe(`${this.config.prefix}/${friendlyName}/#`);
    this.handleDeviceAdded(device);
    return device;
  }

  addDevice(info) {
    if (info.type === 'Coordinator') { // Ignore our network coordinator
      console.log(`Zigbee Coordinator is ${info.softwareBuildID}`);
      return;
    }

    const modelId = info.modelId || info.model;
    const description = Devices[modelId];
    if (!description) {
      console.log(info);
      console.warn(`Failed to add new device. There is no description for ${modelId} model: ${info.vendor} "${info.description}"`);
      return;
    }
    const friendlyName = info.friendlyName || info.friendly_name;
    if (friendlyName in this.devices) {
      console.info(`Device already exists. Skip adding. model: ${modelId}, friendlyName: ${friendlyName}.`);
      return;
    }
    this._addDevice(friendlyName, description);
    console.info(`New device added. Model: ${modelId}, friendlyName: ${friendlyName}`);

    // Get current group membership and device state at startup
    // TODO: Only do this for online devices
  }

  startPairing(_timeoutSeconds) {
    this.client.publish(`${this.config.prefix}/bridge/config/devices/get`);
    // TODO: Set permitJoin
  }

  cancelPairing() {
    // TODO: Clear permitJoin
  }
}

function loadAdapter(addonManager, manifest, _errorCallback) {
  new ZigbeeMqttAdapter(addonManager, manifest);
}

module.exports = loadAdapter;

