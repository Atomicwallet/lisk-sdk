import { APIClient as APIClientModule } from '@liskhq/lisk-api-client';
import * as constantsModule from '@liskhq/lisk-constants';
import * as cryptographyModule from '@liskhq/lisk-cryptography';
import * as passphraseModule from '@liskhq/lisk-passphrase';
import * as transactionModule from '@liskhq/lisk-transactions';
export declare const APIClient: typeof APIClientModule;
export declare const constants: typeof constantsModule;
export declare const cryptography: typeof cryptographyModule;
export declare const passphrase: typeof passphraseModule;
export declare const transaction: typeof transactionModule;
declare const _default: {
    APIClient: typeof APIClientModule;
    constants: typeof constantsModule;
    cryptography: typeof cryptographyModule;
    passphrase: typeof passphraseModule;
    transaction: typeof transactionModule;
};
export default _default;
