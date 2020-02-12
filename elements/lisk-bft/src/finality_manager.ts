/*
 * Copyright © 2018 Lisk Foundation
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

import * as assert from 'assert';
import * as Debug from 'debug';
import { EventEmitter } from 'events';

import { BFT_ROUND_THRESHOLD } from './constant';
import { HeadersList } from './headers_list';
import {
	BFTChainDisjointError,
	BFTForkChoiceRuleError,
	BFTInvalidAttributeError,
	BFTLowerChainBranchError,
	BlockHeader,
} from './types';
import { validateBlockHeader } from './utils';

const debug = Debug('lisk:bft:consensus_manager');

export const EVENT_BFT_FINALIZED_HEIGHT_CHANGED =
	'EVENT_BFT_FINALIZED_HEIGHT_CHANGED';

export class FinalityManager extends EventEmitter {
	public readonly activeDelegates: number;
	public readonly preVoteThreshold: number;
	public readonly preCommitThreshold: number;
	public readonly processingThreshold: number;
	public readonly maxHeaders: number;

	public finalizedHeight: number;
	public chainMaxHeightPrevoted: number;
	public headers: HeadersList;

	private state: {
		[key: string]: {
			maxPreVoteHeight: number;
			maxPreCommitHeight: number;
		};
	};
	private preVotes: {
		[key: string]: number;
	};
	private preCommits: {
		[key: string]: number;
	};

	public constructor({
		finalizedHeight,
		activeDelegates,
	}: {
		readonly finalizedHeight: number;
		readonly activeDelegates: number;
	}) {
		super();
		assert(activeDelegates > 0, 'Must provide a positive activeDelegates');

		/* tslint:disable:no-magic-numbers */

		// Set constants
		this.activeDelegates = activeDelegates;

		// Threshold to consider a block pre-voted
		this.preVoteThreshold = Math.ceil((this.activeDelegates * 2) / 3);

		// Threshold to consider a block pre-committed (or finalized)
		this.preCommitThreshold = Math.ceil((this.activeDelegates * 2) / 3);

		// Limit for blocks to make perform verification or pre-vote/pre-commit (1 block less than 3 rounds)
		this.processingThreshold = this.activeDelegates * BFT_ROUND_THRESHOLD - 1;

		// Maximum headers to store (5 rounds)
		this.maxHeaders = this.activeDelegates * 5;

		this.headers = new HeadersList({ size: this.maxHeaders });

		// Height up to which blocks are finalized
		this.finalizedHeight = finalizedHeight;

		// Height up to which blocks have pre-voted
		this.chainMaxHeightPrevoted = 0;

		this.state = {};
		this.preVotes = {};
		this.preCommits = {};

		/* tslint:enable:no-magic-numbers */
	}

	public addBlockHeader(blockHeader: BlockHeader): FinalityManager {
		debug('addBlockHeader invoked');
		debug('validateBlockHeader invoked');
		// Validate the schema of the header
		// To spy exported function in same module we have to call it as this
		validateBlockHeader(blockHeader);

		// Verify the integrity of the header with chain
		this.verifyBlockHeaders(blockHeader);

		// Add the header to the list
		this.headers.add(blockHeader);
		// Update the pre-votes and pre-commits
		this.updatePreVotesPreCommits(blockHeader);

		// Update the pre-voted confirmed and finalized height
		this.updatePreVotedAndFinalizedHeight();

		// Cleanup pre-votes and pre-commits
		this._cleanup();

		debug('after adding block header', {
			finalizedHeight: this.finalizedHeight,
			chainMaxHeightPrevoted: this.chainMaxHeightPrevoted,
			minHeight: this.minHeight,
			maxHeight: this.maxHeight,
		});

		return this;
	}

	public removeBlockHeaders({
		aboveHeight,
	}: {
		readonly aboveHeight: number;
	}): void {
		debug('removeBlockHeaders invoked');

		const removeAboveHeight = aboveHeight;

		// Remove block header from the list
		this.headers.remove({ aboveHeight: removeAboveHeight });

		// Recompute finality data
		this.recompute();
	}

	public updatePreVotesPreCommits(lastBlockHeader: BlockHeader): boolean {
		debug('updatePreVotesPreCommits invoked');
		// Update applies particularly in reference to last block header in the list
		const header = lastBlockHeader || this.headers.last;

		// If delegate forged a block with higher or same height previously
		// That means he is forging on other chain and we don't count any
		// Pre-votes and pre-commits from him
		if (header.maxHeightPreviouslyForged >= header.height) {
			return false;
		}

		// Get delegate public key
		const { delegatePublicKey } = header;

		// Load or initialize delegate state in reference to current BlockHeaderManager block headers
		const delegateState = this.state[delegatePublicKey] || {
			maxPreVoteHeight: 0,
			maxPreCommitHeight: 0,
		};

		const minValidHeightToPreCommit = this._getMinValidHeightToPreCommit(
			header,
		);

		// If delegate is new then first block of the round will be considered
		// If it forged before then we probably have the last commit height
		// Delegate can't pre-commit a block before the above mentioned conditions
		const minPreCommitHeight = Math.max(
			header.delegateMinHeightActive,
			minValidHeightToPreCommit,
			delegateState.maxPreCommitHeight + 1,
		);

		// Delegate can't pre-commit the blocks on tip of the chain
		const maxPreCommitHeight = header.height - 1;

		/* tslint:disable-next-line: no-let*/
		for (let j = minPreCommitHeight; j <= maxPreCommitHeight; j += 1) {
			// Add pre-commit if threshold is reached
			if (this.preVotes[j] >= this.preVoteThreshold) {
				// Increase the pre-commit for particular height
				this.preCommits[j] = (this.preCommits[j] || 0) + 1;

				// Keep track of the last pre-commit point
				delegateState.maxPreCommitHeight = j;
			}
		}

		// Check between height of first block of the round when delegate was active
		// Or one step ahead where it forged the last block
		// Or one step ahead where it left the last pre-vote
		// Or maximum 3 rounds backward
		const minPreVoteHeight = Math.max(
			header.delegateMinHeightActive,
			header.maxHeightPreviouslyForged + 1,
			delegateState.maxPreVoteHeight + 1,
			header.height - this.processingThreshold,
		);
		// Pre-vote upto current block height
		const maxPreVoteHeight = header.height;

		/* tslint:disable-next-line: no-let*/
		for (let j = minPreVoteHeight; j <= maxPreVoteHeight; j += 1) {
			this.preVotes[j] = (this.preVotes[j] || 0) + 1;
		}
		// Update delegate state
		delegateState.maxPreVoteHeight = maxPreVoteHeight;

		// Set the delegate state
		this.state[delegatePublicKey] = delegateState;

		return true;
	}

	public updatePreVotedAndFinalizedHeight(): boolean {
		debug('updatePreVotedAndFinalizedHeight invoked');
		if (this.headers.length === 0) {
			return false;
		}

		const highestHeightPreVoted = Object.keys(this.preVotes)
			.reverse()
			.find(key => this.preVotes[key] >= this.preVoteThreshold);

		this.chainMaxHeightPrevoted = highestHeightPreVoted
			? parseInt(highestHeightPreVoted, 10)
			: this.chainMaxHeightPrevoted;

		const highestHeightPreCommitted = Object.keys(this.preCommits)
			.reverse()
			.find(key => this.preCommits[key] >= this.preCommitThreshold);

		// Store current finalizedHeight
		const previouslyFinalizedHeight = this.finalizedHeight;

		if (highestHeightPreCommitted) {
			this.finalizedHeight = parseInt(highestHeightPreCommitted, 10);
		}

		if (previouslyFinalizedHeight !== this.finalizedHeight) {
			this.emit(EVENT_BFT_FINALIZED_HEIGHT_CHANGED, this.finalizedHeight);
		}

		return true;
	}

	/**
	 * Get the min height from which a delegate can make pre-commits
	 *
	 * The flow is as following:
	 * - We search backward from top block to bottom block in the chain
	 * - We can search down to current block height - processingThreshold(302)
	 * -
	 */
	private _getMinValidHeightToPreCommit(header: BlockHeader): number {
		// We search backward from top block to bottom block in the chain

		/* We should search down to the height we have in our headers list
			and within the processing threshold which is three rounds	*/
		const searchTillHeight = Math.max(
			this.minHeight,
			header.height - this.processingThreshold,
		);

		/* Start looking from the point where delegate forged the block last time
		 	and within the processing threshold which is three rounds */

		// tslint:disable-next-line no-let
		let needleHeight = Math.max(
			header.maxHeightPreviouslyForged,
			header.height - this.processingThreshold,
		);

		// Hold reference for the current header
		// tslint:disable-next-line no-let
		let currentBlockHeader = { ...header };

		while (needleHeight >= searchTillHeight) {
			/*
			 * We need to ensure that the delegate forging header did not forge
			 * on any other chain, i.e. maxHeightPreviouslyForged always refers to
			 * a height with a block forged by the same delegate.
			 */
			if (needleHeight === currentBlockHeader.maxHeightPreviouslyForged) {
				const previousBlockHeader = this.headers.get(needleHeight);
				if (!previousBlockHeader) {
					debug('Fail to get cached block header');

					return 0;
				}

				/* Was the previous block suggested by current block header
				 	was actually forged by same delegate? If not then just return from here
				 	delegate can't commit blocks down from that height
				 */
				if (
					previousBlockHeader.delegatePublicKey !== header.delegatePublicKey ||
					previousBlockHeader.maxHeightPreviouslyForged >= needleHeight
				) {
					return needleHeight + 1;
				}
				// Move the needle to previous block and consider it current for next iteration
				needleHeight = previousBlockHeader.maxHeightPreviouslyForged;
				currentBlockHeader = previousBlockHeader;
			} else {
				needleHeight -= 1;
			}
		}

		return Math.max(needleHeight + 1, searchTillHeight);
	}

	public recompute(): void {
		this.state = {};
		this.chainMaxHeightPrevoted = 0;
		this.preVotes = {};
		this.preCommits = {};

		this.headers.items.forEach(header => {
			this.updatePreVotesPreCommits(header);
		});

		this.updatePreVotedAndFinalizedHeight();

		this._cleanup();
	}

	private _findLastBlockForgedByDelegate(
		delegatePublicKey: string,
	): BlockHeader | undefined {
		// Find top most block forged by same delegate
		return this.headers
			.top(this.processingThreshold)
			.reverse()
			.find(header => header.delegatePublicKey === delegatePublicKey);
	}

	public verifyBlockHeaders(blockHeader: BlockHeader): boolean {
		debug('verifyBlockHeaders invoked');
		debug(blockHeader);

		// We need minimum processingThreshold to decide
		// If maxHeightPrevoted is correct
		if (
			this.headers.length >= this.processingThreshold &&
			blockHeader.maxHeightPrevoted !== this.chainMaxHeightPrevoted
		) {
			throw new BFTInvalidAttributeError(
				`Wrong maxHeightPrevoted in blockHeader. maxHeightPrevoted: ${blockHeader.maxHeightPrevoted}, : ${this.chainMaxHeightPrevoted}`,
			);
		}

		// Find top most block forged by same delegate
		const delegateLastBlock = this._findLastBlockForgedByDelegate(
			blockHeader.delegatePublicKey,
		);

		if (!delegateLastBlock) {
			return true;
		}

		// Order the two block headers such that earlierBlock must be forged first
		// tslint:disable-next-line no-let
		let earlierBlock = delegateLastBlock;
		// tslint:disable-next-line no-let
		let laterBlock = blockHeader;
		const higherMaxHeightPreviouslyForgerd =
			earlierBlock.maxHeightPreviouslyForged >
			laterBlock.maxHeightPreviouslyForged;
		const sameMaxHeightPreviouslyForgerd =
			earlierBlock.maxHeightPreviouslyForged ===
			laterBlock.maxHeightPreviouslyForged;
		const higherMaxHeightPrevoted =
			earlierBlock.maxHeightPrevoted > laterBlock.maxHeightPrevoted;
		const sameMaxHeightPrevoted =
			earlierBlock.maxHeightPrevoted === laterBlock.maxHeightPrevoted;
		const higherHeight = earlierBlock.height > laterBlock.height;
		if (
			higherMaxHeightPreviouslyForgerd ||
			(sameMaxHeightPreviouslyForgerd && higherMaxHeightPrevoted) ||
			(sameMaxHeightPreviouslyForgerd && sameMaxHeightPrevoted && higherHeight)
		) {
			[earlierBlock, laterBlock] = [laterBlock, earlierBlock];
		}

		if (
			earlierBlock.maxHeightPrevoted === laterBlock.maxHeightPrevoted &&
			earlierBlock.height >= laterBlock.height
		) {
			/* Violation of the fork choice rule as delegate moved to different chain
			 without strictly larger maxHeightPreviouslyForged or larger height as
			 justification. This in particular happens, if a delegate is double forging. */
			throw new BFTForkChoiceRuleError();
		}

		if (earlierBlock.height > laterBlock.maxHeightPreviouslyForged) {
			throw new BFTChainDisjointError();
		}

		if (earlierBlock.maxHeightPrevoted > laterBlock.maxHeightPrevoted) {
			throw new BFTLowerChainBranchError();
		}

		return true;
	}

	private _cleanup(): void {
		// tslint:disable:no-delete no-dynamic-delete
		Object.keys(this.preVotes)
			.slice(0, this.maxHeaders * -1)
			.forEach(key => {
				delete this.preVotes[key];
			});

		Object.keys(this.preCommits)
			.slice(0, this.maxHeaders * -1)
			.forEach(key => {
				delete this.preCommits[key];
			});
		// tslint:enable:no-delete no-dynamic-delete
	}

	public get minHeight(): number {
		return this.headers.first ? this.headers.first.height : 0;
	}

	public get maxHeight(): number {
		return this.headers.last ? this.headers.last.height : 0;
	}
}
