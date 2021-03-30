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
import styles from './MainPage.module.scss';
import Text from '../components/Text';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import CopiableText from '../components/CopiableText';
import { Widget, WidgetHeader, WidgetBody } from '../components/widget';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import { Dialog, DialogHeader, DialogBody } from '../components/dialog';
import MessageDialog from '../components/dialogs/MessageDialog';
import AccountDialog from '../components/dialogs/AccountDialog';

const MainPage: React.FC = () => {
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [successDialog, setSuccessDialog] = React.useState(false);
	const [accountDialog, setAccountDialog] = React.useState(false);

	return (
		<section className={styles.root}>
			<Logo name={'My Custom Alpha Beta'} />
			{/* text sample */}
			<div>
				<Icon name={'info'} size={'xl'} />
			</div>
			<div>
				<CopiableText text="11111764222293342222L" />
			</div>
			<div>
				<Text color="pink" type="h1">
					143,160,552
				</Text>
				<Text color="white" type="h2">
					My Accounts
				</Text>
				<Text color="white" type="p">
					bd81020ded87d21bbfedc45ed...5d90
				</Text>
				<Button size={'m'}>Button</Button>
				<IconButton icon={'add'} size={'m'} />
			</div>

			<Widget>
				<WidgetHeader>
					<Text type={'h2'}>Widget title</Text>
				</WidgetHeader>
				<WidgetBody size={'m'} scrollbar={true}>
					<h2>Nazar</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</p>

					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</p>

					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</p>

					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</p>

					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</p>
				</WidgetBody>
			</Widget>

			<Button onClick={() => setDialogOpen(!dialogOpen)}>Open</Button>
			<Dialog
				open={dialogOpen}
				onClose={() => {
					setDialogOpen(false);
				}}
			>
				<DialogHeader>
					<Text type={'h1'}>Dialog Title</Text>
				</DialogHeader>
				<DialogBody>
					<Text type={'p'}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</Text>

					<Text type={'p'}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</Text>

					<Text type={'p'}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</Text>

					<Text type={'p'}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</Text>

					<Text type={'p'}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
						ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
						dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
						metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
						nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
						eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
						posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
						ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
						mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id
						arcu purus.
					</Text>
				</DialogBody>
			</Dialog>

			<Button onClick={() => setSuccessDialog(!successDialog)}>Sucess Dialog</Button>
			<MessageDialog
				open={successDialog}
				onClose={() => {
					setSuccessDialog(false);
				}}
				title={'Success'}
				backBtn={true}
			>
				<Text type={'p'}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
					ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
					dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
					metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
					nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
					eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
					posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
					ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
					mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id arcu
					purus.
				</Text>
			</MessageDialog>

			<Button onClick={() => setAccountDialog(!accountDialog)}>Account Dialog</Button>
			<AccountDialog
				open={accountDialog}
				onClose={() => {
					setAccountDialog(false);
				}}
				account={{
					binaryAddress: 'bd81020ded87d21bbfedc45ed24a081bb4905d90',
					base32Address: 'lskfxs5s8cnahtevckky6dmr8jt3c9oqgd5gjbs85',
					publicKey: '5f0a7f66a2e32dc9c6bd4521b6baad37cd70de1f8a6e51491932052f3d38ede4',
					passphrase:
						'ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget ornare id consectetur adipiscing elit consectetur adipiscing elit',
				}}
			>
				<Text type={'p'}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin neque est, placerat eget
					ornare id, dignissim quis turpis. Integer tincidunt ante nec aliquet finibus. Phasellus
					dapibus dignissim mattis. Quisque porttitor tempus risus quis mattis. Donec vel maximus
					metus. Vivamus mattis mollis nibh, nec bibendum urna tristique at. Vestibulum nec libero
					nec quam aliquam gravida vel eu lorem. Sed nec auctor lorem. Nunc tincidunt lectus diam,
					eget semper est tempor a. Curabitur convallis nunc et diam finibus, in gravida neque
					posuere. Maecenas in dolor et dolor sodales accumsan. Etiam dui augue, laoreet eu augue
					ut, dapibus cursus augue. Vestibulum vitae vehicula lectus. Maecenas eget tincidunt
					mauris. Nam dignissim elit a sem pellentesque, nec consequat enim faucibus. Aenean id arcu
					purus.
				</Text>
			</AccountDialog>
		</section>
	);
};

export default MainPage;
