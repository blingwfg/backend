import Hapi from "@hapi/hapi"
import dotenv from "dotenv"
import Jwt from "@hapi/jwt"
import inert from "@hapi/inert"

//Libs
import { fileURLToPath } from "url"
import path, { dirname } from "path"

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

//Collaborations 
import CollaborationsService from "./services/postgres/AuthenticationService.js";
import collaborations from "./api/collaborations/index.js"
import CollaborationsValidator from "./validator/collaborations/index.js"

//Exports
import ExportsValidator from "./validator/exports/index.js";
import exportsService from "./services/RabbitMQ/procedurService.js";
import _exports from "./api/exports/index.js"

//Uploads
import uploads from "./api/uploads/index.js";
import StorageService from "./services/S3/storageService.js";
import uploadvalidator from "./validator/uploads/index.js"

//Cache
import CacheService from "./services/redis/cacheService.js";
//dotenf config
dotenv.config()

const init = async () => {
    const cacheService = new CacheService()
    const collaborationsService = new CollaborationsService(cacheService);
    const notesService = new NotesServices(collaborationsService, cacheService);
    const userService = new UsersService()
    const authenticationsService = new AuthenticationService()
    const storageService = new StorageService()

    const server = Hapi.server({
        port: 3000,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*']
            }
        },
        // debug: {
        //     request: ['error']
        // }


    })
    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: inert
        }
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
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                notesService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                service: exportsService,
                validator: ExportsValidator,
            },
        },
        {
            plugin: uploads,
            options: {
                service: storageService,
                validator: uploadvalidator,
            },
        },
    ]);
    server.ext('onPreResponse', (request, h) => {
        // mendapatkan konteks response dari request
        const { response } = request;
        // console.log(response)
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
