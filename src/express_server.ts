import express from 'express';
import { Server } from 'http'; // Import the Server type from Node's http module
import { IServerConfig } from '../utils/config';
import * as config from '../server_config.json';
import { Routes } from './routes';
import  * as bodyParser  from 'body-parser';

export class ExpressServer {
    // Corrected: Explicitly define the type as Server or null
    private static server: Server | null = null;
    
    public server_config: IServerConfig = config;

    constructor() {
        const port = this.server_config.port ?? 3000;
        const app = express();

         app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
       

        app.get('/ping', (req, res) => {
            res.send('pong');
        });

        const routes = new Routes(app);

        if(routes) {
            console.log('Server Routes started for server');
        }

        ExpressServer.server = app.listen(port, () => {
            console.log(`Server is running on port ${port} with pid = ${process.pid}`);
        });
    }

    // Close the express server safely
    public closeServer(): void {
        // Added a safety check to ensure server is not null before calling close()
        if (ExpressServer.server) {
            ExpressServer.server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        } else {
            console.log('No server running to close.');
            process.exit(0);
        }
    }
}