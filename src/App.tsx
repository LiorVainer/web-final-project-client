import './App.css';
import { HomeScreen } from './pages/HomeScreen';
import { GlobalContextProvider } from './context/GlobalProvider';

export const App = () => {
    return (
        <GlobalContextProvider>
            <HomeScreen />
        </GlobalContextProvider>
    );
};
