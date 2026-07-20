import { Response, Request } from 'express';
import { RolesService } from './roles_service';
import { BaseController } from '../../utils/base_controller';
import { Rights } from '../../utils/common';

export class RoleController extends BaseController {

    public async addHandler(req: Request, res: Response): Promise<void> {
        try {
            const role = req.body;
            const service = new RolesService();
            const result = await service.create(role);

            res.status(result.statusCode).json(result);
        } catch (error) {
            // Apply your type-safe error handling block here!
            if (error instanceof Error) {
                console.error(`Error in addHandler => ${error.message}`);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            } else {
                console.error('An unexpected controller error occurred:', error);
                res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred.'
                });
            }
        }
    }

    public async getAllHandler(req: Request, res: Response): Promise<void> {
        try {
            const service = new RolesService();
            const result = await service.findAll(req.query);
            res.status(result.statusCode).json(result)

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error in addHandler => ${error.message}`);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            } else {
                console.error('An unexpected controller error occurred:', error);
                res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred.'
                });
            }

        }
    }

    public async getOneHandler(req: Request, res: Response): Promise<void> {

        try {
            const service = new RolesService();
            const result = await service.findOne(req.params.id);
            res.status(res.statusCode).json(result);

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error in addHandler => ${error.message}`);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            } else {
                console.error('An unexpected controller error occurred:', error);
                res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred.'
                });
            }

        }

    }

    public async updateHandler(req: Request, res: Response) {
        try {
            const role = req.body;
            const service = new RolesService();
            const result = await service.update(req.params.id, role);
            res.status(result.statusCode).json(result);

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error in addHandler => ${error.message}`);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            } else {
                console.error('An unexpected controller error occurred:', error);
                res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred.'
                });
            }


        }

    }

    public async deleteHandler(req: Request, res: Response) {

        try {
            const service = new RolesService();
            const result = await service.delete(req.params.id);
            res.status(result.statusCode).json(result);

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error in addHandler => ${error.message}`);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            } else {
                console.error('An unexpected controller error occurred:', error);
                res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred.'
                });
            }

        }

    }
}

export class RolesUtil {

    /**
     * Retrieves all the possible permissions from the defined rights
     * in the Rights object
     * @returns {string[]} An array of permissions
     */
    public static getAllPermissionsFromRights(): string[] {
        let permissions: string[] = [];

        for (const module in Rights) {
            // 1. Ensure we check if the module property is active
            if (Rights[module] && Rights[module]['ALL']) {
                // 2. FIXED: Removed the quotes around 'module' so it uses the loop variable
                let sectionValues = Rights[module]['ALL'];
                sectionValues = sectionValues.split(',');
                permissions = [...permissions, ...sectionValues];
            }
        }

        return permissions;
    }

    public static async checkValidRoleIds(role_ids: string[]) {
        const roleService = new RolesService();
        // Query the database to check if all role_ids are valid
        const roles = await roleService.findByIds(role_ids);
        // Check if all role_ids are found in the database
        return roles.data.length === role_ids.length;
    }
}