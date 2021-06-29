import * as React from 'react';
import { RegisteredModule, SendTransactionOptions } from '../../types';
interface WidgetProps {
    modules: RegisteredModule[];
    onSubmit: (data: SendTransactionOptions) => void;
}
declare const SendTransactionWidget: React.FC<WidgetProps>;
export default SendTransactionWidget;
