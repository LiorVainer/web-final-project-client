import { createContext, useContext } from 'react';
import { AuthStorageService } from '@api/services/auth-storage.service.ts';
import { AuthResponse, PublicUser } from '@/models/user.model.ts';
import { AuthService } from '@api/services/auth.service.ts';
import { ROUTES } from '@/constants/routes.const.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    loggedInUser: PublicUser | null | undefined;
    isLoading: boolean;
    handleAuthResponse: (authResponse: AuthResponse) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const LOGGED_IN_USER_CACHE_TIME = 1000 * 60 * 5; // 5 minutes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();
    const { data: loggedInUser, isLoading } = useQuery<PublicUser | null>({
        queryKey: ['loggedInUser'],
        queryFn: async () => {
            const accessToken = AuthStorageService.getAccessToken();
            if (!accessToken) return null;
            return await AuthService.me();
        },
        staleTime: LOGGED_IN_USER_CACHE_TIME,
        retry: 1,
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            AuthStorageService.clearTokens();
        },
        onSuccess: () => {
            queryClient.setQueryData(['loggedInUser'], null); // Clear user data from cache
            window.location.href = ROUTES.AUTH; // Redirect to login
        },
    });

    const handleAuthResponse = (authResponse: AuthResponse) => {
        AuthStorageService.storeTokens(authResponse.accessToken, authResponse.refreshToken);
        const { refreshToken, accessToken, ...publicUser } = authResponse;
        queryClient.setQueryData(['loggedInUser'], publicUser); // Update cached user
    };

    return (
        <AuthContext.Provider value={{ loggedInUser, isLoading, handleAuthResponse, logout: logoutMutation.mutate }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
