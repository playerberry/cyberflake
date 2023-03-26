'use strict';

/* eslint-disable jsdoc/require-returns, jsdoc/require-returns-check, max-len, no-inline-comments */

const process = require('node:process');

/**
 * Cyberflake generator class.
 *
 * @class
 */
module.exports = class Cyberflake {
  #epoch;
  #maxSequenceId;
  #maxWorkerId;
  #maxDatacenterId;
  #lastTimestamp;
  #sequenceId;
  #workerId;
  #datacenterId;

  /**
   * Create a new instance of Cyberflake generator.
   *
   * @param {object} options - The options object
   * @param {bigint} [options.epoch=1672531200000n] - The epoch time in milliseconds since Unix epoch. (default: 2023-01-01T00:00:00Z)
   * @param {bigint} [options.maxSequenceId=4095n] - The maximum sequence ID. (default: 4095)
   * @param {bigint} [options.maxWorkerId=31n] - The maximum worker ID. (default: 31)
   * @param {bigint} [options.maxDatacenterId=31n] - The maximum datacenter ID. (default: 31)
   * @param {bigint} [options.workerId=0n] - The worker ID. (default: 0)
   * @param {bigint} [options.datacenterId=0n] - The datacenter ID. (default: 0)
   */
  constructor({
    epoch = 1672531200000n, // 2023-01-01T00:00:00Z
    maxSequenceId = 4095n,
    maxWorkerId = 31n,
    maxDatacenterId = 31n,
    workerId = 0n,
    datacenterId = 0n,
  } = {}) {
    /**
     * The epoch to use for generating Cyberflake IDs.
     *
     * @type {bigint}
     * @private
     */
    this.#epoch = epoch;

    /**
     * The maximum value for the sequence ID.
     *
     * @type {bigint}
     * @private
     */
    this.#maxSequenceId = maxSequenceId;

    /**
     * The maximum value for the worker ID.
     *
     * @type {bigint}
     * @private
     */
    this.#maxWorkerId = maxWorkerId;

    /**
     * The maximum value for the datacenter ID.
     *
     * @type {bigint}
     * @private
     */
    this.#maxDatacenterId = maxDatacenterId;

    /**
     * The last timestamp used for generating a Cyberflake ID.
     *
     * @type {bigint}
     * @private
     */
    this.#lastTimestamp = -1n;

    /**
     * The current sequence ID.
     *
     * @type {bigint}
     * @private
     */
    this.#sequenceId = 0n;

    /**
     * The worker ID to use for generating Cyberflake IDs.
     *
     * @type {bigint}
     * @private
     */
    this.#workerId = workerId;

    /**
     * The datacenter ID to use for generating Cyberflake IDs.
     *
     * @type {bigint}
     * @private
     */
    this.#datacenterId = datacenterId;
  }

  /**
   * Generate a new Cyberflake ID.
   *
   * @returns {string} The generated Cyberflake ID.
   */
  generate() {
    let timestamp = BigInt(process.hrtime.bigint()) - this.#epoch;

    if (timestamp === this.#lastTimestamp) {
      this.#sequenceId = (this.#sequenceId + 1n) & this.#maxSequenceId;

      if (this.#sequenceId === 0n) {
        timestamp = this.#waitNextMillis();
      }
    } else {
      this.#sequenceId = 0n;
    }

    this.#lastTimestamp = timestamp;

    const CyberflakeId = (timestamp << 22n) | (this.#datacenterId << 17n) | (this.#workerId << 12n) | this.#sequenceId;

    return CyberflakeId.toString();
  }

  /**
   * Decode a Cyberflake ID and return its components.
   *
   * @param {string} CyberflakeId - The Cyberflake ID to decode.
   * @returns {object} The decoded Cyberflake ID components.
   * @returns {number} return.timestamp - The timestamp in milliseconds.
   * @returns {number} return.datacenterId - The datacenter ID.
   * @returns {number} return.workerId - The worker ID.
   * @returns {number} return.sequenceId - The sequence ID.
   */
  decode(CyberflakeId) {
    const id = BigInt(CyberflakeId);
    const sequenceId = Number(id & this.#maxSequenceId);
    const workerId = Number((id >> 12n) & this.#maxWorkerId);
    const datacenterId = Number((id >> 17n) & this.#maxDatacenterId);
    const timestamp = Number((id >> 22n) + this.#epoch);

    return {
      timestamp,
      datacenterId,
      workerId,
      sequenceId,
    };
  }

  /**
   * A function that waits for the next millisecond to generate a new Cyberflake ID,
   * if the current timestamp is the same as the previous one.
   *
   * @private
   * @returns {bigint} The new timestamp value.
   */
  #waitNextMillis() {
    let timestamp = BigInt(process.hrtime.bigint()) - this.#epoch;

    while (timestamp <= this.#lastTimestamp) {
      timestamp = BigInt(process.hrtime.bigint()) - this.#epoch;
    }

    return timestamp;
  }
};
