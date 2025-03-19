import { ROUTES } from '@/constants/routes.const';
import { useAuth } from '@/context/AuthContext.tsx';
import { Navigate, Outlet } from 'react-router';

import { LoadingContainer } from '@components/LoadingContainer';

export const ProtectedRoutes = () => {
    const { loggedInUser, isLoading } = useAuth(); // Get user state from context

    console.log('ProtectedRoutes -> loggedInUser', loggedInUser);

    if (isLoading) return <LoadingContainer loadingText={`Loading User's Data`} />;

    return loggedInUser ? <Outlet /> : <Navigate to={ROUTES.AUTH} replace />;
};
