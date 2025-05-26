import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';

export async function run(): Promise<void> {
    const version = core.getInput('python-version');
    const commands = core.getInput('commands');
    const continueOnError = core.getInput('continue-on-error')?.toLowerCase() === 'true';

    try {
        const platform = os.platform();
        const arch = os.arch();
        const archLabel = arch.includes('arm') ? 'ARM' : 'x86';
        core.info(`当前系统: ${platform}, 架构: ${archLabel}`);

        // 安装 Python
        switch (platform) {
            case 'linux':
                core.info(`正在安装 Python ${version} ...`);
                execSync(`sudo apt-get update && sudo apt-get install -y python${version}`, { stdio: 'inherit' });
                break;

            case 'darwin':
                core.info(`正在通过 Homebrew 安装 Python ${version} ...`);
                execSync(`brew install python@${version}`, { stdio: 'inherit' });
                break;

            case 'win32':
                core.info(`正在通过 Chocolatey 安装 Python ${version} ...`);
                execSync(`choco install python --version=${version} -y`, { stdio: 'inherit' });
                break;

            default:
                throw new Error(`暂不支持的平台: ${platform}`);
        }

        // 设置环境变量
        const pythonBin = platform === 'win32'
            ? path.join('C:', 'Python' + version.replace('.', ''), 'Scripts')
            : `/usr/bin`;

        core.addPath(pythonBin);
        core.exportVariable('PYTHON_HOME', pythonBin);
        core.info(`PYTHON_HOME 设置为: ${pythonBin}`);

        // 执行命令
        if (commands) {
            core.info(`开始执行用户命令...`);
            execSync(commands, { stdio: 'inherit', shell: platform === 'win32' ? 'cmd.exe' : '/bin/bash' });
        }

        core.setOutput('status', 'success');
    } catch (error: any) {
        core.error(`出错: ${error.message}`);
        if (!continueOnError) {
            core.setFailed(`执行失败: ${error.message}`);
        }
    }
}

if (require.main === module) {
    run();
}
