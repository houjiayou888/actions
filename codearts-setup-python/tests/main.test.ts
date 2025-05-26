import * as core from '@actions/core';
import * as os from 'os';
import { execSync } from 'child_process';
import { run } from '../src/main';
import * as path from 'path';

// Mock 所需模块
jest.mock('@actions/core');
jest.mock('os');
jest.mock('child_process');

const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockAddPath = core.addPath as jest.Mock;
const mockExportVariable = core.exportVariable as jest.Mock;
const mockInfo = core.info as jest.Mock;
const mockError = core.error as jest.Mock;
const mockExecSync = execSync as jest.Mock;

describe('setup-python cross-platform', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'python-version': return '3.10';
                case 'commands': return 'echo Hello';
                case 'continue-on-error': return 'false';
                default: return '';
            }
        });

        mockSetOutput.mockImplementation(() => {});
        mockSetFailed.mockImplementation(() => {});
        mockExportVariable.mockImplementation(() => {});
    });

    it('should install Python on Linux x64', async () => {
        (os.platform as jest.Mock).mockReturnValue('linux');
        (os.arch as jest.Mock).mockReturnValue('x64');

        await run();

        expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('当前系统: linux'));
        expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('apt-get install -y python3.10'), expect.any(Object));
        expect(mockAddPath).toHaveBeenCalledWith('/usr/bin');
        expect(mockExportVariable).toHaveBeenCalledWith('PYTHON_HOME', '/usr/bin');
    });

    it('should install Python on macOS ARM', async () => {
        (os.platform as jest.Mock).mockReturnValue('darwin');
        (os.arch as jest.Mock).mockReturnValue('arm64');

        await run();

        expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('当前系统: darwin'));
        expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('brew install python@3.10'), expect.any(Object));
        expect(mockAddPath).toHaveBeenCalledWith('/usr/bin');
        expect(mockExportVariable).toHaveBeenCalledWith('PYTHON_HOME', '/usr/bin');
    });

    it('should install Python on Windows x86', async () => {
        (os.platform as jest.Mock).mockReturnValue('win32');
        (os.arch as jest.Mock).mockReturnValue('x86');

        await run();

        expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('当前系统: win32'));
        expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('choco install python'), expect.any(Object));

        const expectedPath = path.join('C:', 'Python310', 'Scripts');
        expect(mockAddPath).toHaveBeenCalledWith(expectedPath);
        expect(mockExportVariable).toHaveBeenCalledWith('PYTHON_HOME', expectedPath);
    });

    it('should handle error and call setFailed when continue-on-error is false', async () => {
        (os.platform as jest.Mock).mockReturnValue('linux');
        mockExecSync.mockImplementation(() => { throw new Error('模拟失败'); });

        await run();

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('模拟失败'));
    });
});
