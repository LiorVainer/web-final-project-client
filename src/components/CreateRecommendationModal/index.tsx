import { useState, useCallback } from 'react';
import { Modal, Form, Input, Button, AutoComplete, Upload, Spin, message, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import styles from './CreateRecommendationModal.module.scss';
import { RecommendationService } from '@/api/services/recommendation.service';
import { MatchService } from '@/api/services/match.service';

// Recommendation Schema with Yup validation
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

const API_KEY = 'e859464540085b15535c5ed431595955';

const CreateRecommendationModal = ({ isOpen, onClose }: CreateRecommendationModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedLeague, setSelectedLeague] = useState<number | undefined>();

    // Fetch countries
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await fetch(`https://v3.football.api-sports.io/countries`, {
                headers: { 'x-apisports-key': API_KEY },
            });
            const data = await res.json();
            return data.response;
        },
        enabled: !!isOpen,
    });

    // Fetch stadiums and leagues based on country
    const { data: leagues = [] } = useQuery({
        queryKey: ['leagues', selectedCountry],
        queryFn: async () => {
            if (!selectedCountry) return [];
            const res = await fetch(`https://v3.football.api-sports.io/leagues?country=${selectedCountry}`, {
                headers: { 'x-apisports-key': API_KEY },
            });
            const data = await res.json();
            return data.response;
        },
        enabled: !!selectedCountry,
    });

    const { data: stadiums = [] } = useQuery({
        queryKey: ['stadiums', selectedCountry],
        queryFn: async () => {
            if (!selectedCountry) return [];
            const res = await fetch(`https://v3.football.api-sports.io/venues?country=${selectedCountry}`, {
                headers: { 'x-apisports-key': API_KEY },
            });
            const data = await res.json();
            return data.response;
        },
        enabled: !!selectedCountry,
    });

    const { data: teams = [] } = useQuery({
        queryKey: ['teams', selectedLeague],
        queryFn: async () => {
            if (!selectedLeague) return [];
            const res = await fetch(`https://v3.football.api-sports.io/teams?league=${selectedLeague}&season=2023`, {
                headers: { 'x-apisports-key': API_KEY },
            });
            const data = await res.json();
            return data.response;
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
        console.log('Submitting recommendation:', values);
        const { title, description, country, date, stadium, league, homeTeam, awayTeam } = values;

        const match = await MatchService.createMatch({
            country,
            stadium,
            league,
            date,
            homeTeam,
            awayTeam,
        });
        await RecommendationService.createRecommendation({
            title,
            description,
            matchId: match!._id,
            picture: imageUrl, // Store image URL
            createdBy: '123412341234123412341234',
        });
        reset();
        setImageUrl(''); // Clear image preview
        setSelectedCountry('');
        setSelectedLeague(undefined);
        onClose();
    };

    // // Debounced search function to optimize API calls
    // const debouncedSearch = useCallback(
    //     debounce((searchText: string) => {
    //         setSearchTerm(searchText);
    //     }, 500),
    //     []
    // );

    // Handle file upload
    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            const response = await fetch('http://localhost:3000/file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                message.success('Image uploaded successfully');
                const filePath = data.url.split('/public/')[1];

                setImageUrl(filePath);
                setValue('picture', filePath);
            } else {
                message.error('Upload failed');
            }
        } catch (error) {
            message.error('Upload error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            title="Create Recommendation"
            open={isOpen}
            onCancel={() => {
                reset();
                setImageUrl(''); // Clear image preview
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
                        options={countries.map((c) => ({ value: c.name }))}
                        onSelect={(value) => {
                            setSelectedCountry(value);
                            setValue('country', value);
                            setValue('league', '');
                            setValue('stadium', '');
                            setValue('homeTeam', '');
                            setValue('awayTeam', '');
                        }}
                        placeholder="Select a country"
                    />
                </Form.Item>

                <Form.Item label="League" validateStatus={errors.league ? 'error' : ''} help={errors.league?.message}>
                    <AutoComplete
                        options={leagues.map((l) => ({ value: l.league.name, id: l.league.id }))}
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
                        options={stadiums.map((venue) => ({ value: venue.name }))}
                        onSelect={(value) => setValue('stadium', value)}
                        placeholder="Select a stadium"
                        disabled={!selectedCountry}
                    />
                </Form.Item>

                <Form.Item
                    label="Home Team"
                    validateStatus={errors.homeTeam ? 'error' : ''}
                    help={errors.homeTeam?.message}
                >
                    <AutoComplete
                        options={teams.map((t) => ({ value: t.team.name }))}
                        onSelect={(value) => setValue('homeTeam', value)}
                        placeholder="Select home team"
                        disabled={!selectedLeague}
                    />
                </Form.Item>

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
                            handleUpload(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>
                            Upload Image
                        </Button>
                    </Upload>

                    {/* Small preview of the uploaded image */}
                    {imageUrl && (
                        <div style={{ marginTop: 10, textAlign: 'center' }}>
                            <img
                                src={`http://localhost:3000/public/${imageUrl}`}
                                alt="Uploaded Preview"
                                style={{
                                    width: 80,
                                    height: 80,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: '1px solid #d9d9d9',
                                    padding: 4,
                                }}
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
