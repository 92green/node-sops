// @flow
/* global jest */
const original = jest.requireActual('../kmsDecryptSopsKey');
export async function kmsDecryptSopsKey(sops: Object) {
    let value;
    switch(sops.lastmodified) {
        case '2018-07-31T06:14:25Z':
            return Buffer.from('/5GNmWHz6T6/RtRdHkRFia1ILTAouKI3YKBp+OLYRLQ=', 'base64');
        case '2018-07-31T06:14:40Z':
            return Buffer.from('2ZBTbKMyNFc+7NzlEi6mpTsSYS9ZRjgC4GZmwcQjEEQ=', 'base64');
        case '2019-06-04T01:35:05Z':
            return Buffer.from('xWYjFxnYDNmaMJpIprPVwk0OAyrcQq6XsDy2RDRW784=', 'base64');
        default:
            value = await original.kmsDecryptSopsKey(sops);
            console.log('Please mock me', value.toString('base64'), sops);
            throw new Error('Key not correctly mocked');
    }
}