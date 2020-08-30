'use strict';

const mqtt = require('mqtt');
const { Adapter, Event } = require('gateway-addon');
const { MqttDevice, MqttDeviceGroup } = require('./webthings-device');

const DEVICE_DESCRIPTIONS = require('./devices');

class MqttAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, 'ZigbeeMqttAdapter', manifest.name);
    this.config = manifest.moziot.config;
    addonManager.addAdapter(this);

    this.availabilityCache = new Map();

    this.client = mqtt.connect(this.config.mqtt);
    this.client.on('error', error => console.error('mqtt error', error));
    this.client.on('message', this.handleIncomingMessage.bind(this));
    this.subscribe(`+/availability`);
    this.subscribe(`bridge/config/devices`);
    this.subscribe(`bridge/state`);

    // Get information about all devices
    this.publishMessage('bridge/config/devices/get');
  }

  handleDeviceSaved(deviceId, device) {
    // TODO: Do we need to remove devices, if nonexistent?
    //console.log('Device saved:', deviceId, device); 
  }

  /**
   * 
   * @param {String} topic 
   * @param {String | null} data 
   */
  handleIncomingMessage(topic, data) {
    if (!topic.startsWith(this.config.prefix)) {
      // This shouln't happen
      console.warn('Topic with wrong prefix recieved. Did you sub new things?', topic);
      return;
    }

    topic = topic.slice(this.config.prefix.length + 1);
    const topic_parts = topic.split('/');

    // Add function to conveniently get parts from end of array
    topic_parts.get = i => i < 0 ? topic_parts[Math.max(0, topic_parts.length + i)] : topic_parts[i];

    if (topic_parts.get(-1) === 'get' || topic_parts.get(-1) === 'set') {
      return; // Don't react on requests
    }

    if (topic_parts.get(-1) === 'availability') {
      let friendlyName = topic_parts.get(0),
        online = data.toString() === 'online';

      this.availabilityCache.set(friendlyName, online);

      const device = this.getDeviceByFriendlyName(friendlyName);

      if (device && device.setAvailability(online) && online) {
        // If a device just went online, request state and group membership
        device.queryGroupMembership();
      }
      return;
    }

    if (topic === 'bridge/state') {
      console.info(`zigbee2mqtt is ${data.toString()}`);
      return;
    }

    let msg = {};

    try {
      msg = JSON.parse(data.toString());
    }
    catch {
      console.warn('JSON Error', topic, data.toString());
      return;
    }

    if (topic_parts.get(0) === 'bridge') {
      // Here we add a new thing.
      if (topic === 'bridge/config/devices') {
        for (const device of msg) {
          this.addDevice(device);
        }

        // Remove devices that are not in msg
        for (const device of Object.values(this.getDevices())) {
          if (device.isGroup())
            continue;

          if (msg.some(d => d.friendly_name == device.friendlyName))
            continue;

          // Device should be removed
          this.removeDevice(device);
        }
        return;
      }
    }
    else {
      let friendlyName = topic_parts.get(0);

      // If we found the device ID in the incoming message, then we can look-up the existing thing.
      /** @type {MqttDevice} */
      const device = this.getDeviceByFriendlyName(friendlyName);
      if (!device) {
        console.info(`Device for update message not found: ${friendlyName}`);
        return;
      }

      this.updateDevice(device, msg);

      return;
    }

    console.info('Unhandled mqtt message', topic, data.toString());
  }

  /**
   * @returns {Object.<string, MqttDevice | MqttDeviceGroup>}
   */
  getDevices() {
    return super.getDevices() || {};
  }

  /**
   * @returns {MqttDevice | MqttDeviceGroup | null}
   */
  getDeviceByFriendlyName(friendlyName) {
    if (!friendlyName)
      return null;

    for (const d of Object.values(this.getDevices())) {
      if (d.friendlyName !== friendlyName)
        continue;

      return d;
    }

    return null;
  }

  /**
   * @returns {MqttDevice | MqttDeviceGroup | null}
   */
  getDevice(msg) {
    let device = null;
    let friendlyName = null;

    if (typeof msg === 'string') {
      if (msg in this.getDevices()) {
        device = super.getDevice(msg);
      }
      else {
        friendlyName = msg;
      }
    }
    else {
      if (msg.device.id && msg.device.id in this.getDevices()) {
        device = super.getDevice(msg.device.id);
      }
      else {
        friendlyName = msg.device.friendlyName || msg.device.friendly_name;
      }
    }

    // Try to find device by friendlyName
    if (friendlyName)
      device = this.getDeviceByFriendlyName(friendlyName);

    if (!device) {
      console.warn(`Couldn't find device ${msg}. Not yet added?`);
      //this.addDevice(msg.device); // It's senseless to add an unspecific device
    }
    return device;
  }

  subscribe(topic) {
    this.client.subscribe(this.config.prefix + '/' + topic);
  }

  publishMessage(topic, msg) {
    this.client.publish(this.config.prefix + '/' + topic, JSON.stringify(msg));
  }

  /**
   * 
   * @param {MqttDevice | MqttDeviceGroup} device 
   * @param {Object} msg 
   */
  updateDevice(device, msg) {
    // Update group membership
    if ('group_list' in msg) {
      device.setGroups(msg.group_list, msg.group_capacity);

      for (const groupname of msg.group_list) {

        /** @type {MqttDevice} */
        let group = this.getDeviceByFriendlyName(groupname);

        if (group === null) {
          group = this._addDevice(groupname, {
            name: groupname,
            '@type': device['@type'],
            properties: device.getPropertyDescriptions()
          }, null, true);

          console.info(`New group '${groupname}' added`);
        }

        if (group.addChild(device)) {
          console.info(`Device '${device.friendlyName}' added to group '${groupname}'`);
        }
      }
    }

    if (!device.groupsSet()) {
      // We just got an update, but groups for this device were never set, so query that
      device.queryGroupMembership();
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
    if (msg.action && !device.isGroup() && device.info.model) {
      const description = DEVICE_DESCRIPTIONS[device.info.model];
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

  _addDevice(friendlyName, description, info, is_group = false) {
    let device = null;

    if (is_group) {
      device = new MqttDeviceGroup(this, friendlyName, description);
    }
    else {
      device = new MqttDevice(this, friendlyName, description, info);
    }

    this.subscribe(friendlyName + '/#');
    this.handleDeviceAdded(device);
    return device;
  }

  addDevice(info) {
    if (!info) {
      console.warn("addDevice was called without device info");
      return;
    }

    if (info.type === 'Coordinator') { // Ignore our network coordinator
      console.log(`Zigbee Coordinator is ${info.softwareBuildID}`);
      return;
    }

    const modelId = info.modelId || info.model;
    const description = DEVICE_DESCRIPTIONS[modelId];

    if (!description) {
      console.log(info);
      console.warn(`Failed to add new device. There is no description for ${modelId} model: ${info.vendor} "${info.description}"`);
      return;
    }

    const friendlyName = info.friendlyName || info.friendly_name;
    if (this.getDeviceByFriendlyName(friendlyName) !== null) {
      //console.debug(`Device already exists. Skip adding. model: ${modelId}, friendlyName: ${friendlyName}.`); // Don't be that verbose
      return;
    }

    const device = this._addDevice(friendlyName, description, info);
    let connected = this.availabilityCache.get(friendlyName) || false;
    device.setAvailability(connected);

    console.info(`Device added. Model: ${modelId}, name: ${friendlyName}, available: ${connected}`);

    // Get current group membership and device state at startup
    device.queryGroupMembership(); // Will only query online devices
  }

  removeDevice(device) {
    this.handleDeviceRemoved(device);

    console.info(`Removed ${device.friendlyName} from devices`);
  }

  startPairing(_timeoutSeconds) {
    // TODO: Listen for joining devices
    this.publishMessage('zigbee2mqtt/bridge/config/permit_join', true);
    this.publishMessage('bridge/config/devices/get');

    console.log("Pairing... ", _timeoutSeconds);

  }

  cancelPairing() {
    this.publishMessage('zigbee2mqtt/bridge/config/permit_join', false);
    console.log("Cancel pairing");
  }
}

module.exports = MqttAdapter;