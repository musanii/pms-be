import express, { Application } from 'express';
import { Server } from 'http'; // 1. Import the native HTTP Server type
import { IServerConfig } from '../utils/config';
import * as config from '../server_config.json';

export class ExpressServer {
    // 2. Explicitly type the property to accept the Server instance or null
    private static server: Server | null = null;
    public server_config: IServerConfig = config;

    constructor() {
        const port = this.server_config.port ?? 3000;

        const app = express();
        app.get('/ping', (req, res) => {
            res.send('pong');
        });

        // This assignment will now pass cleanly
        ExpressServer.server = app.listen(port, () => {
            console.log(`Server is running on port ${port} with pid = ${process.pid}`);
        });
    }

    public closeServer(): void {
        // 3. Add a safe type guard check to satisfy TypeScript's strict null checking
        if (ExpressServer.server) {
            ExpressServer.server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        } else {
            console.log('Server was not actively running');
        }
    }
}