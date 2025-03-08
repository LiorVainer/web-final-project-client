import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router';
import clsx from 'clsx';
import { Heart, MessageCircle } from 'lucide-react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import classes from './match-experience-actions.module.scss';

interface MatchExperienceActionsProps {
    like: {
        likes: string[];
        disabled: boolean;
    };
    liveChat: {
        isOpen: boolean;
        onClick: () => void;
    };
}

export const MatchExperienceActions = ({ liveChat, like: { likes, disabled } }: MatchExperienceActionsProps) => {
    const queryClient = useQueryClient();
    const { id: matchExperienceId } = useParams();

    if (!matchExperienceId) return null;

    const currentUserId = '67cb182bdc7cc58c42357dfe';
    const { mutate: likeMutate, isPending: isLikePending } = useMutation({
        mutationFn: () => MatchExperienceService.likeMatchExperience(matchExperienceId, currentUserId),
        onSuccess: () => {
            console.log('Liked match experience');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId] });
        },
    });

    const { mutate: unlikeMutate, isPending: isUnlikePending } = useMutation({
        mutationFn: () => MatchExperienceService.unlikeMatchExperience(matchExperienceId, currentUserId),
        onSuccess: () => {
            console.log('Unliked match experience');
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId] });
        },
    });

    const onLikePress = () => {
        likeMutate();
    };

    const onUnlikePress = () => {
        unlikeMutate();
    };

    const isLiked = useMemo(() => likes.includes(currentUserId), [likes]);

    const isLikedDisabled = useMemo(() => {
        if (disabled) {
            return true;
        }
        return isLiked ? isLikePending : isUnlikePending;
    }, [disabled]);

    return (
        <div className={classes.actions}>
            <button
                className={clsx(
                    classes.likeButton,
                    {
                        [classes.disabled]: isLikePending,
                    },
                    isLiked ? classes.liked : classes.unliked
                )}
                onClick={isLiked ? onUnlikePress : onLikePress}
                disabled={isLikedDisabled}
            >
                <Heart size={15} />
                <span>{likes.length}</span>
            </button>

            <button
                className={clsx(classes.liveChatButton, {
                    [classes.active]: liveChat.isOpen,
                })}
                onClick={liveChat.onClick}
            >
                <MessageCircle size={15} />
                <span>Live Chat</span>
            </button>
        </div>
    );
};
