
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
class StorageService {
    constructor() {
        this._S3 = new S3Client({
            region: "US",
            endpoint: "https://is3.cloudhost.id",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    async writeFile(file, meta) {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: meta.filename,
            Body: file._data,
            ContentType: meta.headers["content-type"],
        });

        await this._S3.send(command);
        return this.createPreSignedUrl({
            bucket: process.env.AWS_BUCKET_NAME,
            key: meta.filename,
        });
    }
    async createPreSignedUrl({ bucket, key }) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        return getSignedUrl(this._S3, command, { expiresIn: 3600 });
    }



}


export default StorageService;