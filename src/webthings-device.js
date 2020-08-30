'use strict';
const { Device } = require('gateway-addon');
const MqttProperty = require('./webthings-property');
const MqttAdapter = require('./webthings-adapter');

function setProperties(target, description) {
  for (const [name, desc] of Object.entries(description.properties || {})) {
    const property = new MqttProperty(target, name, desc);
    target.properties.set(name, property);
  }
}

function setEvents(target, description) {
  for (const [name, desc] of Object.entries(description.events || {})) {
    target.addEvent(name, desc);
  }
}

class MqttDevice extends Device {
  /**
   * 
   * @param {MqttAdapter} adapter 
   * @param {string} friendlyName 
   * @param {Object} description 
   * @param {Object} info 
   */
  constructor(adapter, friendlyName, description, info) {
    super(adapter, 'zigbee2mqtt-' + (info.ieeeAddr || friendlyName));

    /**
     * @type {MqttAdapter}
     * @protected
     */
    this.adapter;

    this.name = description.name;
    this.friendlyName = friendlyName;
    this.model = info.model;
    this.connected = false;

    this.info = info;

    this.groups_set = false;
    this.group_list = [];
    this.group_capacity = 0;

    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = description['@type'];

    setProperties(this, description);
    setEvents(this, description);
  }

  queryGroupMembership() {
    if(!this.isRouter())
      return; // Only query routers, which are mains powered, since other won't answer nevertheless

    if(!this.connected)
      return; // Don't query offline devices

    this.adapter.publishMessage(`bridge/device/${this.friendlyName}/get_group_membership`);
  }

  /**
   * 
   * @param {boolean} connected 
   */
  setAvailability(connected) {
    if(this.connected === connected)
      return false;

    this.connected = connected;
    return true;
  }

  /**
   * @returns {boolean}
   */
  getAvailability() {
    return this.connected;
  }

  isRouter() {
    return this.info && this.info.type === "Router";
  }

  isGroup() {
    return false;
  }

  groupsSet() {
    return this.groups_set;
  }

  /**
   * 
   * @param {string} group Friendly groupname
   */
  addGroup(group) {
    if(this.groups_set)
      this.group_capacity--;
    else
      this.groups_set = true;

    this.group_list.push(group);
  }

  /**
   * 
   * @param {string[]} list 
   * @param {number} capacity 
   */
  setGroups(list, capacity = 0) {
    if(this.groups_set) {
      // Handle possibly removed groups
      let removed = this.group_list.filter(g => !list.includes(g));

      for (const rg of removed) {
        const group = this.adapter.getDeviceByFriendlyName(rg);
        if(group)
          group.removeChild(this);
      }
    }

    this.groups_set = true;
    this.group_list = list;
    this.group_capacity = capacity;
  }
}

class MqttDeviceGroup extends Device {
  constructor(adapter, friendlyName, description) {
    super(adapter, 'zigbee2mqtt-group-' + friendlyName);

    /**
     * @type {MqttAdapter}
     * @protected
     */
    this.adapter;

    this.name = 'Group ' + friendlyName;
    this.friendlyName = friendlyName;

    this.children = new Map();

    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = description['@type'];

    setProperties(this, description);
    setEvents(this, description);
  }

  isGroup() {
    return true;
  }

  groupsSet() {
    return true;
  }

  /**
   * @returns {boolean}
   */
  getAvailability() {
    return true; // TODO: Check all children
  }

  /**
   * 
   * @param {MqttDevice} device 
   */
  addChild(device) {
    if (this.children.has(device.friendlyName))
      return false;

    this.children.set(device.friendlyName, device);

    // Simply remove all properties that are not present in the newly added device
    for (const prop in this.properties) {
      if (this.hasProperty(prop) && !device.hasProperty(prop)) {
        this.properties.delete(prop);
      }
    }

    return true;
  }

  /**
   * 
   * @param {MqttDevice} device 
   */
  removeChild(device) {
    if (!this.children.has(device.friendlyName))
      return false;

    this.children.delete(device.friendlyName);

    // TODO: Update possible properties?

    // If no child is left, group should also be removed
    if(!this.children.size)
      return this.adapter.removeGroup(this);

    return true;
  }
}

module.exports = { MqttDevice, MqttDeviceGroup };