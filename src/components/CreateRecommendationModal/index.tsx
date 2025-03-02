import { useState, useCallback } from 'react';
import { Modal, Form, Input, Button, AutoComplete, Upload, Spin, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import styles from './CreateRecommendationModal.module.scss';
import { RecommendationService } from '@/api/services/recommendation.service';

// Recommendation Schema with Yup validation
const RecommendationSchema = Yup.object().shape({
    matchId: Yup.string().required('Match is required'),
    title: Yup.string().min(3, 'Title is too short').required('Title is required'),
    description: Yup.string().min(10, 'Description is too short').required('Description is required'),
    picture: Yup.string().optional(),
});

type CreateRecommendationModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type CreateRecommendationModalValues = Yup.InferType<typeof RecommendationSchema>;

const CreateRecommendationModal = ({ isOpen, onClose }: CreateRecommendationModalProps) => {
    const [matchLabel, setMatchLabel] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    // Fetch soccer matches using react-query
    const { data: matches = [], isFetching } = useQuery({
        queryKey: ['matches', searchTerm],
        queryFn: () =>
            fetch(
                `https://app.ticketmaster.com/discovery/v2/events.json?apikey=uchG8sbaBH7wcW2lctJnPNQHu5XRXidC&classificationName=Soccer&keyword=${searchTerm}`
            )
                .then((res) => res.json())
                .then((data) => data._embedded?.events || []),
        enabled: searchTerm.length > 0,
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
        await RecommendationService.createRecommendation({
            ...values,
            picture: imageUrl, // Store image URL
            createdBy: '123412341234123412341234',
        });
        reset();
        setImageUrl(''); // Clear image preview
        onClose();
    };

    // Debounced search function to optimize API calls
    const debouncedSearch = useCallback(
        debounce((searchText: string) => {
            setSearchTerm(searchText);
        }, 500),
        []
    );

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
        <Modal title="Create Recommendation" open={isOpen} onCancel={onClose} footer={null} className={styles.modal}>
            <Form layout="vertical" className={styles.form} onFinish={handleSubmit(onSubmit)}>
                <Form.Item label="Match" validateStatus={errors.matchId ? 'error' : ''} help={errors.matchId?.message}>
                    <AutoComplete
                        options={matches.map((match: any) => ({
                            value: match.id, // The ID stored in the form
                            label: `${match.name} - ${new Date(match.dates.start.dateTime).toLocaleDateString()}`, // What the user sees
                        }))}
                        value={matchLabel} // Displayed value
                        onChange={(value) => {
                            setMatchLabel(value); // Show user-friendly label
                        }}
                        onSelect={(value, option) => {
                            setValue('matchId', value); // Store match ID
                            setMatchLabel(option.label); // Show selected match name
                        }}
                        onSearch={debouncedSearch}
                        placeholder="Search for a match..."
                        notFoundContent={isFetching ? <Spin size="small" /> : 'No matches found'}
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
