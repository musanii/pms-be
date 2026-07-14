import { Express } from 'express'
import { ProjectController } from './projects_controller'
export class ProjectRoutes {

    private baseEndpoint = '/api/projects';

    constructor(app: Express) {

        const controller = new ProjectController();

        app.route(this.baseEndpoint)
            .get(controller.getHandler)
            .post(controller.addHandler);

        app.route(this.baseEndpoint + '/:id')
            .get(controller.getDetailsHandler)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler);


    }

}