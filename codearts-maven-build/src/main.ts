import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';

export async function run() {
    const workspace = process.env['WORKSPACE'] || process.cwd();
    const platform = os.platform();
    const isWindows = platform === 'win32';
    const rawCommand = core.getInput('maven-command');
    const continueOnFailure = core.getInput('continue-on-failure') === 'true';

    // 自动替换 Windows 下的 mvn -> mvn.cmd
    let execCommand = rawCommand;
    if (isWindows && rawCommand.trim().startsWith('mvn ')) {
        execCommand = rawCommand.replace(/^mvn\b/, 'mvn.cmd');
    }

    try {
        core.info(`当前平台：${platform}`);
        core.info(`当前工作目录：${workspace}`);
        core.info(`检查 Maven 是否可用...`);
        const versionOutput = execSync(isWindows ? 'mvn.cmd -v' : 'mvn -v', { encoding: 'utf-8' });
        core.info(`✅ 当前 Maven 版本：\n${versionOutput}`);

        core.info(`执行命令：${execCommand}`);
        execSync(execCommand, {
            cwd: workspace,
            stdio: 'inherit',
            shell: isWindows ? 'cmd.exe' : '/bin/bash'
        });

    } catch (error: any) {
        const msg = error.message || String(error);
        if (continueOnFailure) {
            core.warning(`构建失败（但继续执行）：${msg}`);
        } else {
            core.setFailed(`Maven 构建失败：${msg}`);
        }
    }
}

run();
