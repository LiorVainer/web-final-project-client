import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { reactQueryClient } from '@/api/config/query-client';
import { AntdProvider } from '@/context/AntdProvider.tsx';


export const GlobalContextProvider = ({ children }: PropsWithChildren<{}>) => {
    return (
        <AntdProvider>
            <QueryClientProvider client={reactQueryClient}>{children}</QueryClientProvider>
        </AntdProvider>
    );
};
