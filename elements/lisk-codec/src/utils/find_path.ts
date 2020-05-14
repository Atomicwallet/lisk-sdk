/*
 * Copyright © 2020 Lisk Foundation
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

interface GenericObject {
	[key: string]: object | string | number
}

export const findObjectByPath = (object: GenericObject, pathArr: string[]): GenericObject | undefined => {
	let result = object;
	  // eslint-disable-next-line @typescript-eslint/prefer-for-of
	  for (let i = 0; i < pathArr.length; i += 1) {
		  if (result[pathArr[i]] === undefined) {
			  return undefined;
		  }
		  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		  result = result[pathArr[i]] as GenericObject;
	  }
	  return result;
}
