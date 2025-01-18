import './App.css';
import { HomeScreen } from './pages/HomeScreen';
import { GlobalContextProvider } from './context/GlobalProvider';
import { ErrorBoundary } from './components/BaseErrorBoundary';

export const App = () => {
    return (
        <ErrorBoundary>
        <GlobalContextProvider>
            <HomeScreen />
        </GlobalContextProvider>
        </ErrorBoundary>
    );
};
