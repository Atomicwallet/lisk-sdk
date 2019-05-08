import * as cryptography from '@liskhq/lisk-cryptography';
interface EncryptMessageInputs {
    readonly message: string;
    readonly passphrase: string;
    readonly recipient: string;
}
export declare const encryptMessage: ({ message, passphrase, recipient, }: EncryptMessageInputs) => cryptography.EncryptedMessageWithNonce;
interface DecryptMessageInputs {
    readonly cipher: string;
    readonly nonce: string;
    readonly passphrase: string;
    readonly senderPublicKey: string;
}
export declare const decryptMessage: ({ cipher, nonce, passphrase, senderPublicKey, }: DecryptMessageInputs) => {
    message: string;
};
interface EncryptPassphraseInputs {
    readonly passphrase: string;
    readonly password: string;
}
export declare const encryptPassphrase: ({ passphrase, password, }: EncryptPassphraseInputs) => {
    encryptedPassphrase: string;
};
interface DecryptPassphraseInput {
    readonly encryptedPassphrase: string;
    readonly password: string;
}
export declare const decryptPassphrase: ({ encryptedPassphrase, password, }: DecryptPassphraseInput) => {
    passphrase: string;
};
export declare const getKeys: (passphrase: string) => cryptography.Keypair;
export declare const getAddressFromPublicKey: (publicKey: string) => {
    readonly address: string;
};
interface SignMessageInputs {
    readonly message: string;
    readonly passphrase: string;
}
export declare const signMessage: ({ message, passphrase }: SignMessageInputs) => cryptography.SignedMessageWithOnePassphrase;
interface VerifyMessageInputs {
    readonly message: string;
    readonly publicKey: string;
    readonly signature: string;
}
export declare const verifyMessage: ({ publicKey, signature, message, }: VerifyMessageInputs) => {
    verified: boolean;
};
export {};
