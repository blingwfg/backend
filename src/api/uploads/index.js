import UploadHandler from "./handler.js"
import routes from "./routes.js"

const pluginModel = {
    name: 'uploads',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const uploadHandler = new UploadHandler(service, validator)
        server.route(routes(uploadHandler))
    }
}


export default pluginModel;