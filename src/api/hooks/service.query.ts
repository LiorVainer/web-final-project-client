import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryConfig } from '../config/query.types.ts';

/**
 * Custom hook to use a query for the user service
 * @param key
 * @param args
 * @example
 * ```tsx
 * // Get all users
 *  const { data: users } = useUserQuery('getUsers');
 *
 *   // Get a user by ID
 *   const { data: user } = useUserQuery('getUserById', 'user-id-123');
 *
 *   // Create a user
 *   const { data: newUser } = useUserQuery('createUser', {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *   });
 *
 *   // Update a user
 *   const { data: updatedUser } = useUserQuery('updateUser', 'user-id-123', {
 *     name: 'John Updated',
 *   });
 *
 *   // Delete a user
 *   const { data: deletedUserId } = useUserQuery('deleteUser', 'user-id-123');
 *   ```
 */
/**
 * Generic hook to use queries for any service
 * @param service - The service object
 * @param key - The method name in the service
 * @param args - Arguments for the selected method
 * @example
 * ```tsx
 * // Using with UsersService
 * const { data: users } = useQueryService(UsersService, 'getUsers');
 * const { data: user } = useQueryService(UsersService, 'getUserById', 'user-id-123');
 * ```
 */
export const useQueryService = <
    TService,
    K extends keyof QueryConfig<TService>
>(
    service: TService,
    key: K,
    ...args: QueryConfig<TService>[K]['args']
): UseQueryResult<QueryConfig<TService>[K]['returnType'], unknown> => {
    const queryFn = async (): Promise<QueryConfig<TService>[K]['returnType']> => {
        const method = service[key] as (
            ...args: QueryConfig<TService>[K]['args']
        ) => Promise<QueryConfig<TService>[K]['returnType']>;
        return await method(...args);
    };

    return useQuery<QueryConfig<TService>[K]['returnType'], unknown>({
        queryKey: [key, ...args], // Include method name and args for cache invalidation
        queryFn,
    });
};