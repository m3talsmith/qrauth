import proc from 'node:process';
import { Client } from 'pg';
const env = proc.env;

let instance: Client | undefined;

function connect(): Client {
    if (instance) {
        disconnect();
    }
    instance = new Client(env.DATABASE_URL)
    instance.connect();
    return instance;
}

function disconnect() {
    if (!instance) {
        return;
    }
    instance.end();
    instance = undefined;
}

function connection(): (Client | undefined) {
    return instance;
}

export default { connect, disconnect, connection };