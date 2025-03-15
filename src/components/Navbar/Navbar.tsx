import { useState, useEffect } from 'react';
import classes from './navbar.module.scss';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Button, Dropdown, Input, MenuProps, Modal, Typography, Spin, Divider, Form, Avatar, Upload } from 'antd';
import { EditOutlined, LogoutOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';
import { AuthFormValidationRules } from '@/pages/AuthPage/auth.validation';
import { UsersService } from '@api/services/users.service.ts';
import { AxiosError } from 'axios';
import { UserUpdatePayload } from '@/models/user.model';
import { FileService } from '@/api/services/file.service';
// import { useQueryClient } from '@tanstack/react-query';
// import { QUERY_KEYS } from '@/api/constants/query-keys.const';
// import { AuthService } from '@/api/services/auth.service';

export interface User {
    username: string;
    email: string;
    picture: string;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
}

const { Text } = Typography;
export interface RegistrationFormValues {
    username: string;
    email: string;
    password: string;
    picture: string;
}

export const Navbar = () => {
    const { loggedInUser, logout, handleAuthResponse } = useAuth();

    const getDefaultUser = (): User | null => {
        return loggedInUser ?? null;
    };

    const [user, setUser] = useState<User | null>(getDefaultUser());
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [editData, setEditData] = useState<User | null>(getDefaultUser());

    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (loggedInUser) {
            setUser(loggedInUser);
            setEditData(loggedInUser);
        }
    }, [loggedInUser]);

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

    const onFinish = async (values: RegistrationFormValues) => {
        // const queryClient = useQueryClient();
        let uploadedImageUrl;
        let response;

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const { data } = await FileService.handleUpload(formData);
            uploadedImageUrl = data.url.split('public/')[1];
        }

        const user: UserUpdatePayload = {
            username: values.username,
            email: values.email,
            picture: uploadedImageUrl,
        };

        try {
            if (loggedInUser) {
                await FileService.deleteFile(loggedInUser.picture);
                const a = await UsersService.updateUser(loggedInUser._id, user);
                // if (a) response = await AuthService.login(a!);
                // if (response) handleAuthResponse(response);
                handleCancel();
            }
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                setErrorMessage('Failed in updating user');
            }
        }
    };

    console.log(user ? getPictureSrcUrl(user.picture) : 'homo');

    const items: MenuProps['items'] = [
        {
            key: 'profile',
            label: user ? (
                <div className={classes.dropdownContainer}>
                    <div className={classes.profileImageContainer}>
                        <img src={getPictureSrcUrl(user?.picture)} alt="User Avatar" className={classes.profileImage} />
                    </div>

                    <div className={classes.textCenter}>
                        <Text className={classes.profileName}>{user.username}</Text>
                        <Text className={classes.profileEmail}>{user.email}</Text>
                    </div>

                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        className={classes.customizeProfileButton}
                        onClick={showModal}
                    >
                        Customize Profile
                    </Button>

                    <Divider className={classes.divider} />

                    <Button
                        type="primary"
                        onClick={logout}
                        danger
                        icon={<LogoutOutlined />}
                        className={classes.logoutButton}
                    >
                        Log Out
                    </Button>
                </div>
            ) : null,
        },
    ];

    return (
        <nav className={classes.navbar}>
            <Link to={'/'} className={classes.brand}>
                <span className={classes.icon}>🍴</span>
                <h1 className={classes.title}>Sport Scanner</h1>
            </Link>

            <div className={classes.right}>
                {user ? (
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <img src={getPictureSrcUrl(user?.picture)} alt="User Avatar" className={classes.avatarSmall} />
                    </Dropdown>
                ) : null}

                <Modal title="Edit Profile" open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                    <Form form={form} layout="vertical" onFinish={onFinish} className={classes.authForm}>
                        <Form.Item name="picture">
                            <Avatar
                                src={imageUrl || undefined}
                                icon={!imageUrl ? <UserOutlined /> : undefined}
                                size={70}
                            />
                        </Form.Item>
                        <Form.Item
                            name="upload"
                            className={classes.uploadFormItem}
                            rules={AuthFormValidationRules.picture}
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
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined />} block>
                                    Upload Your Picture
                                </Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            label="Username"
                            name="username"
                            className={classes.inputField}
                            rules={AuthFormValidationRules.username}
                        >
                            <Input placeholder="Enter your username" />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            className={classes.inputField}
                            rules={AuthFormValidationRules.email}
                        >
                            <Input placeholder="Enter your email" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </nav>
    );
};
