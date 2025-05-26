import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function stop(): Promise<void> {
    try {
        const tmpDir = os.tmpdir();
        const gradlePattern = /^gradle.*\.(zip|part|tmp)$/i;

        core.info(`🔍 正在检查临时目录：${tmpDir} 中的 Gradle 残留文件...`);

        const files = fs.readdirSync(tmpDir);
        let removed = 0;

        for (const file of files) {
            if (gradlePattern.test(file)) {
                const fullPath = path.join(tmpDir, file);
                try {
                    fs.unlinkSync(fullPath);
                    removed++;
                    core.info(`🧹 已删除文件: ${fullPath}`);
                } catch (err) {
                    core.warning(`⚠️ 删除失败: ${fullPath} - ${err}`);
                }
            }
        }

        if (removed === 0) {
            core.info('✅ 未发现需清理的 Gradle 临时文件');
        } else {
            core.info(`✅ 清理完成，共删除 ${removed} 个文件`);
        }
    } catch (err: any) {
        core.warning(`❗stop 脚本执行异常: ${err.message}`);
    }
}
