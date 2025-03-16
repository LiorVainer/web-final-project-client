import { useState } from 'react';
import { Modal, Form, Input, Button, AutoComplete, Upload, message, DatePicker, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from './share-match-experience-modal.module.scss';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { SoccerService } from '@/api/services/soccer.service';
import { FileService } from '@/api/services/file.service';

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

type ShareMatchExperienceModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type ShareMatchExperienceModalValues = Yup.InferType<typeof MatchExperienceSchema>;

const ShareMatchExperienceModal = ({ isOpen, onClose }: ShareMatchExperienceModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedLeague, setSelectedLeague] = useState<number>();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        getValues,
        trigger,
        watch,
        formState: { errors },
    } = useForm<ShareMatchExperienceModalValues>({
        resolver: yupResolver(MatchExperienceSchema),
    });

    const { picture, description, ...rest } = watch();
    const isAiButtonDisabled =
        Object.keys(rest).length === 0 || Object.values(rest).some((value) => value === undefined || value === '');

    const calculateCurrentSeason = (date: Date): number => {
        return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
    };

    const { data: countries = [] } = useQueryOnDefinedParam('countries', isOpen, SoccerService.getCountries);
    const { data: leagues = [] } = useQueryOnDefinedParam(
        'leagues',
        selectedCountry ? selectedCountry : undefined,
        SoccerService.getLeagues
    );
    const { data: stadiums = [] } = useQueryOnDefinedParam(
        'stadiums',
        selectedCountry ? selectedCountry : undefined,
        SoccerService.getVenues
    );

    const { data: teams = [] } = useQueryOnDefinedParam(
        'teams',
        selectedLeague && selectedDate
            ? { leagueId: selectedLeague, season: calculateCurrentSeason(new Date(selectedDate)) }
            : undefined,
        ({ leagueId, season }) => SoccerService.getTeams({ leagueId, season })
    );

    const fetchAIHelp = async () => {
        try {
            const response = await MatchExperienceService.betterDescription(getValues());

            if (response) {
                setValue('description', response);
                message.success('AI-generated description added!');
            } else {
                message.error('Failed to generate description :(');
            }
        } catch (error) {
            message.error('An error occurred while fetching AI help.');
        }
    };

    const resetTeams = () => {
        queryClient.setQueryData(['teams'], []);
    };

    const resetValuesOnCountryChange = (value: string) => {
        setSelectedCountry(value);
        setValue('country', value);
        setValue('league', '');
        setValue('stadium', '');
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        setSelectedLeague(undefined);
        resetTeams();
        trigger('country');
    };

    const resetValuesOnLeagueChange = (value: string, id: number | undefined) => {
        setSelectedLeague(id);
        setValue('league', value);
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        resetTeams();
        trigger('league');
    };

    const resetValuesOnChange = (key: keyof ShareMatchExperienceModalValues, value: string) => {
        setValue(key, value);
        trigger(key);
    };

    const onDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            setValue('matchDate', date);
            setValue('homeTeam', '');
            setValue('awayTeam', '');
            resetTeams();
            trigger('matchDate');
        } else {
            trigger('matchDate');
        }
    };

    const onSubmit = async (values: ShareMatchExperienceModalValues) => {
        const isValid = await trigger();
        if (!isValid) return;

        try {
            let uploadedImageUrl = imageUrl;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const { data } = await FileService.handleUpload(formData);
                uploadedImageUrl = data.url.split('/public/')[1];
            }

            await MatchExperienceService.createMatchExperience({
                ...values,
                picture: uploadedImageUrl,
                createdBy: '123412341234123412341234',
            });

            message.success('MatchExperience created successfully');
            reset();
            setImageUrl('');
            setSelectedCountry('');
            setSelectedLeague(undefined);
            setSelectedDate(null);
            resetTeams();
            onClose();
        } catch (error) {
            message.error('An error occurred while submitting the matchExperience.');
        }
    };

    return (
        <Modal
            title="Share your match experience"
            open={isOpen}
            onCancel={() => {
                reset();
                setImageUrl('');
                setSelectedCountry('');
                setSelectedLeague(undefined);
                setSelectedDate(null);
                resetTeams();
                onClose();
            }}
            footer={null}
            className={styles.modal}
        >
            <Form layout="vertical" className={styles.form} onFinish={handleSubmit(onSubmit)}>
                <Form.Item
                    label="Match Date"
                    validateStatus={errors.matchDate ? 'error' : ''}
                    help={errors.matchDate?.message}
                >
                    <Controller
                        name="matchDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker {...field} style={{ width: '100%' }} onChange={onDateChange} />
                        )}
                    />
                </Form.Item>

                <Form.Item
                    label="Country"
                    validateStatus={errors.country ? 'error' : ''}
                    help={errors.country?.message}
                >
                    <AutoComplete
                        value={getValues('country')}
                        options={countries.map((option) => ({ value: option.name }))}
                        onSelect={resetValuesOnCountryChange}
                        onClear={() => resetValuesOnCountryChange('')}
                        placeholder="Select a country"
                        allowClear
                    />
                </Form.Item>

                <Form.Item label="League" validateStatus={errors.league ? 'error' : ''} help={errors.league?.message}>
                    <AutoComplete
                        value={getValues('league')}
                        options={leagues.map((option) => ({ value: option.league.name, id: option.league.id }))}
                        onSelect={(value, option) => resetValuesOnLeagueChange(value, option.id)}
                        onClear={() => resetValuesOnLeagueChange('', undefined)}
                        placeholder="Select a league"
                        disabled={!selectedCountry}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    label="Stadium"
                    validateStatus={errors.stadium ? 'error' : ''}
                    help={errors.stadium?.message}
                >
                    <AutoComplete
                        value={getValues('stadium')}
                        options={stadiums.map((option) => ({ value: option.name }))}
                        onSelect={(value) => resetValuesOnChange('stadium', value)}
                        onClear={() => resetValuesOnChange('stadium', '')}
                        placeholder="Select a stadium"
                        disabled={!selectedCountry}
                        allowClear
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
                                value={getValues('homeTeam')}
                                options={teams
                                    .filter((team) => team.team.name !== getValues().awayTeam)
                                    .map((option) => ({ value: option.team.name }))}
                                onSelect={(value) => resetValuesOnChange('homeTeam', value)}
                                onClear={() => resetValuesOnChange('homeTeam', '')}
                                placeholder="Select home team"
                                disabled={!selectedLeague || !selectedDate}
                                allowClear
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
                                value={getValues('awayTeam')}
                                options={teams
                                    .filter((team) => team.team.name !== getValues().homeTeam)
                                    .map((option) => ({ value: option.team.name }))}
                                onSelect={(value) => resetValuesOnChange('awayTeam', value)}
                                onClear={() => resetValuesOnChange('awayTeam', '')}
                                placeholder="Select away team"
                                disabled={!selectedLeague || !selectedDate}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title?.message}>
                    <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item
                    label="Description"
                    validateStatus={errors.description ? 'error' : ''}
                    help={errors.description?.message}
                    className={styles.formItem}
                >
                    <div className={styles.descriptionContainer}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <Input.TextArea {...field} className={styles.textArea} />}
                        />
                        <Button className={styles.aiButton} onClick={fetchAIHelp} disabled={isAiButtonDisabled}>
                            Ask AI for help
                        </Button>
                    </div>
                </Form.Item>

                <Form.Item
                    label="Picture From The Match"
                    validateStatus={errors.picture ? 'error' : ''}
                    help={errors.picture?.message}
                >
                    <Upload
                        maxCount={1}
                        beforeUpload={(file) => {
                            setSelectedFile(file);

                            const reader = new FileReader();
                            reader.onload = (e) => {
                                setImageUrl(e.target?.result as string);
                            };
                            reader.readAsDataURL(file);

                            return false;
                        }}
                        onRemove={() => {
                            setImageUrl('');
                            setSelectedFile(null);
                        }}
                        showUploadList={true}
                    >
                        <Button className={styles.uploadButton} icon={<UploadOutlined />} block>
                            Upload Your Picture
                        </Button>
                    </Upload>
                </Form.Item>

                {imageUrl && (
                    <div className="image-preview-container">
                        <img src={imageUrl} alt="Uploaded Preview" className="image-preview" />
                    </div>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" className={styles.submitButton}>
                        Share
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ShareMatchExperienceModal;
