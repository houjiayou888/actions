import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as path from 'path';
import * as fs from 'fs-extra';
import {exec} from '@actions/exec';
import os from "os";

export async function run(): Promise<void> {
    try {
        const version = core.getInput('maven_version');
        const installDir = await installMaven(version);
        await configureEnvironment(installDir);
    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

export async function installMaven(version: string): Promise<string> {
    const platform = os.platform();
    const isWindows = platform === 'win32';
    let url = '';
    if (isWindows) {
        url = `https://dlcdn.apache.org/maven/maven-3/${version}/binaries/apache-maven-${version}-bin.zip`;
    } else {
        url = `https://dlcdn.apache.org/maven/maven-3/${version}/binaries/apache-maven-${version}-bin.tar.gz`;
    }
    const dirPath = path.join(__dirname, '..', 'download', 'maven-3', version, 'binaries');
    try {
        // 检查目录是否存在
        await fs.access(dirPath);
        console.log('目录已存在');
    } catch {
        try {
            // 不存在则创建
            await fs.mkdir(dirPath, {recursive: true});
            console.log('目录创建成功');
        } catch (err) {
            console.error('无法创建目录:', err);
        }
    }
    const filename = `apache-maven-${version}-bin.zip`;
    core.info(`Downloading Maven ${version} from ${url}`);
    const downloadPath = path.join(dirPath, filename)
    const downloadPath2 = await tc.downloadTool(url, downloadPath);
    console.log(`文件下载到: ${downloadPath2}`);
    core.info('Extracting Maven...');
    const extractDir = await tc.extractTar(downloadPath2, 'maven');
    const toolRoot = path.join(extractDir, `apache-maven-${version}`);

    // todo 需要环境变量 RUNNER_TOOL_CACHE
    // const cacheDir = await tc.cacheDir(toolRoot, 'maven', version);
    return toolRoot;
}

export async function configureEnvironment(installDir: string): Promise<void> {
    const m2Home = path.join(installDir, 'bin');
    core.addPath(m2Home);
    core.exportVariable('M2_HOME', installDir);

    // Verify installation
    await exec('mvn', ['-version']);
}

// Run the main function when executed directly
if (require.main === module) {
    run();
}
