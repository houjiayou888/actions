import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { run } from '../src/main';

jest.mock('@actions/core');
jest.mock('child_process');
jest.mock('os');

const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockAddPath = core.addPath as jest.Mock;
const mockExportVariable = core.exportVariable as jest.Mock;
const mockExecSync = execSync as jest.Mock;

describe('setup-php action', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'php-version': return '8.2';
                case 'commands': return 'php -v';
                case 'continue-on-error': return 'false';
                default: return '';
            }
        });

        mockExecSync.mockImplementation(() => {}); // 模拟命令成功执行
    });

    it('应在 Linux 安装 PHP 并设置环境变量', async () => {
        (os.platform as jest.Mock).mockReturnValue('linux');

        await run();

        expect(mockExecSync).toHaveBeenCalledWith(
            expect.stringContaining('apt-get install -y php8.2'),
            expect.any(Object)
        );
        expect(mockAddPath).toHaveBeenCalledWith('/usr/bin');
        expect(mockExportVariable).toHaveBeenCalledWith('PHP_HOME', '/usr/bin');
        expect(mockExecSync).toHaveBeenCalledWith('php -v', expect.any(Object));
        expect(mockSetOutput).toHaveBeenCalledWith('status', 'success');
    });

    it('应在 macOS 使用 brew 安装 PHP', async () => {
        (os.platform as jest.Mock).mockReturnValue('darwin');

        await run();

        expect(mockExecSync).toHaveBeenCalledWith(
            expect.stringContaining('brew install php@8.2'),
            expect.any(Object)
        );
    });

    it('应在 Windows 使用 choco 安装 PHP 并设置路径', async () => {
        (os.platform as jest.Mock).mockReturnValue('win32');

        await run();

        const expectedPath = path.join('C:', 'tools', 'php8.2');
        expect(mockExecSync).toHaveBeenCalledWith(
            expect.stringContaining('choco install php --version=8.2'),
            expect.any(Object)
        );
        expect(mockAddPath).toHaveBeenCalledWith(expectedPath);
        expect(mockExportVariable).toHaveBeenCalledWith('PHP_HOME', expectedPath);
    });

    it('构建失败时应调用 setFailed', async () => {
        mockExecSync.mockImplementation(() => {
            throw new Error('模拟构建失败');
        });
        (os.platform as jest.Mock).mockReturnValue('linux');

        await run();

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('执行失败'));
    });
});
