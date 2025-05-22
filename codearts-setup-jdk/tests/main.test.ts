// 导入被测试模块所需的依赖
import * as core from '@actions/core';       // CodeArts Actions 核心库（用于设置环境变量、输出等）
import * as child_process from 'child_process';  // 执行系统命令
import * as fs from 'fs';                    // 文件系统操作

// 使用 Jest 模拟相关模块，避免真实执行系统命令或文件读写
jest.mock('@actions/core');
jest.mock('child_process');
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
// 将 execSync 模拟为一个 jest.Mock 实例
const mockedExecSync = child_process.execSync as jest.Mock;
// 将 fs 模块整体模拟为一个 jest.Mocked<typeof fs>
const mockedFs = fs as jest.Mocked<typeof fs>;

// 开始测试套件
describe('setupjdk plugin', () => {
    beforeEach(() => {
        // 每次测试前重置所有 mock 的调用记录
        jest.clearAllMocks();
        // 设置默认运行环境为 Linux
        process.env.RUNNER_OS = 'Linux';
    });

    /**
     * 测试用例：在 Linux 平台上安装 JDK 并正确设置 JAVA_HOME
     */
    it('should install JDK on Linux and set JAVA_HOME', async () => {
        // 模拟用户输入的 JDK 版本为 '17'
        mockedCore.getInput.mockReturnValue('17');

        // 模拟 SDKMAN! 安装目录存在（即已安装）
        mockedFs.existsSync.mockReturnValue(true);

        // 模拟执行命令时返回指定结果
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd.includes('echo $JAVA_HOME')) {
                return '/usr/lib/jvm/java-17'; // 返回模拟的 JAVA_HOME 路径
            }
            return ''; // 其他命令不返回内容
        });

        // 动态导入 main.ts 的 default 函数（即 run 函数）
        const {default: run} = await import('../src/main');
        await run(); // 执行插件主逻辑

        // 验证是否设置了正确的 JAVA_HOME 环境变量
        expect(mockedCore.exportVariable).toHaveBeenCalledWith('JAVA_HOME', '/usr/lib/jvm/java-17');
        // 验证是否设置了 jdk-path 输出参数
        expect(mockedCore.setOutput).toHaveBeenCalledWith('jdk-path', '/usr/lib/jvm/java-17');
        // 验证没有调用 core.setFailed（即未发生错误）
        expect(mockedCore.setFailed).not.toHaveBeenCalled();
    });

    /**
     * 测试用例：当执行过程中出现异常时，应正确捕获并调用 setFailed
     */
    it('should handle errors gracefully', async () => {
        // 模拟用户输入的 JDK 版本为 '17'
        mockedCore.getInput.mockReturnValue('17');

        // 模拟 execSync 抛出异常，模拟命令执行失败
        mockedExecSync.mockImplementation(() => {
            throw new Error('test error');
        });

        // 动态导入 run 函数并执行
        const {default: run} = await import('../src/main');
        await run();

        // 验证是否调用了 core.setFailed，并且消息包含 "test error"
        expect(mockedCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('test error'));
    });

    /**
     * 测试用例：在 Windows 平台上安装 JDK 并正确设置 JAVA_HOME
     */
    it('should install JDK on Windows and set JAVA_HOME', async () => {
        // 设置运行环境为 Windows
        process.env.RUNNER_OS = 'Windows';

        // 模拟用户输入的 JDK 版本为 '17'
        mockedCore.getInput.mockReturnValue('17');

        // 模拟 Chocolatey 命令执行成功（无抛错）
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd.includes('choco')) return ''; // 忽略 choco 命令输出
            return '';
        });

        // 动态导入 run 函数并执行
        const {default: run} = await import('../src/main');
        await run();

        // 预期的 JDK 安装路径
        const expectedPath = 'C:\\Program Files\\Java\\jdk-17';

        // 验证是否设置了正确的 JAVA_HOME 环境变量
        expect(mockedCore.exportVariable).toHaveBeenCalledWith('JAVA_HOME', expectedPath);
        // 验证是否设置了 jdk-path 输出参数
        expect(mockedCore.setOutput).toHaveBeenCalledWith('jdk-path', expectedPath);
        // 验证没有调用 core.setFailed（即未发生错误）
        expect(mockedCore.setFailed).not.toHaveBeenCalled();
    });
});
