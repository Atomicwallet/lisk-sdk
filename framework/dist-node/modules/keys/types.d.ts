/// <reference types="node" />
export interface AccountKeys {
    keys: DecodedAsset;
}
export interface DecodedAsset {
    numberOfSignatures: number;
    mandatoryKeys: Buffer[];
    optionalKeys: Buffer[];
}
