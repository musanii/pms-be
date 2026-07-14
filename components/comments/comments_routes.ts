import { Express } from 'express'
import { CommentController } from './comments_controller'
export class CommentRoutes {

    private baseEndpoint = '/api/comments';

    constructor(app: Express) {

        const controller = new CommentController();

        app.route(this.baseEndpoint)
            .get(controller.getHandler)
            .post(controller.addHandler);

        app.route(this.baseEndpoint + '/:id')
            .get(controller.getDetailsHandler)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler);


    }

}