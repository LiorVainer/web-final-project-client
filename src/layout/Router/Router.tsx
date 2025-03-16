import { Route, Routes } from 'react-router';
import { MatchExperienceDetailsScreen } from '@pages/MatchExperienceDetailsScreen';
import { MatchExperiencesCatalogScreen } from 'src/pages/MatchExperiencesCatalogScreen';
import { Layout } from '@/layout/Layout';
import { ROUTES } from '@/constants/routes.const';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path={ROUTES.MATCH_EXPERIENCE}>
                    <Route path=":id" element={<MatchExperienceDetailsScreen />}></Route>
                </Route>

                <Route path={ROUTES.MY_EXPERIENCES} element={<MatchExperiencesCatalogScreen mode="my" />} />
                <Route path="/" element={<MatchExperiencesCatalogScreen mode="all" />} />
            </Route>
        </Routes>
    );
};
