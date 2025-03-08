import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { MatchExperience } from '@/models/match-experience.model';
import { Input, Spin } from 'antd';
import classes from './comments-section.module.scss';
import moment from 'moment';
import { useState } from 'react';
import { MatchExperienceService } from '@api/services/match-experience.service.ts';
import clsx from 'clsx';
import { Loader, Send } from 'lucide-react';

// TODO - remove prop drilling of loggedInUserId and use auth context instead
export interface CommentsSectionProps {
    matchExperienceId: string;
    loggedInUserId: string;
}

export const CommentsSection = ({ matchExperienceId, loggedInUserId }: CommentsSectionProps) => {
    const {
        data: matchExperience,
        isLoading,
        error,
    } = useQuery<MatchExperience>({
        queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId],
    });

    if (isLoading) {
        return <Spin />;
    }

    if (error || !matchExperience) {
        return <div>Error loading comments</div>;
    }

    // TODO: replace with user actual img from server

    return (
        <div className={classes.commentsSection}>
            <h3 className={classes.commentsTitle}>Comments</h3>

            <div className={classes.commentsList}>
                {matchExperience.comments.map((comment) => (
                    <div key={comment._id} className={classes.commentItem}>
                        <div className={classes.commentAvatar} />
                        <div className={classes.commentContent}>
                            <div className={classes.commentHeader}>
                                <p className={classes.commentUser}>{comment.user.username}</p>
                                <time>{moment(comment.createdAt).fromNow()}</time>
                            </div>

                            <div className={classes.commentFooter}>
                                <p>{comment.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <NewCommentInput matchExperienceId={matchExperience._id} loggedInUserId={loggedInUserId} />
        </div>
    );
};

// TODO - remove prop drilling of loggedInUserId and use auth context instead
interface NewCommentInputProps {
    matchExperienceId: string;
    loggedInUserId: string;
}

const NewCommentInput = ({ matchExperienceId, loggedInUserId }: NewCommentInputProps) => {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const commentMutation = useMutation({
        mutationFn: (comment: string) => MatchExperienceService.addComment(matchExperienceId, comment, loggedInUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId] });
            setNewComment('');
        },
    });

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        commentMutation.mutate(newComment);
    };

    return (
        <div onSubmit={handleAddComment} className={classes.commentForm}>
            <div className={classes.commentAvatar} />
            <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onPressEnter={handleAddComment}
                placeholder="Add a comment..."
                disabled={commentMutation.isPending}
            />
            <button
                className={clsx(classes.sendCommentButton, {
                    [classes.loading]: commentMutation.isPending,
                })}
                disabled={commentMutation.isPending}
                onClick={handleAddComment}
            >
                {commentMutation.isPending ? <Loader size={16} className={classes.spinner} /> : <Send size={16} />}
            </button>
        </div>
    );
};
