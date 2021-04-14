import * as React from 'react';
import MainPage from './pages/MainPage';
import MessageDialogProvider from './components/providers/MessageDialogProvider';

const App: React.FC = () => (
	<MessageDialogProvider>
		<MainPage />
	</MessageDialogProvider>
);

export default App;
