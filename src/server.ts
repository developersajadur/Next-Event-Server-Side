import { Server } from 'http';
import app from './app';
import config from './app/config';

const port = config.port || 5000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log('Sever is running on port:', port);
  });
}

main();
