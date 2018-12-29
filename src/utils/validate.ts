import * as XRegex from 'xregexp';
import * as Utils from '../utils';

export const validationRegex = XRegex('(\\/(?<name>[a-z0-9]*)(?<optional>\\?\\:|\\:|\\=|\\?=)(?<type>[a-z]*))', 'img')

export interface ValidationType {
  name: string
  required?: boolean
  type: string
  valid?: boolean
  value?: boolean | number | string
}

export interface ValidationRegexMatch {
  name: string
  optional?: string
  required: boolean
  type: string
}

export class Validate {
  public validation: Array<ValidationType>
  public validationString: string
  public signature: string

  constructor(validate: string) {
    this.validationString = validate
    // Convert string validate to object
    this.validation = this.validateFromStringParser(validate)
    // Generate regex signature
    this.signature = this.routeSignatureFromStr(validate)
  }

  public test(message: string) {
    const regex = XRegex(this.signature, 'ig')
    const match = XRegex.test(message, regex)
    return match;
  }

  /**
   * Process incoming validation string into Validation objects
   * @param {string} str
   * @returns
   * @memberof Validate
   */
  public validateFromStringParser(str: string) {
    var matches = []
    XRegex.forEach(str, validationRegex, (match: any, i: number) => {
      matches.push(this.createValidationType(match))
    });

    return matches
  }

  /**
   * Basic type validator - Validates:
   * - `user` (this can be both a snowflake or @user#0000)
   * - `string`
   * - `number`
   * - `boolean`
   * @param {string} expected
   * @param {(boolean | number | string)} value
   * @returns
   * @memberof Validate
   */
  public validateType(expected: string, value: boolean | number | string) {
    if (expected === 'user')
      // From a server channel it should look like: <@146439529824256000>
      // Check that first
      return /^\<\@([0-9]*)\>$/i.test(value.toString()) || /^(\@((?!@|#|:|`).*)\#[0-9]{4,5})$/i.test(value.toString())
    if (expected === 'string')
      return typeof value === 'string'
    if (expected === 'number') {
      return Number.isNaN(Number(value)) === false
    }
    if (expected === 'boolean')
      return value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'false'
    return false
  }

  /**
 * Validates the chat arguments against the TypeValidations provided to determine
 * if all arguments meet the defined type
 * @export
 * @param {Array<string>} args
 * @param {Array<TypeValidation>} validation
 * @returns
 */
  public validateArgs(args: Array<string>) {
    var allValid = true
    var ret: any = {}
    var validated = this.validation.map((v: any, i: number) => {
      // Check if type matches
      v.valid = this.validateType(v.type, args[i])
      v.value = (v.type === 'user') ? Utils.User.extractUserIdFromString(args[i]) : args[i]
      // Fix: If expected type is valid and is a number, convert it to a number
      v.value = (v.type === 'number' && v.valid) ? Number(v.value) : args[i]
      // Update allValid
      if (!v.valid && v.required) {
        // If the value fails a check (or is empty) but IS required
        allValid = false
      }
      // Add v to ret
      ret[v.name] = v.value
      return v
    })

    return { valid: allValid, validated: validated, o: ret }
  }

  public routeSignatureFromStr(str: string) {
    var sig = '^\\!'

    XRegex.forEach(str, validationRegex, (match: any, i: number) => {
      // Handling for 'text block' values
      if (match.optional === '*=') {
        sig += '\\`([a-z0-9\\s]*)\\`\\s?'
      }

      // Handling of static route values
      if (match.optional === ':' || match.optional === '?:') {
        sig += `(${match.name})\\s?`
      }

      // Handling for user input values
      if (match.optional === '=' || match.optional === '?=') {
        sig += `(\\@[\\w\\s-]*\\#[0-9]+|[\\w-]+|\\<\\@[0-9]*\\>)\\s?`
      }
    });

    // Add end of string $
    sig += '$'

    return sig
  }

  /**
   * Generate Validation object
   * @private
   * @param {ValidationRegexMatch} match
   * @returns
   * @memberof Validate
   */
  private createValidationType(match: ValidationRegexMatch) {
    return {
      name: match.name,
      required: match.optional === ':' || match.optional === '=' ? true : false,
      type: match.type,
      valid: undefined,
      value: undefined
    }
  }
}