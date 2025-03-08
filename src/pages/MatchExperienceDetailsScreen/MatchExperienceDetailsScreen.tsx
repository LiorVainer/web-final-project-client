import { useParams } from 'react-router';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import classes from './match-experience-details-screen.module.scss';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@components/Screen';
import { LiveChatModal } from '@components/LiveChatModal';
import { Spin } from 'antd';
import { publicRoute } from '@/constants/soccer.const.ts';
import moment from 'moment';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { MatchDetails } from '@components/MatchDetails';
import { UserInfo } from '@components/UserInfo';
import { CommentsSection } from '@components/CommentsSection';
import { MatchExperienceActions } from '@components/MatchExperienceActions';
import { LiveChatsSection } from '@components/LiveChatsSection';

export interface MatchExperienceDetailsScreenProps {}

export const MatchExperienceDetailsScreen = (_props: MatchExperienceDetailsScreenProps) => {
    const { id: matchExperienceId } = useParams();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<{ visitorId: string } | null>(null);

    if (!matchExperienceId) return null;

    // TODO: Get current user id from auth context
    // const currentUserId = '67cc3e3edc7cc58c42357e07'; // visitor
    const currentUserId = '67c84091c494f0388a69261d'; // creator

    const {
        data: matchExperience,
        isLoading,
        error,
    } = useQuery({
        queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId],
        queryFn: () => MatchExperienceService.getMatchExperienceById(matchExperienceId),
    });

    const isCreator = useMemo(() => matchExperience?.createdBy._id === currentUserId, [matchExperience, currentUserId]);

    const openChat = (visitorId: string) => {
        setSelectedChat({ visitorId });
        setIsChatOpen(true);
    };

    if (isLoading) {
        return (
            <Screen className={classes.loadingContainer}>
                <Spin className={classes.spinner} size={'large'} />
                <h4>Loading match experience...</h4>
            </Screen>
        );
    }

    if (error || !matchExperience) {
        return (
            <Screen>
                <p>Error loading match experience</p>
            </Screen>
        );
    }

    return (
        <Screen className={classes.container}>
            <div className={classes.card}>
                <div className={classes.content}>
                    {matchExperience.picture && (
                        <img
                            src={`${publicRoute}${matchExperience.picture}`}
                            alt={matchExperience.title}
                            className={classes.image}
                        />
                    )}
                    <div className={classes.header}>
                        <div className={classes.headerLeft}>
                            <MatchDetails matchExperience={matchExperience} />
                            {isCreator && (
                                <MatchExperienceActions
                                    like={{ likes: matchExperience.likes, disabled: isCreator }}
                                    liveChat={{
                                        isOpen: isChatOpen,
                                        onClick: () => openChat(currentUserId),
                                    }}
                                />
                            )}
                        </div>
                        <div className={classes.headerRight}>
                            <div className={classes.experienceContent}>
                                <div className={classes.topRow}>
                                    <p className={classes.title}>{matchExperience.title}</p>
                                    <p className={classes.contentTime}>
                                        posted {moment(matchExperience.createdAt).fromNow()}
                                    </p>
                                </div>
                                <p className={classes.description}>{matchExperience.description}</p>
                            </div>
                            <UserInfo user={matchExperience.createdBy} />
                        </div>
                    </div>
                </div>

                {isChatOpen && selectedChat && (
                    <LiveChatModal
                        onClose={() => setIsChatOpen(false)}
                        matchExperienceId={matchExperienceId}
                        creatorId={matchExperience.createdBy._id}
                        loggedInUserId={currentUserId}
                        visitorId={selectedChat.visitorId}
                    />
                )}
            </div>

            <CommentsSection matchExperienceId={matchExperienceId} loggedInUserId={currentUserId} />

            {isCreator && <LiveChatsSection matchExperienceId={matchExperienceId} onChatClick={openChat} />}
        </Screen>
    );
};
