import pg from "pg"

const { Pool } = pg

class CollaborationsService {
    constructor() {
        this._pool = new Pool({
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
        })
    }

    async addCollaboration(noteId, userId) {
        const id = `collab-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, noteId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async deleteCollaboration(noteId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE note_id = $1 AND user_id = $2 RETURNING id',
            values: [noteId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }
    async verifyCollaborator(noteId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE note_id = $1 AND user_id = $2',
            values: [noteId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal diverifikasi');
        }
    }
}

export default CollaborationsService