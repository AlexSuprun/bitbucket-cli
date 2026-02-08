/**
 * Config type parsing tests
 */

import { describe, it, expect } from 'bun:test';
import {
  coerceSkipVersionCheckValue,
  coerceVersionCheckIntervalValue,
  normalizeReadableConfigValue,
  parseSettableConfigValue,
} from '../../src/types/config.js';

describe('parseSettableConfigValue', () => {
  it('should keep defaultWorkspace as string', () => {
    const value = parseSettableConfigValue('defaultWorkspace', 'my-workspace');

    expect(value).toBe('my-workspace');
  });

  it('should parse skipVersionCheck values as booleans', () => {
    expect(parseSettableConfigValue('skipVersionCheck', 'true')).toBe(true);
    expect(parseSettableConfigValue('skipVersionCheck', 'FALSE')).toBe(false);
  });

  it('should reject invalid skipVersionCheck values', () => {
    expect(() => parseSettableConfigValue('skipVersionCheck', 'yes')).toThrow(
      "Invalid value for 'skipVersionCheck'"
    );
  });

  it('should parse versionCheckInterval values as positive integers', () => {
    expect(parseSettableConfigValue('versionCheckInterval', '7')).toBe(7);
  });

  it('should reject invalid versionCheckInterval values', () => {
    expect(() => parseSettableConfigValue('versionCheckInterval', '0')).toThrow(
      "Invalid value for 'versionCheckInterval'"
    );
    expect(() =>
      parseSettableConfigValue('versionCheckInterval', '1.5')
    ).toThrow("Invalid value for 'versionCheckInterval'");
  });
});

describe('coerce typed config values', () => {
  it('should coerce skipVersionCheck from boolean or string', () => {
    expect(coerceSkipVersionCheckValue(true)).toBe(true);
    expect(coerceSkipVersionCheckValue('false')).toBe(false);
    expect(coerceSkipVersionCheckValue('invalid')).toBeUndefined();
  });

  it('should coerce versionCheckInterval from number or string', () => {
    expect(coerceVersionCheckIntervalValue(3)).toBe(3);
    expect(coerceVersionCheckIntervalValue('14')).toBe(14);
    expect(coerceVersionCheckIntervalValue(0)).toBeUndefined();
    expect(coerceVersionCheckIntervalValue('0')).toBeUndefined();
  });
});

describe('normalizeReadableConfigValue', () => {
  it('should normalize typed readable keys', () => {
    expect(normalizeReadableConfigValue('skipVersionCheck', 'true')).toBe(true);
    expect(normalizeReadableConfigValue('versionCheckInterval', '5')).toBe(5);
  });

  it('should return undefined for invalid values', () => {
    expect(
      normalizeReadableConfigValue('skipVersionCheck', 'oops')
    ).toBeUndefined();
    expect(
      normalizeReadableConfigValue('versionCheckInterval', 'nope')
    ).toBeUndefined();
    expect(
      normalizeReadableConfigValue('defaultWorkspace', 123)
    ).toBeUndefined();
  });
});
