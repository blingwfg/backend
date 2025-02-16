import UserHandler from "./handler.js"
import routes from "./routes.js"

const pluginModel = {
    name: 'users',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const usersHandler = new UserHandler(service, validator)
        server.route(routes(usersHandler))
    }
}


export default pluginModel;