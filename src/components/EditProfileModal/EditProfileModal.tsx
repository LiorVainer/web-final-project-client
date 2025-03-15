import classes from './edit-profile-modal.module.scss';

export interface EditProfileModalProps {}

export const EditProfileModal = (props: EditProfileModalProps) => {
    return (
        <Modal title="Edit Profile" open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
            <Form form={form} layout="vertical" onFinish={onFinish} className={classes.authForm}>
                <Form.Item name="picture">
                    <Avatar src={imageUrl || undefined} icon={!imageUrl ? <UserOutlined /> : undefined} size={70} />
                </Form.Item>
                <Form.Item name="upload" className={classes.uploadFormItem} rules={AuthFormValidationRules.picture}>
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
    );
};
