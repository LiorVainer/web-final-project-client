import React from 'react';
import { ConfigProvider, ThemeConfig } from 'antd';

export const AntdProvider: React.FC = ({ }) => {
    const config: ThemeConfig = {
        token: {
            colorPrimary: '#1890ff',
        },
    };

    return (
        <ConfigProvider {...config}>
            {children}
        </ConfigProvider>
    )
}