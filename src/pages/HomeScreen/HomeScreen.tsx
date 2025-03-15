import ShareMatchExperienceModal from '@/components/ShareMatchExperienceModal';
import classes from './home-screen.module.scss';
import { PlusOutlined } from '@ant-design/icons';
import { FaFutbol } from 'react-icons/fa';
import { useQueryService } from '@api/hooks/service.query.ts';
import { UsersService } from '@api/services/users.service.ts';
import { Button } from 'antd';
import { useMemo, useState } from 'react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { MatchDetails } from '@components/MatchDetails';
import { MatchExperience } from '@/models/match-experience.model.ts';
import { Screen } from '@components/Screen';
import { useQuery } from '@tanstack/react-query';
import { getPictureFullUrl } from '@/utils/picture.utils.ts';
import { MatchExperienceActions } from '@/components/MatchExperienceActions';
import moment from 'moment';
import { Heart, MessageCircle } from 'lucide-react';

export interface HomeScreenProps {}

const currentUserId = '67d59deca4f31a06c566dbc2'; // creator

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
        return  <Screen className={classes.container}>
            <Button>Loading...</Button>;
        </Screen>   
    }

    return (
        <Screen className={classes.container}>
        <div>
            <h1>Home Screen</h1>
            <div className={classes.matchList}>
                {matchExperiences?.length ? (
                    matchExperiences.map((matchExperience) => (
                            <div className={classes.matchCard} key={matchExperience._id}>
                                <div>
                                    {matchExperience.picture && (
                                        <img
                                            src={getPictureFullUrl(matchExperience.picture)}
                                            alt={matchExperience.title}
                                            className={classes.image}
                                        />
                                    )}
                                </div>
                                <div className={classes.test}>
                                    <MatchDetails matchExperience={matchExperience} />
                                    <div className={classes.rightSide}>
                                        <p className={classes.contentTime}>
                                            posted {moment(matchExperience.createdAt).fromNow()}
                                        </p>
                                        <div className={classes.likes} >
                                            <div>
                                                {matchExperience.likes.length} likes 
                                            </div>
                                            <Heart size={15} />
                                        </div>
                                        <div  className={classes.comments} >
                                            <div>
                                                {matchExperience.comments.length} comments
                                            </div>
                                            <MessageCircle size={15} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                    ))
                ) : (
                    <div>No matchExperiences found.</div>
                )}

                <div className={classes.pagination}>
                <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={classes.pageButton}
                >
                    Previous
                </Button>
                <span> Page {page} of {totalPages} </span>
                <Button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={classes.pageButton}
                >
                    Next
                </Button>
                </div>
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
