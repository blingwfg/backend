import { fileURLToPath } from "url";
import path, { dirname } from "path";

const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/images',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    }
  },
  {
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(dirname(fileURLToPath(import.meta.url)), 'file'),
      },
    },
  },

];


export default routes