import * as core from '@actions/core';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export async function post() {
    try {
        core.info('进入 Maven 构建插件 post 阶段 (stop.ts)');

        const workspace = process.env['WORKSPACE'] || process.cwd();
        const platform = os.platform();

        core.info(`当前工作目录：${workspace}`);
        core.info(`平台类型：${platform}`);

        // 示例：构建状态输出文件（可供后续插件使用）
        const outputFile = path.join(workspace, 'maven-build-status.txt');
        fs.writeFileSync(outputFile, '构建已完成或终止\n', { encoding: 'utf-8' });

        core.info('构建状态文件已写入');

        // 示例：清理构建缓存或临时文件（你可以自定义路径）
        const targetPath = path.join(workspace, 'target');
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
            core.info(`清理构建产物目录: ${targetPath}`);
        }

        core.info('✅ post 阶段执行完成');

    } catch (err: any) {
        core.warning(`post 阶段出错：${err.message}`);
    }
}
