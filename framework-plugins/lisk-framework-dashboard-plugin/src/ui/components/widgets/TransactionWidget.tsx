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
import { TableBody, TableHeader, Table } from '../Table';
import { Widget, WidgetHeader, WidgetBody } from '../widget';
import Text from '../Text';
import CopiableText from '../CopiableText';
import { Transaction } from '../../types';

interface WidgetProps {
	transactions: Transaction[];
	title: string;
}

const TransactionWidget: React.FC<WidgetProps> = props => {
	const { transactions, title } = props;

	return (
		<Widget>
			<WidgetHeader>
				<Text type={'h2'}>{title}</Text>
			</WidgetHeader>
			<WidgetBody>
				<Table>
					<TableHeader sticky>
						<tr>
							<th style={{ width: 'calc(40% - 30px)' }}>
								<Text>Id</Text>
							</th>
							<th style={{ width: 'calc(30% - 30px)' }}>
								<Text>Sender</Text>
							</th>
							<th style={{ width: 'calc(30% - 30px)' }}>
								<Text>Module:Asset</Text>
							</th>
							<th style={{ width: '30px' }}>
								<Text>Fee</Text>
							</th>
						</tr>
					</TableHeader>
					<TableBody>
						{transactions.map((transaction, index) => (
							<tr key={index}>
								<td>
									<CopiableText text={transaction.id}>{transaction.id}</CopiableText>
								</td>
								<td>
									<CopiableText text={transaction.senderPublicKey}>
										{transaction.senderPublicKey}
									</CopiableText>
								</td>
								<td>
									<Text key={transaction.moduleAsset}>{transaction.moduleAsset}</Text>
								</td>
								<td>
									<Text key={transaction.fee}>{transaction.fee}</Text>
								</td>
							</tr>
						))}
					</TableBody>
				</Table>
			</WidgetBody>
		</Widget>
	);
};

export default TransactionWidget;
