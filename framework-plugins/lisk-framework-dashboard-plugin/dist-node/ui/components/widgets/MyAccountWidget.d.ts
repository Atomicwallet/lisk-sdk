import * as React from 'react';
import { Account } from '../../types';
interface MyAccountProps {
    accounts: ReadonlyArray<Account>;
    onSelect?: (account: Account) => void;
}
declare const MyAccountWidget: React.FC<MyAccountProps>;
export default MyAccountWidget;
