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

ALTER TABLE "trs" ADD COLUMN IF NOT EXISTS "nonce" TEXT DEFAULT '0';
ALTER TABLE "trs" ALTER COLUMN "timestamp" DROP NOT NULL;
ALTER TABLE "mem_accounts" ADD COLUMN IF NOT EXISTS "nonce" TEXT DEFAULT '0';