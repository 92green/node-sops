// @flow
export async function kmsDecryptSopsKey(sops: Object) {
    switch(sops.lastmodified) {
        case '2018-07-31T06:14:25Z':
            return Buffer.from('/5GNmWHz6T6/RtRdHkRFia1ILTAouKI3YKBp+OLYRLQ=', 'base64');

        case '2018-07-31T06:14:40Z':
            return Buffer.from('2ZBTbKMyNFc+7NzlEi6mpTsSYS9ZRjgC4GZmwcQjEEQ=', 'base64');
    }
}