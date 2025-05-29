import * as core from '@actions/core';
import { execSync } from 'child_process';
// mock 核心模块
jest.mock('@actions/core');
jest.mock('child_process');


const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockAddPath = core.addPath as jest.Mock;
const mockExportVariable = core.exportVariable as jest.Mock;
const mockInfo = core.info as jest.Mock;
const mockError = core.error as jest.Mock;
const mockExecSync = execSync as jest.Mock;

describe('maven-build action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env['WORKSPACE'] = '/fake/workspace';
        mockSetOutput.mockImplementation(() => {});
        mockSetFailed.mockImplementation(() => {});
        mockExportVariable.mockImplementation(() => {});
    });

    it('正常执行构建命令', () => {
        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'maven-command': return 'mvn clean install';
                case 'continue-on-failure': return 'false';
                default: return '';
            }
        });

        // @ts-ignore
        mockExecSync.mockImplementation(() => {
            console.log('[模拟执行] mvn clean install');
        });

        require('../src/main');

        expect(mockExecSync).toHaveBeenCalledTimes(2);
        expect(mockExecSync).toHaveBeenCalledWith(
            'mvn.cmd clean install',
            expect.objectContaining({
                cwd: '/fake/workspace',
                shell: expect.any(String)
            })
        );

    });
});
