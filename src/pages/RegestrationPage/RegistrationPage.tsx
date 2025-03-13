import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Avatar, Upload, Typography, message } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { AuthService } from '@/api/services/auth.service';

const { Text } = Typography;

export const RegestrationPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [form] = Form.useForm();
    const [image, setImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mockUsers = [
        { email: 'john@example.com', password: '123456' },
        { email: 'jane@example.com', password: 'password123' },
    ];

    const handleChange: UploadProps['onChange'] = ({ fileList }) => {
        if (fileList.length > 0) {
            const file = fileList[fileList.length - 1].originFileObj as File;
            if (file) {
                const newImageUrl = URL.createObjectURL(file);
                if (image) {
                    URL.revokeObjectURL(image);
                }
                setImage(newImageUrl);
                form.setFieldsValue({ picture: newImageUrl });
            }
        }
    };

    const onFinish = async (values: any) => {
        const user = {
            username: values.username,
            email: values.email,
            password: values.password,
            picture: image || 'default-icon',
        };

        if (isSignUp) {
            const newUser = await AuthService.register(user);
        } else {
            try {
                await AuthService.login({ password: user.password, email: user.email });
            } catch (error: any) {
                setErrorMessage(error.response.data);
            }
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
                                    src={image || undefined}
                                    icon={!image ? <UserOutlined /> : undefined}
                                    size={100}
                                />
                            </Form.Item>
                            <Form.Item name="upload">
                                <Upload
                                    onChange={handleChange}
                                    beforeUpload={() => false}
                                    showUploadList={false}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />} type="dashed">
                                        Upload Image
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
                            setImage(null);
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

export default RegestrationPage;
