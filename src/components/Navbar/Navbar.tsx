import { useState } from 'react';
import classes from './navbar.module.scss';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Button, Divider, Dropdown, Form, Input, MenuProps, Modal, Typography, Upload } from 'antd';
import { EditOutlined, LogoutOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';
import { UpdateUserValidationRules } from '@/pages/AuthPage/auth.validation';
import { UsersService } from '@api/services/users.service.ts';
import { AxiosError } from 'axios';
import { UserUpdatePayload } from '@/models/user.model';
import { FileService } from '@/api/services/file.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
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
    const { loggedInUser, logout, doesUserHasGooglePicture, isGoogleUser } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);
    const queryClient = useQueryClient();

    const { mutateAsync } = useMutation({
        mutationKey: [QUERY_KEYS.UPDATE_USER],
        mutationFn: async (user: UserUpdatePayload) => {
            return await UsersService.updateUser(loggedInUser!._id, user);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOGGED_IN_USER] });
            handleCancel();
        },
    });

    const onFinish = async (values: RegistrationFormValues) => {
        let uploadedImageUrl: string | undefined = undefined;

        try {
            if (loggedInUser) {
                const isPictureChanged = values.picture !== loggedInUser.picture;
                const isEmailChanged = values.email !== loggedInUser.email;
                const isUsernameChanged = values.username !== loggedInUser.username;

                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    const { data } = await FileService.handleUpload(formData);
                    uploadedImageUrl = data.url.split('public/')[1];
                }

                const user: UserUpdatePayload = {
                    username: isUsernameChanged ? values.username : undefined,
                    email: isEmailChanged ? values.email : undefined,
                    picture: uploadedImageUrl,
                };

                if (isPictureChanged && !doesUserHasGooglePicture && uploadedImageUrl) {
                    await FileService.deleteFile(loggedInUser.picture);
                }

                await mutateAsync(user);
                handleCancel();
            }
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                setErrorMessage('Failed in updating user');
            }
        }
    };

    const items: MenuProps['items'] = [
        {
            key: 'profile',
            label: loggedInUser ? (
                <div className={classes.dropdownContainer}>
                    <div className={classes.profileImageContainer}>
                        <img
                            src={getPictureSrcUrl(loggedInUser?.picture)}
                            alt="User Avatar"
                            className={classes.profileImage}
                        />
                    </div>

                    <div className={classes.textCenter}>
                        <Text className={classes.profileName}>{loggedInUser.username}</Text>
                        <Text className={classes.profileEmail}>{loggedInUser.email}</Text>
                    </div>

                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        className={classes.customizeProfileButton}
                        onClick={showModal}
                    >
                        Edit User
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
                {loggedInUser && (
                    <>
                        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                            <img
                                src={getPictureSrcUrl(loggedInUser.picture)}
                                alt="User Avatar"
                                className={classes.avatarSmall}
                            />
                        </Dropdown>

                        <Modal title="Edit User" open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                className={classes.authForm}
                                initialValues={loggedInUser}
                            >
                                <Form.Item name="picture">
                                    <Avatar
                                        src={imageUrl || getPictureSrcUrl(loggedInUser.picture)}
                                        icon={!imageUrl ? <UserOutlined /> : undefined}
                                        size={70}
                                    />
                                </Form.Item>
                                <Form.Item name="upload" className={classes.uploadFormItem}>
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
                                    rules={UpdateUserValidationRules.username}
                                >
                                    <Input placeholder="Enter your username" />
                                </Form.Item>
                                {!isGoogleUser && (
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        className={classes.inputField}
                                        rules={UpdateUserValidationRules.email}
                                    >
                                        <Input placeholder="Enter your email" />
                                    </Form.Item>
                                )}
                            </Form>
                        </Modal>
                    </>
                )}
            </div>
        </nav>
    );
};
