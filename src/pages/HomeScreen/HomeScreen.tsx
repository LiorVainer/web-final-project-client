import classes from './home-screen.module.scss';
import { useQueryService } from '@api/hooks/service.query.ts';
import { UsersService } from '@api/services/users.service.ts';
import { Button } from 'antd';

export interface HomeScreenProps {}

export const HomeScreen = ({}: HomeScreenProps) => {
    const { data, error, isLoading } = useQueryService(UsersService, 'getUsers')

    if (error) {
        console.error('Error', error);
        return <div>Error has occurred</div>;
    }

    if (!data || isLoading) {
        return <Button>Loading...</Button>;
    }

    return (
        <div>
            <h1>Home Screen</h1>
            {data.map((user) => (
                <div>{user.email}</div>
            ))}
            <button className={classes.button}>Press Me</button>
        </div>
    );
};
