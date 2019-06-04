# Sops decoder

This libary can be used to work with [sops](https://github.com/mozilla/sops). At the moment it only contains two methods, and has a bunch of caveats.

### `toEnvFromFile(file: string, options?: Options) => Promise<void>`

This method allows you to pass in a file path to a sops file with an extension of `.yaml`, `.yml`, or `.json`. After loading and parsing the file, it will be decrypted and the top level key value pairs will be added to `process.env`. If `options.overrideExisting` is set to true then any existing env vars with clashing names will be blatted.

### `toEnvFromData(data: Sops, options?: Options) => Promise<void>`

This method allows you to pass in a sops data object, it will be decrypted and the top level key value pairs will be added to `process.env`. If `options.overrideExisting` is set to true then any existing env vars with clashing names will be blatted.

### `readValueAtPathFromFile(filePath: string) => (path[])`

Returns a partially applyed function that allows a value to be read from a path in the JSON. This function loads the file (`yaml` or `json`) reads the key and returns a function that allows keys in the file to be read.

#### Example

Given a JSON file with an object `{ database: { password: "ENC[AES256_GCM,data:p673w==,iv:YY=,aad:UQ=,tag:A=]" }}`

 ```javascript
async function dbPassword() {
    const readValue = readValueAtPathFromFile(path.resolve(__dirname, './test2.json'));
    return await readValue(['database', 'password']);
}
```

### `readValueFromPath(path: string[], data: Sop, decryptKey: ?Buffer) => Promise<*>`

This function allows you to read a value from a loaded sops file, you must first load the file then this function can be used to read a value from a subpath.

#### Example

Given a JSON file with an object `{ database: { password: "ENC[AES256_GCM,data:p673w==,iv:YY=,aad:UQ=,tag:A=]" }}`

```javascript
import fs from 'fs';
import {promisify} from 'util';
const readFileAsync = promisify(fs.readFile);

async function dbPassword() {
    const fileContents = await readFileAsync(path.resolve(__dirname, './test2.json'), {encoding: 'utf8'});
    let data = JSON.parse(fileContents);
    return await readValueAtPathFromData(['database', 'password'], data);
}

```

---

some bits and pieces borrowed from https://github.com/koblas/sops-decoder-node