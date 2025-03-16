import ShareMatchExperienceModal from '@/components/ShareMatchExperienceModal';
import classes from './home-screen.module.scss';
import { PlusOutlined } from '@ant-design/icons';
import { FaFutbol } from 'react-icons/fa';
import { Button, Select } from "antd";

import { useState } from 'react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { MatchDetails } from '@components/MatchDetails';
import { Screen } from '@components/Screen';
import { useQuery } from '@tanstack/react-query';
import { getPictureFullUrl } from '@/utils/picture.utils.ts';
import moment from 'moment';
import { Heart, MessageCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from "react-router-dom"; // ✅ Import for navigation

export interface HomeScreenProps {
    isFromHomeScreen: boolean;
}

const currentUserId = '67d592743f1f3c317f54c7de'; // creator

export const HomeScreen = ({isFromHomeScreen}: HomeScreenProps) => {
    const [page, setPage] = useState(1); // Track current page
    const [sortBy, setSortBy] = useState("date"); // Default sort

    const navigate = useNavigate(); // ✅ Hook for navigation


    const limit = 5; // Number of items per page

    // const { data, error, isPending } = useQueryService({ service: UsersService, method: 'getUsers' });

    const { 
        data: matchExperiencesData,
        error: matchExperiencesError,
        isPending: matchExperiencesIsPending, 
        refetch 
    } = useQuery({
        queryKey: isFromHomeScreen ? ["matchExperiences", page, sortBy] : ["userMatchExperiences", page, sortBy, currentUserId],
        queryFn: () => 
            isFromHomeScreen 
                ? MatchExperienceService.getAllMatchExperience(page, limit, sortBy) 
                : MatchExperienceService.getAllMatchExperiencesByUserId(currentUserId, page, limit, sortBy),
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

            {/* ✅ Sorting Dropdown */}
            <Select
                value={sortBy}
                onChange={(value) => {
                    setSortBy(value);
                    setPage(1); // Reset to first page on sorting change
                }}
                className={classes.sortDropdown}
            >
                <Select.Option value="date">Sort by Date</Select.Option>
                <Select.Option value="likes">Sort by Likes</Select.Option>
            </Select>

            <div className={classes.matchList}>
                {matchExperiences?.length ? (
                    matchExperiences.map((matchExperience) => (
                            <div className={classes.matchCard} key={matchExperience._id} 
                            onClick={() => navigate(`${ROUTES.MATCH_EXPERIENCE}/${matchExperience._id}`)}>
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
