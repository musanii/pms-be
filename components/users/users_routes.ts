import { Express } from 'express';
import { UserController } from './users_controller';

export class UserRoutes {

    private baseEndpoint = '/api/users';

    constructor(app: Express) {

        const controller = new UserController();

        app.route(this.baseEndpoint)
            .get(controller.getHandler)
            .post(controller.addHandler);

        app.route(this.baseEndpoint + '/:id')
            .get(controller.getDetailsHandler)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler);


    }

}