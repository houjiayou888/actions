import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';

function log(msg: string) {
    core.info(`🟢 ${msg}`);
}

function warn(msg: string) {
    core.warning(`⚠️ ${msg}`);
}

async function installNodeOnLinux(version: string): Promise<string> {
    const nvmDir = path.join(os.homedir(), '.nvm');
    const nvmInit = `export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \\ . \"$NVM_DIR/nvm.sh\"`;

    execSync(`[ -d \"$HOME/.nvm\" ] || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`, {
        stdio: 'inherit', shell: '/bin/bash'
    });

    execSync(`${nvmInit} && nvm install ${version}`, { stdio: 'inherit', shell: '/bin/bash' });
    const nodeBin = execSync(`${nvmInit} && which node`, { encoding: 'utf-8', shell: '/bin/bash' }).trim();
    return path.dirname(nodeBin);
}

async function installNodeOnWindows(version: string): Promise<string> {
    try {
        execSync(`choco install -y nodejs --version=${version}`, { stdio: 'inherit' });
        return `C:\\Program Files\\nodejs`;
    } catch (err: any) {
        warn(`安装失败，尝试使用最新版本`);
        execSync(`choco install -y nodejs`, { stdio: 'inherit' });
        return `C:\\Program Files\\nodejs`;
    }
}

export default async function run() {
    try {
        const version = core.getInput('node-version');
        const runnerOS = (process.env.RUNNER_OS || os.platform()).toLowerCase();

        log(`目标 Node.js 版本: ${version}`);
        log(`当前系统: ${runnerOS}`);

        let nodeHome = '';
        if (runnerOS.includes('windows')) {
            nodeHome = await installNodeOnWindows(version);
        } else {
            nodeHome = await installNodeOnLinux(version);
        }

        core.exportVariable('NODE_HOME', nodeHome);
        core.addPath(nodeHome);
        core.setOutput('node-path', nodeHome);

        log(`✅ Node.js 安装成功，路径: ${nodeHome}`);
    } catch (err: any) {
        core.setFailed(`❌ 插件执行失败: ${err.message}`);
    }
}

if (require.main === module) {
    run();
}
