import { Route, Routes } from 'react-router';
import { MatchExperienceDetailsScreen } from '@pages/MatchExperienceDetailsScreen';
import { HomeScreen } from '@pages/HomeScreen';
import { Layout } from '@/layout/Layout';
import { MatchExperiencesCatalogScreen } from '@pages/MatchExperiencesCatalogScreen';
import { ROUTES } from '@/constants/routes.const';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path={ROUTES.MATCH_EXPERIENCE}>
                    <Route path=":id" element={<MatchExperienceDetailsScreen />}></Route>
                    <Route index element={<MatchExperiencesCatalogScreen />}></Route>
                </Route>

                <Route path="/" element={<HomeScreen />} />
            </Route>
        </Routes>
    );
};
