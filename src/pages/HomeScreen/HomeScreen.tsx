import ShareMatchExperienceModal from '@/components/ShareMatchExperienceModal';
import classes from './home-screen.module.scss';
import { PlusOutlined } from '@ant-design/icons';
import { FaFutbol } from 'react-icons/fa';
import { useQueryService } from '@api/hooks/service.query.ts';
import { UsersService } from '@api/services/users.service.ts';
import { Button } from 'antd';
import { useState } from 'react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { MatchDetails } from '@components/MatchDetails';
import { MatchExperience } from '@/models/match-experience.model.ts';
import { Screen } from '@components/Screen';
import { useQuery } from '@tanstack/react-query';

export interface HomeScreenProps {}

export const HomeScreen = ({}: HomeScreenProps) => {
    const [page, setPage] = useState(1); // Track current page
    const limit = 5; // Number of items per page

    // const { data, error, isPending } = useQueryService({ service: UsersService, method: 'getUsers' });

    const { data: matchExperiencesData,
        error: matchExperiencesError,
        isPending: matchExperiencesIsPending, 
        refetch } = useQuery({
        queryKey: ["matchExperiences", page], // Cache per page
        queryFn: () => MatchExperienceService.getAllMatchExperience(page, limit), // Fetch function
    });
    
    console.log(matchExperiencesData);
    

    const totalPages = matchExperiencesData?.totalPages || 1;

    const matchExperiences = matchExperiencesData?.experiences || [];

    const [isModalOpen, setIsModalOpen] = useState(false);

    if (matchExperiencesError) {
        console.error('Error', matchExperiencesError);
        return <div>Error has occurred</div>;
    }

    if (!matchExperiencesData || matchExperiencesIsPending) {
        return <Button>Loading...</Button>;
    }

    return (
        <Screen className={classes.container}>
        <div>
            <h1>Home Screen</h1>
            <div className={classes.matchList}>
                {matchExperiences?.length ? (
                    matchExperiences.map((matchExperience) => (
                            <div className={classes.matchCard} key={matchExperience._id}>
                                <MatchDetails matchExperience={matchExperience as MatchExperience} />
                            </div>
                    ))
                ) : (
                    <div>No matchExperiences found.</div>
                )}
            </div>
            <div className={classes.pagination}>
                <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <span> Page {page} of {totalPages} </span>
                <Button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>

            <button className={classes.floatingButton} onClick={() => setIsModalOpen(true)}>
                <FaFutbol className={classes.icon} />
                <div className={classes.plusIcon}>
                    <PlusOutlined />
                </div>
            </button>
            {isModalOpen && (
                <ShareMatchExperienceModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        refetch();
                    }}
                />
            )}
        </div>
        </Screen>
    );
};
