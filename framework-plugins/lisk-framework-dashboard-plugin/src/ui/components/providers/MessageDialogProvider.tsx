/*
 * Copyright © 2021 Lisk Foundation
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

import * as React from 'react';
import MessageDialog from '../dialogs/MessageDialog';

interface State {
	open: boolean;
	title: string;
	body: React.ReactNode;
	backBtn: boolean;
}

const defaultValue: State = {
	open: false,
	title: '',
	body: <React.Fragment></React.Fragment>,
	backBtn: true,
};

export const MessageDialogProviderContext = React.createContext<{
	state: State;
	dispatch: (state: State) => void;
	// eslint-disable-next-line @typescript-eslint/no-empty-function
}>({ state: defaultValue, dispatch: () => {} });

const MessageDialogProvider: React.FC = () => {
	const [state, updateState] = React.useState(defaultValue);

	return (
		<MessageDialogProviderContext.Provider value={{ state, dispatch: updateState }}>
			<MessageDialog open={state.open} title={state.title} backBtn={state.backBtn}>
				{state.body}
			</MessageDialog>
		</MessageDialogProviderContext.Provider>
	);
};

export default MessageDialogProvider;
