import { Repository } from 'typeorm';
import { BaseService} from '../../utils/base_service';
import { DatabaseUtil} from '../../utils/db';
import { Roles } from './roles_entity';

export class RolesService extends BaseService<Roles> {

    constructor(){

        const databaseUtil = new DatabaseUtil();

        const roleRepository: Repository<Roles> = databaseUtil.getRepository(Roles);

        super(roleRepository);

    }

}