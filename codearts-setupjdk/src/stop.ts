// 引入必要的模块
import * as core from '@actions/core'; // GitHub Actions / CodeArts 插件核心 API
import * as os from 'os';             // Node.js 操作系统模块，用于获取系统信息
import * as path from 'path';         // 路径处理模块，用于构建文件路径
import * as fs from 'fs';             // 文件系统模块，用于判断文件/目录是否存在

/**
 * 输出普通日志（黄色图标 + stop 标识）
 */
function logInfo(msg: string) {
    core.info(`🟡 [stop] ${msg}`);
}

/**
 * 输出错误日志（红色图标 + stop 标识）
 */
function logError(msg: string) {
    core.error(`🔴 [stop] ${msg}`);
}

/**
 * 插件终止处理函数
 * 在插件被取消、失败或收到中断信号时调用
 */
export async function stop() {
    try {
        // 获取当前运行环境的操作系统类型（Linux/macOS/Windows）
        const runnerOS = (process.env.RUNNER_OS || os.platform()).toLowerCase();
        logInfo(`检测到插件终止，系统: ${runnerOS}`);

        // 定义 SDKMAN! 的安装目录路径（仅适用于 Linux/macOS）
        const sdkmanDir = path.join(os.homedir(), '.sdkman');

        // 如果 SDKMAN! 目录不存在，则无需清理
        if (!fs.existsSync(sdkmanDir)) {
            logInfo('未检测到 SDKMAN，无需清理');
            return;
        }

        // 如果存在 SDKMAN! 安装目录，记录相关信息
        logInfo(`SDKMAN 安装目录存在：${sdkmanDir}`);

        // ✅ 当前仅输出日志，后续可扩展实际清理逻辑（如删除临时文件等）

        logInfo('插件中止处理完成 ✅');
    } catch (err: any) {
        // 捕获并记录异常信息
        logError(`中止处理失败: ${err.message}`);
        core.setFailed(`插件终止失败: ${err.message}`);
    }
}

// === 仅 CLI 执行时自动运行（测试时不触发）===
// 支持通过 node stop.ts 直接运行该脚本
if (require.main === module) {
    stop();
}
