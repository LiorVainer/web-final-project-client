import { Route, Routes } from 'react-router';
import { MatchExperienceDetailsScreen } from '@pages/MatchExperienceDetailsScreen';
import { MatchExperiencesCatalogScreen } from 'src/pages/MatchExperiencesCatalogScreen';
import { Layout } from '@/layout/Layout';
import { ROUTES } from '@/constants/routes.const';
import { ProtectedRoutes } from '@/layout/Router/ProtectedRoutes.tsx';
import { AuthPage } from '@pages/AuthPage';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path={ROUTES.AUTH}>
                <Route index element={<AuthPage />}></Route>
            </Route>
            <Route path="/" element={<Layout />}>
                <Route element={<ProtectedRoutes />}>
                    <Route path={ROUTES.MATCH_EXPERIENCE}>
                        <Route path=":id" element={<MatchExperienceDetailsScreen />} />
                        <Route index element={<MatchExperiencesCatalogScreen mode={'my'} />} />
                    </Route>
                    <Route path="/" element={<MatchExperiencesCatalogScreen mode={'all'} />} />
                </Route>
            </Route>
        </Routes>
    );
};
