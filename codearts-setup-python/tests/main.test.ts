import * as core from '@actions/core';
import { execSync } from 'child_process';
import {run} from "../src/main";

// 模拟整个 @actions/core 模块
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
}));
jest.mock('child_process');
// 类型断言为 Jest 的 Mock 类型
const mockGetInput = core.getInput as jest.Mock;
const mockExecSync = execSync as jest.Mock;
describe('setup-python action', () => {
    beforeEach(() => {
        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'python-version': return '3.10';
                case 'commands': return 'echo Hello';
                case 'continue-on-error': return 'false';
                default: return '';
            }
        });
        mockExecSync.mockImplementation(() => {});
        (core.setOutput as jest.Mock).mockImplementation(() => {});
        (core.setFailed as jest.Mock).mockImplementation(() => {});
        (core.error as jest.Mock).mockImplementation(() => {});
    });

    it('should install python and run command', async () => {
        await run();
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('python3.10'), expect.any(Object));
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining('echo Hello'), expect.any(Object));
    });
});
