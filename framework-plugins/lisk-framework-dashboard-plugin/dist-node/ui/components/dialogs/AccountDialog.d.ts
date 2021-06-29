import * as React from 'react';
import { DialogProps } from '../dialog';
import { Account } from '../../types';
interface AccountDialogProps extends DialogProps {
    account: Account;
}
declare const AccountDialog: React.FC<AccountDialogProps>;
export default AccountDialog;
