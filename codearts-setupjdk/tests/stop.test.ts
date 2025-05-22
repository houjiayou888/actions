// 导入依赖模块
import * as core from '@actions/core'; // CodeArts Actions 核心库（用于日志、设置变量等）
import * as fs from 'fs';              // Node.js 文件系统模块
import * as os from 'os';              // 操作系统模块
import * as path from 'path';          // 路径处理模块

// 使用 Jest 模拟核心模块，防止真实执行操作
jest.mock('@actions/core');
jest.mock('fs', () => {
    const originalModule = jest.requireActual('fs');
    return {
        ...originalModule,
        promises: {
            access: jest.fn(), // 模拟 fs.promises.access 方法
            // 其他方法可继续添加
        },
        existsSync: jest.fn() // 模拟 fs.existsSync
    };
});
// 类型断言为 Mocked<typeof core>，以便使用 mockReturnValue 等方法
const mockedCore = core as jest.Mocked<typeof core>;
// 类型断言为 Mocked<typeof fs>，以便模拟文件系统行为
const mockedFs = fs as jest.Mocked<typeof fs>;

// 开始测试套件
describe('stop.ts plugin', () => {
    beforeEach(() => {
        // 每次测试前重置所有 mock 的调用记录
        jest.clearAllMocks();
    });

    /**
     * 测试用例：当 SDKMAN! 未安装时，应跳过清理流程并输出提示信息
     */
    it('should skip cleanup if sdkman is not installed', async () => {
        // 模拟 fs.existsSync 返回 false，表示 SDKMAN! 未安装
        mockedFs.existsSync.mockReturnValue(false);

        // 动态导入 stop 函数并执行
        const { stop } = await import('../src/stop');
        await stop();

        // 验证是否输出了“未检测到 SDKMAN”相关信息
        expect(mockedCore.info).toHaveBeenCalledWith(
            expect.stringContaining('未检测到 SDKMAN')
        );

        // 验证没有触发错误处理
        expect(mockedCore.setFailed).not.toHaveBeenCalled();
    });

    /**
     * 测试用例：当 SDKMAN! 已安装时，应记录其安装路径
     */
    it('should log sdkman path if installed', async () => {
        // 模拟 fs.existsSync 返回 true，表示 SDKMAN! 已存在
        mockedFs.existsSync.mockReturnValue(true);

        // 动态导入 stop 函数并执行
        const { stop } = await import('../src/stop');
        await stop();

        // 验证是否输出了“SDKMAN 安装目录存在”相关信息
        expect(mockedCore.info).toHaveBeenCalledWith(
            expect.stringContaining('SDKMAN 安装目录存在')
        );

        // 验证没有触发错误处理
        expect(mockedCore.setFailed).not.toHaveBeenCalled();
    });

    /**
     * 测试用例：当中止处理过程中出现异常时，应正确捕获并调用 setFailed
     */
    it('should handle unexpected error', async () => {
        // 模拟 fs.existsSync 抛出异常，模拟意外错误发生
        mockedFs.existsSync.mockImplementation(() => {
            throw new Error('mocked error');
        });

        // 动态导入 stop 函数并执行
        const { stop } = await import('../src/stop');
        await stop();

        // 验证是否调用了 core.setFailed，并且消息包含 "mocked error"
        expect(mockedCore.setFailed).toHaveBeenCalledWith(
            expect.stringContaining('mocked error')
        );
    });
});
