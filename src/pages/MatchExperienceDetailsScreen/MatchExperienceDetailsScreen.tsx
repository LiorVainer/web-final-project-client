import { useParams } from 'react-router';
import { Calendar, Heart, Loader, MapPin, MessageCircle, Send, Trophy, User } from 'lucide-react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import classes from './matchExperience-details-screen.module.scss';
import { MatchExperience } from '@/models/match-experience.model';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Screen } from '@components/Screen';
import { LiveChatModal } from '@components/LiveChatModal';
import { Input, Spin } from 'antd';

export interface MatchExperienceDetailsScreenProps {}

const matchExperienceMock: MatchExperience = {
    _id: '1',
    homeTeam: 'Barcelona',
    awayTeam: 'Liverpool',
    matchDate: new Date('2024-03-01'),
    country: 'Spain',
    league: 'Champions League',
    stadium: 'Santiago Bernabeu',
    createdBy: {
        _id: 'user1',
        username: 'user1',
        pictureId: '1',
        email: 'sd',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
    },
    title: 'Champions League Final Experience',
    description:
        'Experience the ultimate football event with premium seating and VIP access to the Champions League final.',
    likes: ['user1', 'user2'],
    comments: [
        {
            _id: 'c1',
            postId: '1',
            userId: 'user1',
            content: 'This looks amazing! Cant wait!',
            createdAt: new Date('2024-03-10'),
        },
    ],
    picture: '1',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
};

export const MatchExperienceDetailsScreen = (_props: MatchExperienceDetailsScreenProps) => {
    const { id: matchExperienceId } = useParams();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();

    if (!matchExperienceId) return null;

    const {
        data: matchExperience,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['matchExperience', matchExperienceId],
        queryFn: () => MatchExperienceService.getMatchExperienceById(matchExperienceId),
        initialData: matchExperienceMock,
    });

    const likeMutation = useMutation({
        mutationFn: () => MatchExperienceService.likeMatchExperience(matchExperienceId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matchExperience', matchExperienceId] }),
    });

    const commentMutation = useMutation({
        mutationFn: (comment: string) => MatchExperienceService.addComment(matchExperienceId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matchExperience', matchExperienceId] });
            setNewComment('');
        },
    });

    if (isLoading) {
        return (
            <Screen className={classes.loadingContainer}>
                <Spin className={classes.spinner} size={'large'} />
                <h4>Loading matchExperience...</h4>
            </Screen>
        );
    }

    if (error || !matchExperience) {
        return (
            <Screen>
                <p>Error loading matchExperience</p>
            </Screen>
        );
    }

    const handleLike = () => {
        likeMutation.mutate();
    };

    const handleAddComment = (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        commentMutation.mutate(newComment);
    };

    return (
        <Screen className={classes.container}>
            <div className={classes.card}>
                <div className={classes.content}>
                    <div className={classes.header}>
                        {matchExperience.picture && (
                            <img
                                src={`https://picsum.photos/1200/800`}
                                alt={matchExperience.title}
                                className={classes.image}
                            />
                        )}
                        <div className={classes.right}>
                            <div className={classes.top}>
                                <p className={classes.title}>{matchExperience.title}</p>
                                <div className={classes.actions}>
                                    <button
                                        className={clsx(classes.likeButton, {
                                            [classes.disabled]: likeMutation.isPending,
                                        })}
                                        onClick={handleLike}
                                        disabled={likeMutation.isPending}
                                    >
                                        <Heart size={15} />
                                        <span>{matchExperience.likes.length}</span>
                                    </button>

                                    <button
                                        className={clsx(classes.liveChatButton, {
                                            [classes.active]: isChatOpen,
                                        })}
                                        onClick={() => setIsChatOpen(true)}
                                    >
                                        <MessageCircle size={15} />
                                        <span>Live Chat</span>
                                    </button>
                                </div>
                            </div>
                            <p className={classes.description}>{matchExperience.description}</p>
                        </div>
                    </div>
                    <div className={classes.footer}>
                        <div className={classes.commentsSection}>
                            <h3 className={classes.commentsTitle}>Comments</h3>
                            <div onSubmit={handleAddComment} className={classes.commentForm}>
                                <div className={classes.commentAvatar} />
                                <Input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    disabled={commentMutation.isPending}
                                />
                                <button
                                    className={clsx(classes.sendCommentButton, {
                                        [classes.loading]: commentMutation.isPending,
                                    })}
                                    disabled={commentMutation.isPending}
                                >
                                    {commentMutation.isPending ? (
                                        <Loader size={16} className={classes.spinner} />
                                    ) : (
                                        <Send onClick={handleAddComment} size={16} />
                                    )}
                                </button>
                            </div>

                            <div className={classes.commentsList}>
                                {matchExperience.comments.map((comment) => (
                                    <div key={comment._id} className={classes.commentItem}>
                                        <div className={classes.commentAvatar} />
                                        <div className={classes.commentContent}>
                                            <p>{comment.content}</p>
                                        </div>
                                        <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={classes.left}>
                            <div className={classes.matchDetails}>
                                <div className={classes.teams}>
                                    <span>{matchExperience.homeTeam}</span>
                                    <span>vs</span>
                                    <span>{matchExperience.awayTeam}</span>
                                </div>
                                <div className={classes.matchMeta}>
                                    <div>
                                        <Trophy size={16} />
                                        <span>{matchExperience.league}</span>
                                    </div>
                                    <div>
                                        <MapPin size={16} />
                                        <span>
                                            {matchExperience.stadium}, {matchExperience.country}
                                        </span>
                                    </div>
                                    <div>
                                        <Calendar size={16} />
                                        <span>{new Date(matchExperience.matchDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={classes.userInfo}>
                                <div className={classes.user}>
                                    {matchExperience.createdBy.pictureId && (
                                        <img
                                            src={`https://picsum.photos/200/200?random=${matchExperience.createdBy.pictureId}`}
                                            alt={matchExperience.createdBy.username}
                                            className={classes.userAvatar}
                                        />
                                    )}
                                    <div className={classes.userMeta}>
                                        <span className={classes.username}>
                                            <User size={16} />
                                            {matchExperience.createdBy.username}
                                        </span>
                                        <span className={classes.userDate}>
                                            Member since{' '}
                                            {new Date(matchExperience.createdBy.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isChatOpen && <LiveChatModal onClose={() => setIsChatOpen(false)} messages={[]} />}
            </div>
        </Screen>
    );
};
