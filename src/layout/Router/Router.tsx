import { Route, Routes } from 'react-router';
import { MatchExperienceDetailsScreen } from '@pages/MatchExperienceDetailsScreen';
import { HomeScreen } from '@pages/HomeScreen';
import { Layout } from '@/layout/Layout';
import { MatchExperiencesCatalogScreen } from '@pages/MatchExperiencesCatalogScreen';
import { ROUTES } from '@/constants/routes.const';
import { AuthPage } from '@/pages/AuthPage';
import { ProtectedRoutes } from '@/layout/Router/ProtectedRoutes.tsx';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path={ROUTES.AUTH} element={<AuthPage />} />

            <Route path="/" element={<Layout />}>
                <Route element={<ProtectedRoutes />}>
                    <Route path={ROUTES.MATCH_EXPERIENCE}>
                        <Route path=":id" element={<MatchExperienceDetailsScreen />} />
                        <Route index element={<MatchExperiencesCatalogScreen />} />
                    </Route>
                    <Route path="/" element={<HomeScreen />} />
                </Route>
            </Route>
        </Routes>
    );
};
