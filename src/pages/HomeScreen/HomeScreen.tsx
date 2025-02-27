import CreateRecommendationModal from '@/components/CreateRecommendationModal';
import classes from './home-screen.module.scss';
import { useQueryService } from '@api/hooks/service.query.ts';
import { UsersService } from '@api/services/users.service.ts';
import { Button } from 'antd';
import { useState } from 'react';
import { RecommendationService } from '@/api/services/recommendation.service';

export interface HomeScreenProps {}

export const HomeScreen = ({}: HomeScreenProps) => {
    const { data, error, isPending } = useQueryService({ service: UsersService, method: 'getUsers' });
    const {
        data: recommendations,
        error: recommendationsError,
        isPending: recommendationsIsPending,
        refetch,
    } = useQueryService({
        service: RecommendationService,
        method: 'getAllRecommendation',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (error || recommendationsError) {
        console.error('Error', error);
        return <div>Error has occurred</div>;
    }

    if (!data || isPending || recommendationsIsPending) {
        return <Button>Loading...</Button>;
    }

    return (
        <div>
            <h1>Home Screen</h1>
            {data.map((user) => (
                <div>{user.email}</div>
            ))}
            {recommendations?.length ? (
                recommendations.map((recommendation) => (
                    <div key={recommendation._id}>{JSON.stringify(recommendation)}</div>
                ))
            ) : (
                <div>No recommendations found.</div>
            )}
            <button className={classes.button}>Press Me</button>
            <button className={classes.button} onClick={() => setIsModalOpen(true)}>
                Create Recommendation
            </button>

            <CreateRecommendationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    refetch(); // Trigger refetch of recommendations when modal closes
                }}
            />
        </div>
    );
};
