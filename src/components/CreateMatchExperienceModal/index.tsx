import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, AutoComplete, Upload, message, DatePicker, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
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
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [teams, setTeams] = useState<any[]>([]);

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        getValues,
        trigger,
        formState: { errors },
    } = useForm<CreateMatchExperienceModalValues>({
        resolver: yupResolver(MatchExperienceSchema),
    });

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
    });

    const handleYear = (date: Date): number => {
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

    useEffect(() => {
        if (selectedLeague !== undefined && selectedDate !== null) {
            const season = handleYear(new Date(selectedDate));
            SoccerService.getTeams({ leagueId: selectedLeague, season }).then((data) => setTeams(data));
        }
    }, [selectedLeague, selectedDate]);

    const resetValuesOnCountryChange = (value: string) => {
        setSelectedCountry(value);
        setValue('country', value);
        setValue('league', '');
        setValue('stadium', '');
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        setSelectedLeague(undefined);
        setTeams([]);
        trigger('country');
    };

    const resetValuesOnLeagueChange = (value: string, id: number | undefined) => {
        setSelectedLeague(id);
        setValue('league', value);
        setValue('homeTeam', '');
        setValue('awayTeam', '');
        setTeams([]);
        trigger('league');
    };

    const resetValuesOnChange = (key: keyof CreateMatchExperienceModalValues, value: string) => {
        setValue(key, value);
        trigger(key);
    };

    const onDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            setValue('matchDate', date);
            setValue('homeTeam', '');
            setValue('awayTeam', '');
            setTeams([]);
            trigger('matchDate');
        } else {
            trigger('matchDate');
        }
    };

    const onSubmit = async (values: CreateMatchExperienceModalValues) => {
        const isValid = await trigger();
        if (!isValid) return;

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
            setSelectedDate(null);
            setTeams([]);
            onClose();
        } catch (error) {
            message.error('An error occurred while submitting the matchExperience.');
        }
    };

    return (
        <Modal
            title="Create your match experience"
            open={isOpen}
            onCancel={() => {
                reset();
                setImageUrl('');
                setSelectedCountry('');
                setSelectedLeague(undefined);
                setSelectedDate(null);
                setTeams([]);
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
                >
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => <Input.TextArea {...field} />}
                    />
                </Form.Item>

                <Form.Item
                    label="Upload Image"
                    validateStatus={errors.picture ? 'error' : ''}
                    help={errors.picture?.message}
                >
                    <Upload
                        maxCount={1}
                        beforeUpload={(file) => {
                            uploadImage(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Upload Picture</Button>
                    </Upload>
                </Form.Item>

                {imageUrl && (
                    <div className={styles['image-preview-container']}>
                        <img
                            src={`${publicRoute}${imageUrl}`}
                            alt="Uploaded Preview"
                            className={styles['image-preview']}
                        />
                    </div>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isPending} className={styles.submitButton}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateMatchExperienceModal;
