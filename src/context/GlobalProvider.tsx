import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { reactQueryClient } from '@/api/config/query-client';
import { AntdProvider } from '@/context/AntdProvider.tsx';
import { AuthProvider } from '@/context/AuthContext.tsx';

export const GlobalContextProvider = ({ children }: PropsWithChildren<{}>) => {
    return (
        <AntdProvider>
            <QueryClientProvider client={reactQueryClient}>
                <AuthProvider>{children}</AuthProvider>
            </QueryClientProvider>
        </AntdProvider>
    );
};
