import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

async function stop(): Promise<void> {
    try {
        const targetPath = core.getInput('target_path') || '.';
        const resolvedPath = path.resolve(targetPath);

        if (!fs.existsSync(resolvedPath)) {
            core.info(`ℹ️ 路径不存在：${resolvedPath}，无需清理。`);
            return;
        }

        core.info(`🧹 开始清理目录：${resolvedPath}`);
        const platform = os.platform();

        if (platform === 'win32') {
            // Windows 用 cmd 命令删除（防止文件占用问题）
            await require('child_process').execSync(`rmdir /S /Q "${resolvedPath}"`, { stdio: 'ignore' });
        } else {
            // Linux/macOS 使用 rm
            await require('child_process').execSync(`rm -rf "${resolvedPath}"`, { stdio: 'ignore' });
        }

        core.info('✅ 克隆目录已成功删除。');
    } catch (error: any) {
        core.warning(`⚠️ 停止清理失败: ${error.message}`);
    }
}

stop();
