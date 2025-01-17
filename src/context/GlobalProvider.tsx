import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { reactQueryClient } from '../api/config/query-client';

export const GlobalContextProvider = ({ children }: PropsWithChildren<{}>) => {
    return <QueryClientProvider client={reactQueryClient}>{children}</QueryClientProvider>;
};
