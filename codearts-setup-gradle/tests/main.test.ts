import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import { run } from '../src/main';
import * as path from 'path';
import { execSync } from 'child_process';

jest.mock('@actions/core');
jest.mock('@actions/tool-cache');
jest.mock('os');
jest.mock('child_process');

const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockAddPath = core.addPath as jest.Mock;
const mockExportVariable = core.exportVariable as jest.Mock;
const mockExecSync = execSync as jest.Mock;

describe('setup-gradle', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'gradle-version': return '8.4';
                case 'commands': return 'gradle -v';
                case 'continue-on-error': return 'false';
                default: return '';
            }
        });

        (tc.downloadTool as jest.Mock).mockResolvedValue('/tmp/gradle.zip');
        (tc.extractZip as jest.Mock).mockResolvedValue('/tmp/gradle-unzip');

        mockExecSync.mockImplementation(() => {});
    });


    it('应在 Linux 安装 Gradle 并设置路径', async () => {
        (os.platform as jest.Mock).mockReturnValue('linux');

        await run();

        const expectedBin = path.join('/tmp/gradle-unzip', 'gradle-8.4', 'bin');
        const expectedHome = path.join('/tmp/gradle-unzip', 'gradle-8.4');

        expect(mockAddPath).toHaveBeenCalledWith(expectedBin);
        expect(mockExportVariable).toHaveBeenCalledWith('GRADLE_HOME', expectedHome);
        expect(mockExecSync).toHaveBeenCalledWith('gradle -v', expect.any(Object));
        expect(mockSetOutput).toHaveBeenCalledWith('status', 'success');
    });

    it('构建命令出错时应调用 setFailed', async () => {
        (os.platform as jest.Mock).mockReturnValue('linux');
        mockExecSync.mockImplementationOnce(() => {
            throw new Error('模拟构建失败');
        });

        await run();

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('执行失败'));
    });

    it('在 Windows 下安装 Gradle 时应正确设置路径', async () => {
        (os.platform as jest.Mock).mockReturnValue('win32');

        await run();

        const expectedBin = path.join('/tmp/gradle-unzip', 'gradle-8.4', 'bin');
        expect(mockAddPath).toHaveBeenCalledWith(expectedBin);
        expect(mockExportVariable).toHaveBeenCalledWith('GRADLE_HOME', path.join('/tmp/gradle-unzip', 'gradle-8.4'));
    });
});
