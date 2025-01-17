import { useQuery } from '@tanstack/react-query';
import classes from './home-screen.module.scss';
import { USERS_KEYS } from '../../api/config/query-keys';
import { UsersService } from '../../api/services/users.service';
import * as colors from '../../theme/_colors.scss';

export interface HomeScreenProps {}

export const HomeScreen = ({}: HomeScreenProps) => {
    console.log({ colors });

    const { data, error, isLoading } = useQuery({
        queryKey: [USERS_KEYS.getUsers],
        queryFn: UsersService[USERS_KEYS.getUsers],
    });

    if (error) {
        console.error('Error', error);
        return <div>Error...</div>;
    }

    if (!data || isLoading) {
        return <div>Loading...</div>;
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
