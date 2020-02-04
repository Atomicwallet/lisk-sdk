/*
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
import { AccountJSON } from './types';

export class Account {
	public address: string;
	public balance: bigint;
	public fees: bigint;
	public rewards: bigint;
	public voteWeight: bigint;
	public missedBlocks: number;
	public producedBlocks: number;
	public publicKey: string | undefined;
	public secondPublicKey: string | null;
	public secondSignature: number;
	public username: string | null;
	public isDelegate: number;
	public nameExist: boolean;
	public multiMin: number;
	public multiLifetime: number;
	public asset: object;
	public membersPublicKeys: string[];
	public votedDelegatesPublicKeys: string[];

	public constructor(accountInfo: AccountJSON) {
		this.address = accountInfo.address;
		this.balance = accountInfo.balance
			? BigInt(accountInfo.balance)
			: BigInt(0);
		this.missedBlocks = accountInfo.missedBlocks;
		this.producedBlocks = accountInfo.producedBlocks;
		this.isDelegate = accountInfo.isDelegate;
		this.publicKey = accountInfo.publicKey;
		this.secondPublicKey = accountInfo.secondPublicKey;
		this.secondSignature = accountInfo.secondSignature;
		this.username = accountInfo.username;
		this.fees = accountInfo.fees ? BigInt(accountInfo.fees) : BigInt(0);
		this.rewards = accountInfo.rewards
			? BigInt(accountInfo.rewards)
			: BigInt(0);
		this.voteWeight = accountInfo.voteWeight
			? BigInt(accountInfo.voteWeight)
			: BigInt(0);
		this.nameExist = accountInfo.nameExist;
		this.multiMin = accountInfo.multiMin;
		this.multiLifetime = accountInfo.multiLifetime;
		this.asset = accountInfo.asset;
		this.votedDelegatesPublicKeys = accountInfo.votedDelegatesPublicKeys;
		this.membersPublicKeys = accountInfo.membersPublicKeys;
	}

	public static getDefaultAccount = (address: string): Account =>
		new Account({
			address,
			publicKey: undefined,
			// tslint:disable-next-line:no-null-keyword
			secondPublicKey: null,
			secondSignature: 0,
			// tslint:disable-next-line:no-null-keyword
			username: null,
			isDelegate: 0,
			balance: BigInt(0),
			missedBlocks: 0,
			producedBlocks: 0,
			fees: BigInt(0),
			rewards: BigInt(0),
			voteWeight: BigInt(0),
			nameExist: false,
			multiMin: 0,
			multiLifetime: 0,
			votedDelegatesPublicKeys: [],
			asset: {},
			membersPublicKeys: [],
		});

	public addBalance(balance: string | BigInt): void {
		this.balance = this.balance + BigInt(balance);
	}
}
