import { useState } from 'react';
import { Modal, Form, Input, Button, AutoComplete, Upload, message, DatePicker, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import styles from './CreateRecommendationModal.module.scss';
import { RecommendationService } from '@/api/services/recommendation.service';
import { MatchService } from '@/api/services/match.service';
import { SoccerService } from '@/api/services/soccer.service';
import { FileService } from '@/api/services/file.service';
import { Country, League, Team, Venue } from '@/models/match.model';
import { ROUTES } from '@/constants/routes.const';

const RecommendationSchema = Yup.object().shape({
    title: Yup.string().min(3, 'Title is too short').required('Title is required'),
    description: Yup.string().min(10, 'Description is too short').required('Description is required'),
    picture: Yup.string().optional(),
    country: Yup.string().required('Country is required'),
    stadium: Yup.string().required('Stadium is required'),
    league: Yup.string().required('League is required'),
    homeTeam: Yup.string().required('Home Team is required'),
    awayTeam: Yup.string().required('Away Team is required'),
    date: Yup.date().required('Match date is required'),
});

type CreateRecommendationModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type CreateRecommendationModalValues = Yup.InferType<typeof RecommendationSchema>;

const CreateRecommendationModal = ({ isOpen, onClose }: CreateRecommendationModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedLeague, setSelectedLeague] = useState<number>();
    const [uploading, setUploading] = useState(false);

    const { mutate: uploadImage } = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await FileService.handleUpload(formData);
            return data;
        },
        onMutate: () => {
            setUploading(true);
        },
        onSuccess: (data) => {
            if (data.url) {
                message.success('Image uploaded successfully');
                const filePath = data.url.split('/public/')[1];
                setImageUrl(filePath);
                setValue('picture', filePath);
            } else {
                message.error('Upload failed');
            }
        },
        onError: () => {
            message.error('Upload error');
        },
        onSettled: () => {
            setUploading(false);
        },
    });

    const { data: countries = [] } = useQuery<Country[]>({
        queryKey: ['countries'],
        queryFn: async () => {
            return SoccerService.getCountries();
        },
        enabled: !!isOpen,
    });

    const { data: leagues = [] } = useQuery<{ league: League; country: Country }[]>({
        queryKey: ['leagues', selectedCountry],
        queryFn: async () => {
            if (!selectedCountry) return [];
            return SoccerService.getLeagues(selectedCountry);
        },
        enabled: !!selectedCountry,
    });

    const { data: stadiums = [] } = useQuery<Venue[]>({
        queryKey: ['stadiums', selectedCountry],
        queryFn: async () => {
            if (!selectedCountry) return [];
            return SoccerService.getVenues(selectedCountry);
        },
        enabled: !!selectedCountry,
    });

    const { data: teams = [] } = useQuery<{ team: Team; venue: Venue }[]>({
        queryKey: ['teams', selectedLeague],
        queryFn: async () => {
            if (!selectedLeague) return [];
            return SoccerService.getTeams(selectedLeague);
        },
        enabled: !!selectedLeague,
    });

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateRecommendationModalValues>({
        resolver: yupResolver(RecommendationSchema),
    });

    const onSubmit = async (values: CreateRecommendationModalValues) => {
        const { title, description, country, date, stadium, league, homeTeam, awayTeam } = values;
        try {
            const match = await MatchService.createMatch({
                country,
                stadium,
                league,
                date,
                homeTeam,
                awayTeam,
            });

            if (match) {
                await RecommendationService.createRecommendation({
                    title,
                    description,
                    matchId: match._id,
                    picture: imageUrl,
                    createdBy: '123412341234123412341234',
                });

                message.success('Recommendation created successfully');
            } else {
                message.error('Failed to create match');
                return;
            }

            reset();
            setImageUrl('');
            setSelectedCountry('');
            setSelectedLeague(undefined);
            onClose();
        } catch (error) {
            message.error('An error occurred while submitting the recommendation.');
        }
    };

    return (
        <Modal
            title="Create Recommendation"
            open={isOpen}
            onCancel={() => {
                reset();
                setImageUrl('');
                setSelectedCountry('');
                setSelectedLeague(undefined);
                onClose();
            }}
            footer={null}
            className={styles.modal}
        >
            <Form layout="vertical" className={styles.form} onFinish={handleSubmit(onSubmit)}>
                <Form.Item
                    label="Country"
                    validateStatus={errors.country ? 'error' : ''}
                    help={errors.country?.message}
                >
                    <AutoComplete
                        options={countries.map((option) => ({ value: option.name }))}
                        onSelect={(value) => {
                            setSelectedCountry(value);
                            setValue('country', value);
                            setValue('league', '');
                            setValue('stadium', '');
                            setValue('homeTeam', '');
                            setValue('awayTeam', '');
                            setSelectedLeague(undefined);
                        }}
                        placeholder="Select a country"
                    />
                </Form.Item>

                <Form.Item label="League" validateStatus={errors.league ? 'error' : ''} help={errors.league?.message}>
                    <AutoComplete
                        options={leagues.map((option) => ({ value: option.league.name, id: option.league.id }))}
                        onSelect={(value, option) => {
                            setSelectedLeague(option.id);
                            setValue('league', value);
                            setValue('homeTeam', '');
                            setValue('awayTeam', '');
                        }}
                        placeholder="Select a league"
                        disabled={!selectedCountry}
                    />
                </Form.Item>

                <Form.Item
                    label="Stadium"
                    validateStatus={errors.stadium ? 'error' : ''}
                    help={errors.stadium?.message}
                >
                    <AutoComplete
                        options={stadiums.map((option) => ({ value: option.name }))}
                        onSelect={(value) => setValue('stadium', value)}
                        placeholder="Select a stadium"
                        disabled={!selectedCountry}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Home Team"
                            validateStatus={errors.homeTeam ? 'error' : ''}
                            help={errors.homeTeam?.message}
                        >
                            <AutoComplete
                                options={teams.map((option) => ({ value: option.team.name }))}
                                onSelect={(value) => setValue('homeTeam', value)}
                                placeholder="Select home team"
                                disabled={!selectedLeague}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Away Team"
                            validateStatus={errors.awayTeam ? 'error' : ''}
                            help={errors.awayTeam?.message}
                        >
                            <AutoComplete
                                options={teams.map((t) => ({ value: t.team.name }))}
                                onSelect={(value) => setValue('awayTeam', value)}
                                placeholder="Select away team"
                                disabled={!selectedLeague}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Match Date">
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => <DatePicker {...field} style={{ width: '100%' }} />}
                    />
                </Form.Item>

                <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title?.message}>
                    <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item
                    label="Description"
                    validateStatus={errors.description ? 'error' : ''}
                    help={errors.description?.message}
                >
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => <Input.TextArea {...field} />}
                    />
                </Form.Item>
                <Form.Item label="Upload Image">
                    <Upload
                        beforeUpload={(file) => {
                            uploadImage(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>
                            Upload Image
                        </Button>
                    </Upload>

                    {imageUrl && (
                        <div className="image-preview-container">
                            <img
                                src={`${ROUTES.publicRoute}${imageUrl}`}
                                alt="Uploaded Preview"
                                className="image-preview"
                            />
                        </div>
                    )}
                </Form.Item>

                <Button type="primary" htmlType="submit" className={styles.submitBtn}>
                    Submit
                </Button>
            </Form>
        </Modal>
    );
};

export default CreateRecommendationModal;
