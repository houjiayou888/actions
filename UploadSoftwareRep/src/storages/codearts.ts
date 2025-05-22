import axios from 'axios';
import { createReadStream } from 'fs';
import { basename } from 'path';
import mime from 'mime-types';

export class CodeArtsUploader {
    constructor(private apiEndpoint: string, private authToken: string) {}

    async uploadFile(localPath: string, remotePath: string): Promise<void> {
        const fileName = basename(localPath);
        const mimeType = mime.lookup(fileName) || 'application/octet-stream';

        await axios.put(
            `${this.apiEndpoint}/upload?path=${encodeURIComponent(remotePath)}`,
            createReadStream(localPath),
            {
                headers: {
                    'Content-Type': mimeType,
                    'Authorization': `Bearer ${this.authToken}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );
    }
}
