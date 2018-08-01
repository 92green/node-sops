// @flow
import aws from 'aws-sdk';
import type {SopsDefinition} from './';

export async function kmsDecryptSopsKey(sops: SopsDefinition): Promise<?Buffer> {
    const kmsKeys = sops.kms;

    for(const key of kmsKeys) {
        try {
            const region = key.arn.split(':')[3];
            const client = new aws.KMS({region});

            const decryptResponse = await client.decrypt({
                CiphertextBlob: Buffer.from(key.enc, 'base64')
            }).promise();

            return decryptResponse.Plaintext;
        } catch(err) {
            continue;
        }
    }
}
