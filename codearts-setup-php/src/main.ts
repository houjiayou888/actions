import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';

export async function run(): Promise<void> {
    const version = core.getInput('php-version');
    const commands = core.getInput('commands');
    const continueOnError = core.getInput('continue-on-error')?.toLowerCase() === 'true';

    try {
        const platform = os.platform();
        core.info(`当前系统平台: ${platform}`);
        core.info(`准备安装 PHP ${version}...`);

        if (platform === 'linux') {
            execSync(`sudo apt-get update && sudo apt-get install -y php${version}`, { stdio: 'inherit' });
        } else if (platform === 'darwin') {
            execSync(`brew install php@${version}`, { stdio: 'inherit' });
        } else if (platform === 'win32') {
            execSync(`choco install php --version=${version} -y`, { stdio: 'inherit' });
        } else {
            throw new Error(`不支持的平台: ${platform}`);
        }

        const phpBin = platform === 'win32'
            ? path.join('C:', 'tools', `php${version}`, 'php.exe')
            : '/usr/bin/php';

        core.addPath(path.dirname(phpBin));
        core.exportVariable('PHP_HOME', path.dirname(phpBin));

        core.info(`PHP 安装成功，环境变量已设置。`);

        if (commands) {
            core.info('开始执行构建命令...');
            execSync(commands, { stdio: 'inherit', shell: platform === 'win32' ? 'cmd.exe' : '/bin/bash' });
        }

        core.setOutput('status', 'success');
    } catch (error: any) {
        core.error(`出错：${error.message}`);
        if (!continueOnError) {
            core.setFailed(`执行失败：${error.message}`);
        }
    }
}

if (require.main === module) {
    run();
}
