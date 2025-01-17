import { UsersService } from './../services/users.service';
export const USERS_KEYS = {
    getUsers: 'getUsers',
    getUserById: 'getUserById',
    createUser: 'createUser',
    updateUser: 'updateUser',
    deleteUser: 'deleteUser',
} satisfies Record<keyof typeof UsersService, keyof typeof UsersService>;
