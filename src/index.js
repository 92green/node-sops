// @flow
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import yaml from 'js-yaml';
import {kmsDecryptSopsKey} from './kmsDecryptSopsKey';
import crypto from 'crypto';

const readFileAsync = promisify(fs.readFile);

export type Options = {
    overrideExisting?: boolean
};

export type Sops = {
    [key: string]: Object,
    sops: SopsDefinition
};

export type SopsDefinition = {
    kms: Array<KmsDefinition>,
    ladmodified: string,
    mac: string,
    unencrypted_suffix: string,
    version: string
};

export type KmsDefinition = {
    arn: string,
    created_at: string,
    enc: string
};

export type SopsValue = number | string | boolean;

const defaults = {
    overrideExisting: false
};

export async function readJsonPath(path: string[], data: Sop, decryptKey: ?Buffer){
    decryptKey = decryptKey || await kmsDecryptSopsKey(data.sops);
    let value = path.reduce((o, n) => o[n], data);
    return decryptItem(path.join(':'), value, decryptKey, data.sops);
}

export async function toEnvFromFile(file: string, options?: Options): Promise<void> {
    const filePath = path.resolve(process.cwd(), file);
    const fileContents = await readFileAsync(filePath, {encoding: 'utf8'});
    const ext = path.extname(filePath);

    switch(ext) {
        case '.yml':
        case '.yaml':
            return toEnvFromData(yaml.safeLoad(fileContents), options);
        case '.json':
            return toEnvFromData(JSON.parse(fileContents));
        default:
            throw new Error('Unrecognized file extension');
    }
}


export async function toEnvFromData(data: Sops, options?: Options): Promise<void> {
    const config = {...defaults, ...options};
    const entries = Object
        .entries(data)
        .filter(([key, value]) => key !== 'sops' && ['string', 'number', 'boolean'].includes(typeof value));

    const decryptKey = await kmsDecryptSopsKey(data.sops);

    if(!decryptKey) throw new Error('Unable to decrypt sops key');
    const decrypted = entries.map(([key, value]) => [key, decryptItem(key, value, decryptKey, data.sops)]);


    decrypted.forEach(([key, value]: [string, SopsValue]) => {
        const currentValue = process.env[key];
        if(typeof currentValue !== 'undefined' && !config.overrideExisting) return;
        process.env[key] = value.toString();
    });
}

export function decryptItem(
    key: string,
    value: mixed,
    decryptKey: Buffer,
    sops: SopsDefinition
): SopsValue {
    if(typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') throw new Error('Invalid type');

    const unencryptedSuffix = sops.unencrypted_suffix;
    if(key.endsWith(unencryptedSuffix)) return value;

    if(typeof value !== 'string') throw new Error('Invalid type');

    const valueMatch = value.match(/^ENC\[AES256_GCM,data:(.+),iv:(.+),tag:(.+),type:(.+)\]/);

    if(!valueMatch) throw new Error('Invalid key');

    const encValue = Buffer.from(valueMatch[1], 'base64');
    const iv = Buffer.from(valueMatch[2], 'base64');
    const tag = Buffer.from(valueMatch[3], 'base64');
    const valtype = valueMatch[4];

    var decryptor = crypto.createDecipheriv('aes-256-gcm', decryptKey, iv);
    decryptor.setAuthTag(tag);
    decryptor.setAAD(Buffer.from(`${key}:`));

    const cleartext = decryptor.update(encValue, undefined, 'utf8') + decryptor.final('utf8');

    switch (valtype) {
        case 'str':
            return cleartext;
        case 'int':
            return parseInt(cleartext, 10);
        case 'float':
            return parseFloat(cleartext);
        case 'bool':
            return cleartext === 'True';
        default:
            throw new Error("Unknown type ${type}");
    }
}
