import React, { useState } from 'react';

import { Avatar, Button, Col, Form, Input, Row, Typography, Upload } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

import { AuthService } from '@/api/services/auth.service';
import styles from '@components/ShareMatchExperienceModal/share-match-experience-modal.module.scss';
import { FileService } from '@api/services/file.service.ts';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/models/user.model.ts';
import { useAuth } from '@/context/AuthContext.tsx';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

const { Text } = Typography;

export interface RegistrationFormValues {
    username: string;
    email: string;
    password: string;
    picture: string;
}

export const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { handleAuthResponse } = useAuth();

    const onFinish = async (values: RegistrationFormValues) => {
        let uploadedImageUrl = imageUrl;
        let response: AuthResponse | undefined;

        try {
            if (isSignUp) {
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    const { data } = await FileService.handleUpload(formData);
                    uploadedImageUrl = data.url.split('public/')[1];
                }
                console.log('uploadedImageUrl', uploadedImageUrl);
                const user: RegisterPayload = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    picture: uploadedImageUrl,
                };

                response = await AuthService.register(user);
            } else {
                const user: LoginPayload = {
                    email: values.email,
                    password: values.password,
                };

                response = await AuthService.login(user);
            }
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                setErrorMessage('Failed in authentication');
            }
        }

        if (response) {
            handleAuthResponse(response);
            navigate('/');
        }
    };

    return (
        <Row
            justify="center"
            align="middle"
            style={{
                minHeight: '100vh',
                display: 'flex',
            }}
        >
            <Col
                span={8}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '15px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                }}
            >
                <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: '10px',
                        alignItems: 'center',
                    }}
                >
                    {isSignUp && (
                        <React.Fragment>
                            <Form.Item name="picture">
                                <Avatar
                                    src={imageUrl || undefined}
                                    icon={!imageUrl ? <UserOutlined /> : undefined}
                                    size={100}
                                />
                            </Form.Item>
                            <Form.Item name="upload">
                                <Upload
                                    maxCount={1}
                                    showUploadList={false}
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
                                >
                                    <Button className={styles.uploadButton} icon={<UploadOutlined />} block>
                                        Upload Your Picture
                                    </Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item
                                style={{
                                    width: '20rem',
                                }}
                                label="Username"
                                name="username"
                                rules={[{ required: true, message: 'Please enter your username!' }]}
                            >
                                <Input placeholder="Enter your username" />
                            </Form.Item>
                        </React.Fragment>
                    )}

                    <Form.Item
                        label="Email"
                        name="email"
                        style={{
                            width: '20rem',
                        }}
                        rules={[{ required: true, message: 'Please enter your email!' }]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        style={{
                            width: '20rem',
                        }}
                        rules={[{ required: true, message: 'Please enter your password!' }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    {errorMessage && (
                        <Text type="danger" style={{ marginBottom: '10px' }}>
                            {errorMessage}
                        </Text>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '10rem' }} block>
                            {isSignUp ? 'Register' : 'Sign In'}
                        </Button>
                    </Form.Item>
                </Form>

                <Text>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <Text
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            form.resetFields();
                            setErrorMessage(null);
                        }}
                        style={{ color: '#1890ff', cursor: 'pointer' }}
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </Text>
                </Text>
            </Col>
        </Row>
    );
};

export default AuthPage;
