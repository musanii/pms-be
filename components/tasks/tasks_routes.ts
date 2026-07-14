import { Express } from 'express';
import { TaskController } from './tasks_controller';
export class TaskRoutes {

    private baseEndpoint = '/api/tasks';

    constructor(app: Express) {

        const controller = new TaskController();

        app.route(this.baseEndpoint)
            .get(controller.getHandler)
            .post(controller.addHandler);

        app.route(this.baseEndpoint + '/:id')
            .get(controller.getDetailsHandler)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler);


    }

}