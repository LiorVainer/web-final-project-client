import { useParams } from 'react-router';
import { Calendar, Heart, Loader, MapPin, MessageCircle, Send, Trophy, User } from 'lucide-react';
import { RecommendationService } from '@api/services/recommendation.service.ts';
import classes from './recommendation-details-screen.module.scss';
import { Recommendation } from '@/models/recommendation.model.ts';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Screen } from '@components/Screen';
import { LiveChatModal } from '@components/LiveChatModal';
import { Input, Spin } from 'antd';

export interface RecommendationDetailsScreenProps {}

const recommendationMock: Recommendation = {
    _id: '1',
    match: {
        _id: '1',
        homeTeam: 'Barcelona',
        awayTeam: 'Liverpool',
        date: new Date('2024-03-01'),
        country: 'Spain',
        createdAt: new Date('2024-03-01'),
        competition: 'Champions League',
        stadium: 'Santiago Bernabeu',
    },
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
    pictureId: '1',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
};

export const RecommendationDetailsScreen = (_props: RecommendationDetailsScreenProps) => {
    const { id: recommendationId } = useParams();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();

    if (!recommendationId) return null;

    const {
        data: recommendation,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['recommendation', recommendationId],
        queryFn: () => RecommendationService.getRecommendationById(recommendationId),
        initialData: recommendationMock,
    });

    const likeMutation = useMutation({
        mutationFn: () => RecommendationService.likeRecommendation(recommendationId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recommendation', recommendationId] }),
    });

    const commentMutation = useMutation({
        mutationFn: (comment: string) => RecommendationService.addComment(recommendationId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recommendation', recommendationId] });
            setNewComment('');
        },
    });

    if (isLoading) {
        return (
            <Screen className={classes.loadingContainer}>
                <Spin className={classes.spinner} size={'large'} />
                <h4>Loading recommendation...</h4>
            </Screen>
        );
    }

    if (error || !recommendation) {
        return (
            <Screen>
                <p>Error loading recommendation</p>
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
                        {recommendation.pictureId && (
                            <img
                                src={`https://picsum.photos/1200/800`}
                                alt={recommendation.title}
                                className={classes.image}
                            />
                        )}
                        <div className={classes.right}>
                            <div className={classes.top}>
                                <p className={classes.title}>{recommendation.title}</p>
                                <div className={classes.actions}>
                                    <button
                                        className={clsx(classes.likeButton, {
                                            [classes.disabled]: likeMutation.isPending,
                                        })}
                                        onClick={handleLike}
                                        disabled={likeMutation.isPending}
                                    >
                                        <Heart size={15} />
                                        <span>{recommendation.likes.length}</span>
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
                            <p className={classes.description}>{recommendation.description}</p>
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
                                {recommendation.comments.map((comment) => (
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
                                    <span>{recommendation.match.homeTeam}</span>
                                    <span>vs</span>
                                    <span>{recommendation.match.awayTeam}</span>
                                </div>
                                <div className={classes.matchMeta}>
                                    <div>
                                        <Trophy size={16} />
                                        <span>{recommendation.match.competition}</span>
                                    </div>
                                    <div>
                                        <MapPin size={16} />
                                        <span>
                                            {recommendation.match.stadium}, {recommendation.match.country}
                                        </span>
                                    </div>
                                    <div>
                                        <Calendar size={16} />
                                        <span>{new Date(recommendation.match.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={classes.userInfo}>
                                <div className={classes.user}>
                                    {recommendation.createdBy.pictureId && (
                                        <img
                                            src={`https://picsum.photos/200/200?random=${recommendation.createdBy.pictureId}`}
                                            alt={recommendation.createdBy.username}
                                            className={classes.userAvatar}
                                        />
                                    )}
                                    <div className={classes.userMeta}>
                                        <span className={classes.username}>
                                            <User size={16} />
                                            {recommendation.createdBy.username}
                                        </span>
                                        <span className={classes.userDate}>
                                            Member since{' '}
                                            {new Date(recommendation.createdBy.createdAt).toLocaleDateString()}
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
