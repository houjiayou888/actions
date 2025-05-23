import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';

export  async function run(): Promise<void> {
    const version = core.getInput('python-version');
    const commands = core.getInput('commands');
    const continueOnError = core.getInput('continue-on-error')?.toLowerCase() === 'true';

    try {
        const arch = os.arch();
        const archLabel = arch.includes('arm') ? 'ARM' : 'x86';
        core.info(`当前服务器架构: ${archLabel}`);

        core.info(`正在安装 Python ${version} ...`);
        execSync(`sudo apt-get update && sudo apt-get install -y python${version}`, { stdio: 'inherit' });

        core.info(`开始执行用户命令...`);
        execSync(commands, { stdio: 'inherit', shell: '/bin/bash' });

        core.setOutput('status', 'success');
    } catch (error: any) {
        core.error(`出错: ${error.message}`);
        if (!continueOnError) {
            core.setFailed(`执行失败: ${error.message}`);
        }
    }
}

// 如果是直接运行脚本，则执行
if (require.main === module) {
    run();
}
