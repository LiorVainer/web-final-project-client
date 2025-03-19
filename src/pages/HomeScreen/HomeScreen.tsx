import { ShareMatchExperienceModal } from '@components/ShareMatchExperienceModal';
import classes from './home-screen.module.scss';
import { PlusOutlined } from '@ant-design/icons';
import { FaFutbol } from 'react-icons/fa';
import { useQueryService } from '@api/hooks/service.query.ts';
import { useState } from 'react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { useAuth } from '../../context/AuthContext';

export interface HomeScreenProps {}

export const HomeScreen = ({}: HomeScreenProps) => {
    const { logout } = useAuth();
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

    if (matchExperiencesError) {
        console.error('Error', matchExperiencesError);
        return <div>Error has occurred</div>;
    }

    return (
        <div>
            <h1>Home Screen</h1>
            {matchExperiences?.length ? (
                matchExperiences.map((matchExperience) => (
                    <div key={matchExperience._id}>{JSON.stringify(matchExperience)}</div>
                ))
            ) : (
                <div>No matchExperiences found.</div>
            )}
            <button onClick={logout} className={classes.button}>
                logout
            </button>
            <button className={classes.floatingButton} onClick={() => setIsModalOpen(true)}>
                <FaFutbol className={classes.icon} />
                <div className={classes.plusIcon}>
                    <PlusOutlined />
                </div>
            </button>
            {isModalOpen && (
                <ShareMatchExperienceModal
                    onClose={() => {
                        setIsModalOpen(false);
                        void refetch();
                    }}
                />
            )}
        </div>
    );
};
