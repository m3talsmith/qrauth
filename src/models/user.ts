import db from '../database';

export class User {
    id: string;
    display_name: string;

    constructor() {
        this.id = '';
        this.display_name = '';
    }

    static findById(id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            if (!db.connection()) db.connect();
            db.connection()?.query('SELECT * FROM users WHERE id=$1', [id], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.rows.length < 1) {
                    reject('User not found');
                    return;
                }

                let user = new User();
                user.id = id;
                user.display_name = results.rows[0].display_name;
                resolve(user);
            });

        });
    }

    static findByDisplayName(display_name: string): Promise<User> {
        return new Promise((resolve, reject) => {
            if (!db.connection()) db.connect();
            db.connection()?.query('SELECT * FROM users WHERE display_name=$1', [display_name], (error, results) => {
                if (error) reject(error);
                if (results.rowCount === 0) reject('User not found');

                let user = new User();
                user.id = results.rows[0].id;
                user.display_name = display_name;
                resolve(user);
            });
        });
    }

    static findByIdOrCreate(id: string, userData?: User | undefined): Promise<User> {
        return new Promise(async (resolve, _reject) => {
            try {
                let user = await User.findById(id);
                resolve(user);
            } catch (err) {
                let user = new User();
                user.id = id;
                user.display_name = userData?.display_name || '';
                user = await user.create();
                resolve(user);
            }
        });
    }

    create(): Promise<User> {
        return new Promise(async (resolve, reject) => {
            if (!db.connection()) db.connect();
            try {
                db.connection()?.query('INSERT INTO users(id, display_name) VALUES($1, $2) RETURNING *', [this.id, this.display_name])
                    .then(() => resolve(this))
                    .catch((err) => reject(err));
            } catch (error) {
                reject(error);
            }
        });
    }

    update(): Promise<User> {
        return new Promise(async (resolve, reject) => {
            if (!db.connection()) db.connect();
            try{
                const _ = await db.connection()?.query('UPDATE users SET display_name=$1 WHERE id=$2', [this.display_name, this.id]);
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }
}