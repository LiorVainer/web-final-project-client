import { createContext, useContext, useState } from 'react';
import { AuthStorageService } from '@api/services/auth-storage.service.ts';
import { AuthResponse, PublicUser } from '@/models/user.model.ts'; // For event-based logout handling

interface AuthContextType {
    user: PublicUser | null;
    handleAuthResponse: (authResponse: AuthResponse) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<PublicUser | null>(null);

    const logout = () => {
        AuthStorageService.clearTokens(); // Remove tokens from storage
        setUser(null); // Clear user context
        window.location.href = '/login'; // Redirect to login page
    };

    const handleAuthResponse = (authResponse: AuthResponse) => {
        AuthStorageService.storeTokens(authResponse.accessToken, authResponse.refreshToken);
        const { refreshToken, accessToken, ...publicUser } = authResponse;
        setUser(publicUser);
    };

    return <AuthContext.Provider value={{ user, handleAuthResponse, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
