import { Navbar } from '@components/Navbar';
import { Outlet } from 'react-router';
import { PropsWithChildren } from 'react';
import classes from './layout.module.scss';
import { useAuth } from '@/context/AuthContext.tsx';

export interface LayoutProps {}

export const Layout = (_props: PropsWithChildren<LayoutProps>) => {
    const { user } = useAuth();
    return (
        <div className={classes.layout}>
            {user && <Navbar />}
            <Outlet />
        </div>
    );
};
