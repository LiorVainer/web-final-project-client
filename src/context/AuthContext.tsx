import { createContext, useContext, useEffect, useState } from 'react';
import { AuthStorageService } from '@api/services/auth-storage.service.ts';
import { AuthResponse, PublicUser } from '@/models/user.model.ts';
import { AuthService } from '@api/services/auth.service.ts';
import { ROUTES } from '@/constants/routes.const.ts'; // For event-based logout handling

interface AuthContextType {
    loggedInUser: PublicUser | null;
    handleAuthResponse: (authResponse: AuthResponse) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedInUser, setLoggedInUser] = useState<PublicUser | null>(null);

    const getLoggedInUser = async () => {
        try {
            const accessToken = AuthStorageService.getAccessToken();
            if (!accessToken) return;

            const user = await AuthService.me();
            user && setLoggedInUser(user);
        } catch (error) {
            console.error('Error in fetching user:', error);
        }
    };
    console.log('LoggedInUser:', loggedInUser);

    useEffect(() => {
        void getLoggedInUser();
    }, []);

    const logout = () => {
        AuthStorageService.clearTokens(); // Remove tokens from storage
        setLoggedInUser(null); // Clear user context
        window.location.href = ROUTES.AUTH;
    };

    const handleAuthResponse = (authResponse: AuthResponse) => {
        AuthStorageService.storeTokens(authResponse.accessToken, authResponse.refreshToken);
        const { refreshToken, accessToken, ...publicUser } = authResponse;
        setLoggedInUser(publicUser);
    };

    return <AuthContext.Provider value={{ loggedInUser, handleAuthResponse, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
