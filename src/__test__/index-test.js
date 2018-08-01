// @flow
import {toEnvFromData} from '../';
import {toEnvFromFile} from '../';
import path from 'path';
import fs from 'fs';

jest.mock('../kmsDecryptSopsKey');


test('Can read from yml file', async () => {
    await toEnvFromFile(path.resolve(__dirname, './test.yml'));
    expect(process.env.YML_TEST_VAR_STRING).toBe('test_var_string');
    expect(process.env.YML_TEST_VAR_INT).toBe('1');
    expect(process.env.YML_TEST_VAR_FLOAT).toBe('1.2');
    expect(process.env.YML_TEST_VAR_BOOLEAN).toBe('true');

});


test('Can read from json file', async () => {
    await toEnvFromFile(path.resolve(__dirname, './test.json'));
    expect(process.env.JSON_TEST_VAR_STRING).toBe('test_var_string');
    expect(process.env.JSON_TEST_VAR_INT).toBe('1');
    expect(process.env.JSON_TEST_VAR_FLOAT).toBe('1.2');
    expect(process.env.JSON_TEST_VAR_BOOLEAN).toBe('true');
});
