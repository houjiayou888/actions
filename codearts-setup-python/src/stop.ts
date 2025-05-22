import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
    try {
        core.info('插件停止中，执行清理操作...');

        const tempDir = path.resolve(process.cwd(), 'temp');

        // 示例清理逻辑：删除一个 temp 临时目录（模拟操作）
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

run();
