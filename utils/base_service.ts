import { Repository, DeepPartial, FindOneOptions } from 'typeorm';

export type UpdateDataKeys<T> = keyof T & keyof DeepPartial<T>;

// Define a type for the API response
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T | null; // Allowed null for failed operations
    statusCode?: number;
}

export class BaseService<T extends object> {
    constructor(private readonly repository: Repository<T>) { }

    /**
     * Creates a new entity using the provided data and saves it to the database.
     * @param entity - The data to create the entity with.
     * @returns An ApiResponse with the created entity data on success or an error message on failure.
     */
    async create(entity: DeepPartial<T>): Promise<ApiResponse<T>> {
        try {
            const createdEntity = this.repository.create(entity);
            const savedEntity = await this.repository.save(createdEntity);
            return { statusCode: 201, status: 'success', data: savedEntity };
        } catch (error) {
            // Safe Type Guard for PostgreSQL Driver Errors
            if (error && typeof error === 'object' && 'code' in error) {
                const pgError = error as { code: string; detail?: string; message: string };
                if (pgError.code === '23505') {
                    return { statusCode: 409, status: 'error', message: pgError.detail || 'Duplicate entry error.' };
                }
                return { statusCode: 500, status: 'error', message: pgError.message };
            }
            
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return { statusCode: 500, status: 'error', message };
        }
    }

    /**
     * Updates an entity with the provided ID using the given update data.
     * @param id - The ID of the entity to be updated.
     * @param updateData - The data used to update the entity.
     * @returns An ApiResponse with status and updated entity data on success or an error message on failure.
     */
    async update(id: string, updateData: DeepPartial<T>): Promise<ApiResponse<T> | undefined> {
        try {
            const isExist = await this.findOne(id);
            if (isExist && isExist.statusCode === 404) {
                return isExist;
            }

            const where: Record<string, string> = {};
            const primaryKey: string = this.repository.metadata.primaryColumns[0].databaseName;
            where[primaryKey] = id;

            const validColumns = this.repository.metadata.columns.map(column => column.propertyName);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateQuery: any = {}; 
            const keys = Object.keys(updateData) as UpdateDataKeys<T>[];
            for (const key of keys) {
                // Use the safe prototype invocation method
                if (Object.prototype.hasOwnProperty.call(updateData, key) && validColumns.includes(key as string)) {
                    updateQuery[key] = updateData[key];
                }
            }

            const result = await this.repository.createQueryBuilder()
                .update()
                .set(updateQuery)
                .where(where)
                .returning('*') 
                .execute();

            if (result.affected && result.affected > 0) {
                return { statusCode: 200, status: 'success', data: result.raw[0] };
            } else {
                return { statusCode: 400, status: 'error', data: null, message: 'Invalid Data' };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return { statusCode: 500, status: 'error', message };
        }
    }

    /**
     * Finds an entity by its ID.
     * @param id - The ID of the entity to be retrieved.
     * @returns An ApiResponse with status and the retrieved entity data on success or an error message on failure.
     */
    async findOne(id: string): Promise<ApiResponse<T>> {
        try {
            const where: Record<string, string> = {};
            const primaryKey: string = this.repository.metadata.primaryColumns[0].databaseName;
            where[primaryKey] = id;

            const options: FindOneOptions<T> = { where: where as any };
            const data = await this.repository.findOne(options);

            if (data) {
                return { statusCode: 200, status: 'success', data: data };
            } else {
                return { statusCode: 404, status: 'error', message: 'Not Found' };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return { statusCode: 500, status: 'error', message };
        }
    }

    /**
     * Finds all entities based on the provided query parameters.
     * @param queryParams - The query parameters to filter the entities.
     * @returns An ApiResponse with status and an array of retrieved entity data on success or an error message on failure.
     */
    async findAll(queryParams: Record<string, any>): Promise<ApiResponse<T[]>> {
        try {
            let data: T[] = [];
            if (Object.keys(queryParams).length > 0) {
                const query = this.repository.createQueryBuilder();
                for (const field in queryParams) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (queryParams.hasOwnProperty(field)) {
                        const value = queryParams[field];
                        query.andWhere(`${field} = :value`, { value }); // Using bound parameter safety
                    }
                }
                data = await query.getMany();
            } else {
                data = await this.repository.find();
            }
            return { statusCode: 200, status: 'success', data: data };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return { statusCode: 500, status: 'error', data: [], message };
        }
    }

    /**
     * Deletes an entity based on the provided ID.
     * @param id - The ID of the entity to be deleted.
     * @returns An ApiResponse with status indicating success or error.
     */
    async delete(id: string): Promise<ApiResponse<T>> {
        try {
            const isExist = await this.findOne(id);
            if (isExist.statusCode === 404) {
                return isExist;
            }

            await this.repository.delete(id);
            return { statusCode: 200, status: 'success' };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return { statusCode: 500, status: 'error', message };
        }
    }

    /**
     * Retrieves multiple records by their IDs from the database.
     */
    async findByIds(ids: string[]): Promise<ApiResponse<T[]>> {
        try {
            const primaryKey: string = this.repository.metadata.primaryColumns[0].databaseName;
            const data = await this.repository
                .createQueryBuilder()
                .where(`${primaryKey} IN (:...ids)`, { ids: ids })
                .getMany();

            return { statusCode: 200, status: 'success', data: data };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            return { statusCode: 500, status: 'error', data: [], message };
        }
    }

    /**
     * Executes a custom query on the database.
     */
    async customQuery(query: string): Promise<T[]> {
        try {
            const data = await this.repository
                .createQueryBuilder()
                .where(query)
                .getMany();
            return data;
        } catch (error) {
            console.error(`Error while executing custom query: ${query}`, error);
            return [];
        }
    }
}