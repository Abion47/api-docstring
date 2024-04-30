import { describe, expect, test, beforeAll } from '@jest/globals';
import { loadFixture } from '../utility/io';
import { defaultConfig } from '../../lib/conf';
import { defaultAppOptions } from '../../lib/app';
import Globals from '../../lib/globals';

beforeAll(() => {
  Globals.initialize({ files: [], cwd: process.cwd(), programConfig: defaultConfig, options: defaultAppOptions });
});

describe('Parsing', () => {
  test('api-binary-body.js', () => {
    const jsFile = loadFixture('api-binary-body.js');
  });

  test('api-description.js', () => {
    const jsFile = loadFixture('api-description.js');
  });

  test('api-example.js', () => {
    const jsFile = loadFixture('api-example.js');
  });

  test('api-param.js', () => {
    const jsFile = loadFixture('api-param.js');
  });

  test('api-short-name.js', () => {
    const jsFile = loadFixture('api-short-name.js');
  });

  test('api-body-example.js', () => {
    const jsFile = loadFixture('api-body-example.js');
  });

  test('api-enum.js', () => {
    const jsFile = loadFixture('api-enum.js');
  });

  test('api-header-example.js', () => {
    const jsFile = loadFixture('api-header-example.js');
  });

  test('api-permission.js', () => {
    const jsFile = loadFixture('api-permission.js');
  });

  test('api-use.js', () => {
    const jsFile = loadFixture('api-use.js');
  });

  test('api-body.js', () => {
    const jsFile = loadFixture('api-body.js');
  });

  test('api-error-example.js', () => {
    const jsFile = loadFixture('api-error-example.js');
  });

  test('api-header.js', () => {
    const jsFile = loadFixture('api-header.js');
  });

  test('api-private.js', () => {
    const jsFile = loadFixture('api-private.js');
  });

  test('api-version.js', () => {
    const jsFile = loadFixture('api-version.js');
  });

  test('api-define-global.js', () => {
    const jsFile = loadFixture('api-define-global.js');
  });

  test('api-error-header-example.js', () => {
    const jsFile = loadFixture('api-error-header-example.js');
  });

  test('api-ignore.js', () => {
    const jsFile = loadFixture('api-ignore.js');
  });

  test('api-proto.js', () => {
    const jsFile = loadFixture('api-proto.js');
  });

  test('api-define.js', () => {
    const jsFile = loadFixture('api-define.js');
  });

  test('api-error-header.js', () => {
    const jsFile = loadFixture('api-error-header.js');
  });

  test('api-name.js', () => {
    const jsFile = loadFixture('api-name.js');
  });

  test('api-query-example.js', () => {
    const jsFile = loadFixture('api-query-example.js');
  });

  test('api-deprecated.js', () => {
    const jsFile = loadFixture('api-deprecated.js');
  });

  test('api-error.js', () => {
    const jsFile = loadFixture('api-error.js');
  });

  test('api-param-example.js', () => {
    const jsFile = loadFixture('api-param-example.js');
  });

  test('api-query.js', () => {
    const jsFile = loadFixture('api-query.js');
  });
});
