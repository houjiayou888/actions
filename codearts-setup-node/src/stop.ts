import * as core from '@actions/core';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export async function stop() {
    try {
        const runnerOS = (process.env.RUNNER_OS || os.platform()).toLowerCase();
        core.info(`[stop] 当前系统: ${runnerOS}`);

        const nvmDir = path.join(os.homedir(), '.nvm');
        if (fs.existsSync(nvmDir)) {
            core.info(`[stop] 检测到 NVM 目录: ${nvmDir}`);
        } else {
            core.info('[stop] 未检测到 NVM，跳过清理');
        }
    } catch (err: any) {
        core.setFailed(`[stop] 插件终止处理失败: ${err.message}`);
    }
}

if (require.main === module) {
    stop();
}
