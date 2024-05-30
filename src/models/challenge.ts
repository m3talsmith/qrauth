import { v4 as uuid } from 'uuid';
import db from '../database';

export class Challenge {
    id: string;
    user_id: string;

    constructor() {
        this.id = uuid();
        this.user_id = '';
    }

    static findById(id: string): Promise<Challenge> {
        return new Promise((resolve, reject) => {
            if (!db.connection()) db.connect();
            db.connection()?.query('SELECT * FROM challenges WHERE id=$1', [id], (error, results) => {
                if (error) reject(error);
                if (results.rowCount === 0) reject('Challenge not found');

                let challenge = new Challenge();
                challenge.id = id;
                challenge.user_id = results.rows[0].user_id;
                resolve(challenge);
            });

        });
    }

    create(): Promise<Challenge> {
        return new Promise(async (resolve, reject) => {
            if (!db.connection()) db.connect();
            try {
                const _ = await db.connection()?.query('INSERT INTO challenges(id) VALUES($1) RETURNING *', [this.id]);
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    update(): Promise<Challenge> {
        return new Promise(async (resolve, reject) => {
            if (!db.connection()) db.connect();
            try{
                const _ = await db.connection()?.query('UPDATE challenges SET user_id=$1 WHERE id=$2', [this.user_id, this.id]);
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }
}