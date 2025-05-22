import * as core from '@actions/core';
import { glob } from '@actions/glob';
import { CodeArtsUploader } from './storages/codearts';
import {basename} from "path";

interface UploadOptions {
    packageName: string;
    artifactPattern: string;
    version: string;
    targetDir: string;
    continueOnFailure: boolean;
    codeartsToken: string;
}

export async function runUpload(options: UploadOptions): Promise<{ success: string[]; failed: string[] }> {
    const uploader = new CodeArtsUploader('https://api.codearts.example', options.codeartsToken);
    const results = { success: [] as string[], failed: [] as string[] };

    // 查找文件
    const globber = await glob.create(options.artifactPattern);
    const files = await globber.glob();

    if (files.length === 0) {
        throw new Error(`No artifacts found matching pattern: ${options.artifactPattern}`);
    }

    // 并行上传
    await Promise.all(files.map(async (file) => {
        try {
            const remotePath = `${options.targetDir}/${options.packageName}/${options.version}/${basename(file)}`;
            await uploader.uploadFile(file, remotePath);
            results.success.push(file);
        } catch (error) {
            results.failed.push(file);
            if (!options.continueOnFailure) throw error;
            core.warning(`Upload failed for ${file}: ${error.message}`);
        }
    }));

    return results;
}
