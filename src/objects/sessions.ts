import deepExtend = require('deep-extend');
import { ObjectID } from 'mongodb';

export type SessionTypes =
  | 'Device';

/**
 * Anything that requires a session should extend off this.
 * 
 * Sessions will be anything that are generated by a user and are bot managed
 * tasks for a defined timelimt
 * 
 * @export
 * @class Session
 */
export class Session {
  /**
   * Will be used as the session id
   * @type {ObjectID}
   * @memberof DeviceSession
   */
  public _id: ObjectID
  /**
   * User's ID reference to their 'users' collection record
   * @type {ObjectID}
   * @memberof DeviceSession
   */
  public uid: ObjectID
  /**
   * Server ID that the message originated from
   * @type {ObjectID}
   * @memberof Session
   */
  public sid: ObjectID
  public type: SessionTypes
  public isActive: boolean = false
  public activateTimestamp: number = 0
  public deactivateTimestamp: number = 0
}

/**
 * A device session is with a toy such as Lovense to accept reactions
 * to adjust time or intensity
 * @export
 * @class DeviceSession
 * @extends {Session}
 * @template T
 */
export class DeviceSession<T> extends Session {

  /**
   * Will be the reference to the specific device like from /integrations/lovense/device.ts
   * @type {T}
   * @memberof DeviceSession
   */
  public device: T
  public react: {
    /**
     * Time per react
     * @type {number}
     */
    time: number
  }
  public duration: {
    /**
     * Base duration (reacts can modify this)
     * @type {number}
     */
    min: number
    /**
     * Max duration (reacts cannot surpass if set, user limit overrides)
     * @type {number}
     */
    max: number
  }
  public intensity: {
    /**
     * Intensity minimum per react
     * @type {number}
     */
    min: number
    max: number
    modifier: number
  }
  public limit: {
    time: number
    intensity: number
  }

  constructor(init: Partial<DeviceSession<T>>) {
    super()
    deepExtend(
      this,
      {
        // KH
        react: { time: 1 },                             // Time to run each emote
        duration: { min: 0, max: 0 },                   // Base duration (not a max), max cannot be exceeded
        intensity: { min: 0, max: 100, modifier: 10 },  // Minimum & Maximum intensity, min used as starting
        // Lockee
        limit: { time: 0, intensity: 100 }              // User hard limits
      },
      init)
  }
}