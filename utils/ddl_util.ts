import { Roles } from '../components/roles/roles_entity';
import { RolesUtil } from '../components/roles/roles_controller';
import { v4 } from 'uuid';
import { RolesService } from '../components/roles/roles_service';
import { UsersService } from '../components/users/users_service';
import { Users } from '../components/users/users_entity';
import * as config from '../server_config.json';
import { encryptString } from './common';

export class DDLUtil {

    public static async getSuperAdminRoleId(): Promise<string | null> {
        try {
            const rolesService = new RolesService();
            const existingRoles = await rolesService.findAll({ name: 'SuperAdmin' });

            console.log('[DEBUG] findAll SuperAdmin result:', JSON.stringify(existingRoles, null, 2));

            if (existingRoles && existingRoles.data && existingRoles.data.length > 0) {
                // Ensure we handle both Object property 'role_id' and direct database column name
                const role = existingRoles.data[0] as any;
                const foundId = role.role_id || role.id;
                console.log('[DEBUG] Resolved SuperAdmin Role ID:', foundId);
                return foundId;
            }

            console.log('[DEBUG] SuperAdmin role not found via findAll. Attempting to create...');
            const created = await this.addDefaultRole();
            if (created) {
                const retryRoles = await rolesService.findAll({ name: 'SuperAdmin' });
                if (retryRoles && retryRoles.data && retryRoles.data.length > 0) {
                    const role = retryRoles.data[0] as any;
                    return role.role_id || role.id;
                }
            }

            return null;
        } catch (err) {
            console.error('[DEBUG] Error inside getSuperAdminRoleId:', err);
            return null;
        }
    }

    public static async addDefaultRole(): Promise<{ success: boolean; roleId?: string }> {
        try {
            const service = new RolesService();
            const rights = RolesUtil.getAllPermissionsFromRights();
            const roleId = v4();

            const role: Roles = {
                role_id: roleId,
                name: 'SuperAdmin',
                description: 'Admin with having all permission',
                rights: rights.join(','),
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await service.create(role);
            console.log('Add Default Role Result', result);

            if (result.statusCode === 201 && result.data) {
                const returnedRole = result.data as any;
                return { success: true, roleId: returnedRole.role_id || roleId };
            }

            if (result.statusCode === 409) {
                const fetchedId = await this.getSuperAdminRoleId();
                return { success: true, roleId: fetchedId || undefined };
            }

            return { success: false };
        } catch (error) {
            const message = error instanceof Error ? error.message : error;
            console.error(`Error while addDefaultRole() => ${message}`);
            return { success: false };
        }
    }

    public static async addDefaultUser(explicitRoleId?: string): Promise<boolean> {
        try {
            // Use explicit roleId if passed, otherwise query database
            const roleId = explicitRoleId || (await this.getSuperAdminRoleId());

            console.log('[DEBUG] Role ID being passed to User creation:', roleId);

            if (!roleId) {
                console.error('ERROR: role_id is null/undefined. Aborting user creation.');
                return false;
            }

            const service = new UsersService();

            const user: Users = {
                user_id: v4(),
                fullname: 'Super Admin',
                username: 'superadmin',
                email: config.default_user.email,
                password: await encryptString(config.default_user.password),
                role_id: roleId,
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await service.create(user);
            console.log('Add Default User Result', result);

            if (result.statusCode === 201 || result.statusCode === 409) {
                return true;
            }
            return false;
        } catch (error) {
            const message = error instanceof Error ? error.message : error;
            console.error(`Error while addDefaultUser() => ${message}`);
            return false;
        }
    }

    /**
     * Unified master runner to ensure strict sequence execution
     */
    public static async runSeed(): Promise<void> {
        console.log('--- Starting Seed Process ---');
        const roleResult = await this.addDefaultRole();
        
        if (roleResult.roleId) {
            console.log('Role ready with ID:', roleResult.roleId);
            await this.addDefaultUser(roleResult.roleId);
        } else {
            console.error('Failed to resolve Role ID. Cannot proceed to create user.');
        }
        console.log('--- Seed Process Finished ---');
    }
}