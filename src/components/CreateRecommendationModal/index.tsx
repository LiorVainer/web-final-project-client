import { useState, useCallback } from 'react';
import { Modal, Form, Input, Button, AutoComplete, Spin } from 'antd';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import styles from './CreateRecommendationModal.module.scss';
import { MatchService } from '@/api/services/match.service';
import { RecommendationService } from '@/api/services/recommendation.service';

// Recommendation Schema with Yup validation
const RecommendationSchema = Yup.object().shape({
    matchId: Yup.string().required('Match is required'),
    title: Yup.string().min(3, 'Title is too short').required('Title is required'),
    description: Yup.string().min(10, 'Description is too short').required('Description is required'),
    pictureId: Yup.string().optional(),
});

type CreateRecommendationModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type CreateRecommendationModalValues = Yup.InferType<typeof RecommendationSchema>;

const CreateRecommendationModal = ({ isOpen, onClose }: CreateRecommendationModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: matches = [], isFetching } = useQuery({
        queryKey: ['matches', searchTerm],
        queryFn: () => MatchService.getAllMatches({ homeTeam: searchTerm, awayTeam: searchTerm }),
        enabled: !!searchTerm,
    });

    const {
        control, // Use control here instead of register for controlled components
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreateRecommendationModalValues>({
        resolver: yupResolver(RecommendationSchema),
    });

    const onSubmit = async (values: CreateRecommendationModalValues) => {
        console.log('Submitting recommendation:', values);
        await RecommendationService.createRecommendation({ ...values, createdBy: '123412341234123412341234' });
        onClose();
    };

    // Debounced search function to optimize API calls
    const debouncedSearch = useCallback(
        debounce((searchText: string) => {
            setSearchTerm(searchText);
        }, 500),
        []
    );

    return (
        <Modal title="Create Recommendation" open={isOpen} onCancel={onClose} footer={null} className={styles.modal}>
            <Form layout="vertical" className={styles.form} onFinish={handleSubmit(onSubmit)}>
                <Form.Item label="Match" validateStatus={errors.matchId ? 'error' : ''} help={errors.matchId?.message}>
                    <AutoComplete
                        options={matches.map((match) => ({
                            value: match._id,
                            label: `${match.homeTeam} vs ${match.awayTeam} - ${new Date(match.date).toLocaleDateString()}`,
                        }))}
                        onChange={(value) => {
                            if (!value) {
                                // If the input is cleared, set matchId to an empty string
                                setValue('matchId', '');
                            }
                        }}
                        onSearch={debouncedSearch}
                        onSelect={(value) => setValue('matchId', value)}
                        placeholder="Search for a match..."
                        notFoundContent={isFetching ? <Spin size="small" /> : 'No matches found'}
                    />
                </Form.Item>

                {/* Controlled Input for Title using Controller */}
                <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title?.message}>
                    <Controller
                        name="title"
                        control={control} // Use control to bind to react-hook-form
                        render={({ field }) => <Input {...field} placeholder="Enter recommendation title" />}
                    />
                </Form.Item>

                {/* Controlled TextArea for Description using Controller */}
                <Form.Item
                    label="Description"
                    validateStatus={errors.description ? 'error' : ''}
                    help={errors.description?.message}
                >
                    <Controller
                        name="description"
                        control={control} // Use control to bind to react-hook-form
                        render={({ field }) => <Input.TextArea {...field} placeholder="Enter description" />}
                    />
                </Form.Item>

                <Button type="primary" htmlType="submit" className={styles.submitBtn}>
                    Submit
                </Button>
            </Form>
        </Modal>
    );
};

export default CreateRecommendationModal;
