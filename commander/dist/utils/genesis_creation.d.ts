import { RegisteredSchema } from 'lisk-framework';
interface generateGenesisBlockInput {
    readonly schema: RegisteredSchema;
    readonly defaultAccount: Record<string, unknown>;
    readonly numOfAccounts: number;
    readonly numOfValidators: number;
    readonly tokenDistribution: number;
}
interface generateGenesisBlockOutput {
    readonly genesisBlock: Record<string, unknown>;
    readonly accountList: AccountInfo[];
    readonly delegateList: {
        readonly address: string;
        readonly passphrase: string;
        readonly username: string;
    }[];
}
interface AccountInfo {
    readonly address: string;
    readonly passphrase: string;
}
export declare const generateGenesisBlock: ({ defaultAccount, numOfAccounts, numOfValidators, schema, tokenDistribution, }: generateGenesisBlockInput) => generateGenesisBlockOutput;
export {};
