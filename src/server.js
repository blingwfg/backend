import Hapi from "@hapi/hapi"
import notes from './api/notes/index.js'
import NotesServices from "./services/postgres/noteService.js";
import NoteValidator from "./validator/notes/index.js";
import ClientError from "./exception/ClientError.js";
import dotenv from "dotenv"

dotenv.config()

const init = async () => {

    const notesService = new NotesServices();

    const server = Hapi.server({
        port: 3000,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*']
            }
        }

    })


    await server.register({
        plugin: notes,
        options: {
            service: notesService,
            validator: NoteValidator
        },
    });
    server.ext('onPreResponse', (request, h) => {
        // mendapatkan konteks response dari request
        const { response } = request;

        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        return h.continue;
    });


    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
