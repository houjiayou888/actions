// src/main.ts
import * as core from '@actions/core';
import {glob} from 'glob';
import {promises as fs} from 'fs';
import {basename, join} from 'path';

interface UploadOptions {
    packageName: string;
    artifactPath: string;
    version: string;
    targetDir: string;
    continueOnFailure: boolean;
}

async function findArtifacts(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, {nodir: true});
    });
}


async function uploadFile(filePath: string, targetPath: string): Promise<void> {
    // 实现具体的上传逻辑（示例使用模拟上传）
    const fileStat = await fs.stat(filePath);
    core.info(`↑ Uploading ${basename(filePath)} (${fileStat.size} bytes)...`);

    // 这里替换为实际的上传实现，例如：
    // await http.put(uploadURL, fs.createReadStream(filePath));
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟上传延迟

    core.info(`✓ Successfully uploaded to ${targetPath}`);
}

export async function runUpload(options: UploadOptions): Promise<void> {
    const {packageName, version, targetDir, artifactPath} = options;

    // 解析文件路径
    const artifacts = await findArtifacts(artifactPath);
    if (artifacts.length === 0) {
        throw new Error(`未找到匹配的构建包：${artifactPath}`);
    }

    // 构造目标路径
    const basePath = join(targetDir, packageName, version);

    try {
        await Promise.all(artifacts.map(async (file) => {
            try {

                const fileName = basename(file);
                const targetPath = join(basePath, fileName);
                await uploadFile(file, targetPath);
            } catch (error) {
                if (!options.continueOnFailure) throw error;
                core.warning(`文件上传失败：${error.message}`);
            }
        }));
    } catch (error) {
        throw new Error(`上传失败：${error.message}`);
    }
}

async function run(): Promise<void> {
    try {
        const options: UploadOptions = {
            packageName: core.getInput('name', {required: true}),
            artifactPath: core.getInput('build-path', {required: true}),
            version: core.getInput('version', {required: true}),
            targetDir: core.getInput('target-dir', {required: true}),
            continueOnFailure: core.getBooleanInput('continue-on-failure')
        };

        await runUpload(options);
        core.setOutput('uploaded-files', '成功上传文件');
    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : '未知错误');
    }
}

run();
