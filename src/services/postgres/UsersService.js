import pg from "pg"
const { Pool } = pg
import InvariantError from "../../exception/InvariantError.js"
import { nanoid } from "nanoid"
import bcrypt from "bcrypt"
import NotFoundError from "../../exception/NotFoundError.js"
import AuthenticationError from "../../exception/AuthenticationError.js"
class UsersService {
    constructor() {
        this._pool = new Pool({
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
        })
    }


    async addUser({ username, password, fullname }) {
        await this.verifyNewUsername(username)
        const id = `user-${nanoid(16)}`

        const hashedPassword = await bcrypt.hash(password, 8)

        const query = {
            text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id",
            values: [id, username, hashedPassword, fullname]
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new InvariantError('User gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        };

        const result = await this._pool.query(query);
        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
        }
    }


    async getUserById(userId) {
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [userId],
        };

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan');

        }
        return result.rows[0]
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        return id;
    }
}


export default UsersService