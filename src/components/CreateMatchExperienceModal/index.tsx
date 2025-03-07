import { useState } from 'react';
import { AutoComplete, Button, Col, DatePicker, Form, Input, message, Modal, Row, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import styles from './CreateMatchExperienceModal.module.scss';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { SoccerService } from '@/api/services/soccer.service';
import { FileService } from '@/api/services/file.service';
import { publicRoute } from '@/constants/soccer.const';

const MatchExperienceSchema = Yup.object().shape({
    title: Yup.string().min(3, 'Title is too short').required('Title is required'),
    description: Yup.string().min(10, 'Description is too short').required('Description is required'),
    picture: Yup.string().optional(),
    country: Yup.string().required('Country is required'),
    stadium: Yup.string().required('Stadium is required'),
    league: Yup.string().required('League is required'),
    homeTeam: Yup.string().required('Home Team is required'),
    awayTeam: Yup.string().required('Away Team is required'),
    matchDate: Yup.date().required('Match date is required'),
});

export const useQueryOnDefinedParam = <T, P>(key: string, param: P | undefined, fetchFn: (param: P) => Promise<T>) =>
    useQuery({
        queryKey: [key, param],
        queryFn: async () => (param !== undefined ? fetchFn(param) : Promise.resolve([] as T)),
        enabled: param !== undefined,
    });

type CreateMatchExperienceModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type CreateMatchExperienceModalValues = Yup.InferType<typeof MatchExperienceSchema>;

const CreateMatchExperienceModal = ({ isOpen, onClose }: CreateMatchExperienceModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedLeague, setSelectedLeague] = useState<number>();

    console.log('img', imageUrl);

    const resetValuesOnCountryChange = (value: string) => {
        setSelectedCountry(value);
        setValue('country', value);
        setValue('league', '');
        setValue('stadium', '');
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        setSelectedLeague(undefined);
    };

    const { mutate: uploadImage, isPending } = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await FileService.handleUpload(formData);
            return data;
        },
        onSuccess: (data) => {
            if (data.url) {
                message.success('Image uploaded successfully');
                const filePath = data.url.split('public/')[1];
                setImageUrl(filePath);
                setValue('picture', filePath);
            } else {
                message.error('Upload failed');
            }
        },
        onError: () => {
            message.error('Upload error');
        },
    });

    const { data: countries = [] } = useQueryOnDefinedParam('countries', isOpen, SoccerService.getCountries);
    const { data: leagues = [] } = useQueryOnDefinedParam('leagues', selectedCountry, SoccerService.getLeagues);
    const { data: stadiums = [] } = useQueryOnDefinedParam('stadiums', selectedCountry, SoccerService.getVenues);
    const { data: teams = [] } = useQueryOnDefinedParam('teams', selectedLeague, SoccerService.getTeams);

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateMatchExperienceModalValues>({
        resolver: yupResolver(MatchExperienceSchema),
    });

    const onSubmit = async (values: CreateMatchExperienceModalValues) => {
        try {
            await MatchExperienceService.createMatchExperience({
                ...values,
                picture: imageUrl,
                createdBy: '123412341234123412341234',
            });

            message.success('MatchExperience created successfully');

            reset();
            setImageUrl('');
            setSelectedCountry('');
            setSelectedLeague(undefined);
            onClose();
        } catch (error) {
            message.error('An error occurred while submitting the matchExperience.');
        }
    };

    return (
        <Modal
            title="Create MatchExperience"
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
                        onSelect={resetValuesOnCountryChange}
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
                        name="matchDate"
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
                        <Button icon={<UploadOutlined />} loading={isPending}>
                            Upload Image
                        </Button>
                    </Upload>

                    {imageUrl && (
                        <div className={styles['image-preview-container']}>
                            <img
                                src={`${publicRoute}${imageUrl}`}
                                alt="Uploaded Preview"
                                className={styles['image-preview']}
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

export default CreateMatchExperienceModal;
