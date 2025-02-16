import Hapi from "@hapi/hapi"
import dotenv from "dotenv"
import Jwt from "@hapi/jwt"
//Token Manager
import TokenManager from "./tokenize/TokenManager.js";
//Auth 
import AuthenticationService from "./services/postgres/AuthenticationService.js";
import AuthenticationsValidator from "./validator/authentications/index.js";
import auth from "./api/authentications/index.js"
// Notes
import NotesServices from "./services/postgres/noteService.js";
import NoteValidator from "./validator/notes/index.js";
import notes from './api/notes/index.js'
// User
import UsersService from "./services/postgres/UsersService.js";
import UsersValidator from "./validator/users/index.js"
import users from './api/users/index.js'

///Error Handling
import ClientError from "./exception/ClientError.js";
import NotFoundError from "./exception/NotFoundError.js";
//dotenf config

dotenv.config()

const init = async () => {

    const notesService = new NotesServices();
    const userService = new UsersService()
    const authenticationsService = new AuthenticationService()



    const server = Hapi.server({
        port: 3000,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*']
            }
        }

    })
    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('notesapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });


    await server.register([
        {
            plugin: notes,
            options: {
                service: notesService,
                validator: NoteValidator
            },
        },
        {
            plugin: users,
            options: {
                service: userService,
                validator: UsersValidator
            }
        },

        {
            plugin: auth,
            options: {
                authenticationsService,
                usersService: userService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator
            }
        }
    ]);
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
        if (response instanceof NotFoundError) {
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
