// @flow
import {toEnvFromData} from '../';
import {toEnvFromFile} from '../';
import {readValueAtPathFromData} from '../';
import {readValueAtPathFromFile} from '../';
import path from 'path';
import fs from 'fs';
import {promisify} from 'util';
const readFileAsync = promisify(fs.readFile);
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


test('Can lookup keys', async () => {
    const fileContents = await readFileAsync(path.resolve(__dirname, './test.json'), {encoding: 'utf8'});
    let data = JSON.parse(fileContents);
    expect(await readValueAtPathFromData(['JSON_TEST_VAR_STRING'], data)).toBe('test_var_string');
});

test('Can lookup keys inside objects', async () => {
    const fileContents = await readFileAsync(path.resolve(__dirname, './test2.json'), {encoding: 'utf8'});
    let data = JSON.parse(fileContents);
    expect(await readValueAtPathFromData(['example_object', 'key1'], data)).toBe('value1');
});

test('Can lookup strings', async () => {
    const fileContents = await readFileAsync(path.resolve(__dirname, './test2.json'), {encoding: 'utf8'});
    let data = JSON.parse(fileContents);
    expect(await readValueAtPathFromData(['example_key'], data)).toBe('example_value');
});

test('Can lookup numbers', async () => {
    const fileContents = await readFileAsync(path.resolve(__dirname, './test2.json'), {encoding: 'utf8'});
    let data = JSON.parse(fileContents);
    expect(await readValueAtPathFromData(['example_number'], data)).toBe(1234.56789);
});

test('readValueAtPathFromFile - returns the value at the path and loads the file', async () => {
    let readValue = await readValueAtPathFromFile(path.resolve(__dirname, './test2.json'));
    expect(await readValue(['example_number'])).toBe(1234.56789);
});
// TODO: fix allow arrays to be 
// test('Can lookup arrays', async () => {
//     const fileContents = await readFileAsync(path.resolve(__dirname, './test2.json'), {encoding: 'utf8'});
//     let data = JSON.parse(fileContents);
//     expect(await readValueAtPathFromData(['example_array', '0'], data)).toBe('example_value1');
// });
