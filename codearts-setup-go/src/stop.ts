import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 执行插件停止时的清理逻辑
 */
export async function stop(): Promise<void> {
    try {
        core.info('插件停止中，执行清理操作...');

        const tempDir = path.resolve(process.cwd(), 'temp');

        // 示例：清理临时目录
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            core.info(`已删除临时目录: ${tempDir}`);
        } else {
            core.info('未发现需要清理的目录。');
        }

        core.info('清理完成。');
    } catch (error) {
        core.error(`清理失败: ${error instanceof Error ? error.message : error}`);
    }
}
