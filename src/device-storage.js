'use strict';
const sqlite = require('sqlite3').verbose();
const { MqttDevice, MqttDeviceGroup } = require('./webthings-device');
const MqttAdapter = require('./webthings-adapter');
const DEVICE_DESCRIPTIONS = require('./devices');

const QUERIES = {
  create: {
    groups: `CREATE TABLE IF NOT EXISTS groups (
      id text PRIMARY KEY,
      name text NOT NULL,
      basemodel text
      );`,
    devices: `CREATE TABLE IF NOT EXISTS devices (
      id text PRIMARY KEY,
      name text NOT NULL,
      info text NOT NULL
      );`,
    device_groups: `CREATE TABLE IF NOT EXISTS device_groups (
      device_id text,
      group_id text,
      FOREIGN KEY (device_id) REFERENCES devices (id),
      FOREIGN KEY (group_id) REFERENCES groups (id)
      );`
  },
  save: {
    device: `INSERT OR REPLACE INTO devices (id, name, info)
      VALUES ($id, $name, $info)`,
    group: `INSERT OR REPLACE INTO groups (id, name, basemodel)
      VALUES ($id, $name, $model)`,
    group_devices: `INSERT INTO device_groups (device_id, group_id) 
      VALUES ($device_id, $group_id)`
  },
  get: {
    devices: `SELECT * FROM devices`,
    groups: `SELECT * FROM groups`,
    group_devices: `SELECT device_id FROM device_groups WHERE group_id = $id`
  },
  remove: {
    device: `DELETE FROM devices WHERE id = $id`,
    group: `DELETE FROM groups WHERE id = $id`,
    device_groups: `DELETE FROM device_groups WHERE device_id = $id`,
    group_devices: `DELETE FROM device_groups WHERE group_id = $id`
  }
}

class DeviceStorage {
  /**
   * 
   * @param {string} db Database filepath or ':memory:'
   * @param {MqttAdapter} adapter 
   */
  constructor(db, adapter) {
    this.db = new sqlite.Database(db);
    this.adapter = adapter;
  }

  /**
   * 
   * @param {string} sql 
   * @param {Object} params 
   * @returns {Promise}
   */
  run(sql, params) {
    return new Promise((resolve, reject) => {
      if(params) {
        this.db.run(sql, params, (err) => {
          if(err) return reject(err);
          resolve();
        })
      }
      else {
        this.db.run(sql, (err) => {
          if(err) return reject(err);
          resolve();
        })
      }
    });
  }

  /**
   * 
   * @param {string} sql 
   * @param {Object} params 
   * @returns {Promise}
   */
  all(sql, params) {
    return new Promise((resolve, reject) => {
      if(params) {
        this.db.all(sql, params, (err, rows) => {
          if(err) return reject(err);
          resolve(rows);
        })
      }
      else {
        this.db.all(sql, (err, rows) => {
          if(err) return reject(err);
          resolve(rows);
        })
      }
    });
  }

  initTables() {
    return Promise.all([
      this.run(QUERIES.create.groups),
      this.run(QUERIES.create.devices),
      this.run(QUERIES.create.device_groups)
    ]);
  }

  /**
   * 
   * @param {MqttDevice} device 
   */
  async saveDevice(device) {
    await this.run(QUERIES.save.device, {
      $id: device.id,
      $name: device.friendlyName,
      $info: JSON.stringify(device.info)
    });
  }

  /**
   * @returns {MqttDevice[]}
   */
  async getDevices() {
    let rows = await this.all(QUERIES.get.devices);

    let devices = [];

    for (const dobj of rows) {
      const info = JSON.parse(dobj.info);
      const desc = DEVICE_DESCRIPTIONS[info.model];
      const device = new MqttDevice(this.adapter, dobj.name, desc, info);
      devices.push(device);
    }

    return devices;
  }

  /**
   * 
   * @param {MqttDeviceGroup} group 
   */
  async saveGroup(group) {
    await this.run(QUERIES.remove.group_devices, { $id: group.id });

    let model = null;
    const firstChild = group.children.values().next().value;

    if (firstChild && firstChild.info) {
      model = firstChild.info.model;
    }

    await this.run(QUERIES.save.group, {
      $id: group.id,
      $name: group.friendlyName,
      $model: model
    });

    let stmt = this.db.prepare(QUERIES.save.group_devices);
    
    for (const device of group.children.values()) {
      stmt.run({ 
        $device_id: device.id,
        $group_id: group.id
      })
    }

    stmt.finalize();
  }

  /**
   * @returns {MqttDeviceGroup[]}
   */
  async getGroups() {
    let rows = await this.all(QUERIES.get.groups);

    let groups = [];

    for (const gobj of rows) {
      const desc = DEVICE_DESCRIPTIONS[gobj.basemodel];
      groups.push(new MqttDeviceGroup(this.adapter, gobj.name, desc));
    }

    return groups;
  }

  /**
   * 
   * @param {MqttDeviceGroup} group 
   * @returns {string[]}
   */
  async getDeviceIdsInGroup(group) {
    /** @type {Array} */
    let rows = await this.all(QUERIES.get.group_devices, { $id: group.id });

    return rows.map(o => o.device_id);
  }

  /**
   * 
   * @param {MqttDevice} device 
   */
  async removeDevice(device) {
    await this.run(QUERIES.remove.device_groups, {
      $id: device.id
    });

    return this.run(QUERIES.remove.device, {
      $id: device.id
    });
  }

  /**
   * 
   * @param {MqttDevice} group 
   */
  async removeGroup(group) {
    await this.db.run(QUERIES.remove.group_devices, {
      $id: group.id
    });

    return this.db.run(QUERIES.remove.group, {
      $id: group.id
    });
  }
}

module.exports = DeviceStorage;