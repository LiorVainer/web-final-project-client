import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryConfig } from '../config/query.types.ts';

/**
 * A generic React Query hook to execute service methods with type safety.
 *
 * This hook dynamically resolves a method from the given service object
 * and executes it with the provided arguments, leveraging React Query for caching
 * and state management.
 *
 * @template TService - The type of the service object containing the methods.
 * @template K - The key of the method in the service to be called.
 *
 * @param {TService} service - The service object containing the methods.
 * @param {K} key - The method name (key) in the service to execute.
 * @param {...QueryConfig<TService>[K]['args']} args - The arguments to pass to the selected service method.
 *
 * @returns {UseQueryResult<QueryConfig<TService>[K]['returnType'], unknown>}
 * React Query result object containing the method's return value or error.
 *
 * @example
 * // Usage with UsersService
 * import { UsersService } from '../services/users.service';
 * import { useQueryService } from '../hooks/useQueryService';
 *
 * const { data: users } = useQueryService(UsersService, 'getUsers'); // Get all users
 *
 * const { data: user } = useQueryService(UsersService, 'getUserById', 'user-id-123'); // Get a user by ID
 *
 * const { data: newUser } = useQueryService(UsersService, 'createUser', {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 * }); // Create a user
 *
 * const { data: updatedUser } = useQueryService(
 *   UsersService,
 *   'updateUser',
 *   'user-id-123',
 *   { name: 'John Updated' }
 * ); // Update a user
 *
 * const { data: deletedUserId } = useQueryService(UsersService, 'deleteUser', 'user-id-123'); // Delete a user
 *
 * @example
 * // Usage with other service (e.g., ProductsService)
 * const { data: products } = useQueryService(ProductsService, 'getProducts'); // Get all products
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
        queryKey: [key, ...args], // Include method name and arguments for caching
        queryFn,
    });
};