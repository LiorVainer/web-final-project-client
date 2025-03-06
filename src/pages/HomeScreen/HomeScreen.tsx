import CreateMatchExperienceModal from '@/components/CreateMatchExperienceModal';
import classes from './home-screen.module.scss';
import { useQueryService } from '@api/hooks/service.query.ts';
import { UsersService } from '@api/services/users.service.ts';
import { Button } from 'antd';
import { useState } from 'react';
import { MatchExperienceService } from '@/api/services/match-experience.service';

export interface HomeScreenProps {}

export const HomeScreen = ({}: HomeScreenProps) => {
    const { data, error, isPending } = useQueryService({ service: UsersService, method: 'getUsers' });
    const {
        data: matchExperiences,
        error: matchExperiencesError,
        isPending: matchExperiencesIsPending,
        refetch,
    } = useQueryService({
        service: MatchExperienceService,
        method: 'getAllMatchExperience',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (error || matchExperiencesError) {
        console.error('Error', error);
        return <div>Error has occurred</div>;
    }

    if (!data || isPending || matchExperiencesIsPending) {
        return <Button>Loading...</Button>;
    }

    return (
        <div>
            <h1>Home Screen</h1>
            {data.map((user) => (
                <div>{user.email}</div>
            ))}
            {matchExperiences?.length ? (
                matchExperiences.map((matchExperience) => (
                    <div key={matchExperience._id}>{JSON.stringify(matchExperience)}</div>
                ))
            ) : (
                <div>No matchExperiences found.</div>
            )}
            <button className={classes.button}>Press Me</button>
            <button className={classes.button} onClick={() => setIsModalOpen(true)}>
                Create MatchExperience
            </button>

            <CreateMatchExperienceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    refetch(); // Trigger refetch of matchExperiences when modal closes
                }}
            />
        </div>
    );
};
