// tests/main.test.ts
import * as core from '@actions/core';
import {exec} from 'child_process';
import {promisify} from 'util';
import {runMavenBuild} from '../src/maven-utils';
import {run} from '../src/main';
import any = jasmine.any;
import {getInputs} from "../src/input-helper";
import * as inputHelper from '../src/input-helper';
import mocked = jest.mocked;

// 1. Mock 模块
jest.mock('@actions/core', () => ({
    info: jest.fn(),
    warning: jest.fn(),
    setFailed: jest.fn(),
    setOutput: jest.fn(),
    getInput: jest.fn(),
    getBooleanInput: jest.fn()
}));

jest.mock('child_process', () => ({
    exec: jest.fn()
}));

jest.mock('util', () => ({
    promisify: jest.fn().mockImplementation((fn) => fn)
}));

// 2. 类型转换
const mockGetInput = core.getInput as jest.Mock;

const mockCore = core as jest.Mocked<typeof core>;
const mockExec = exec as unknown as jest.Mock;
const mockPromisify = promisify as unknown as jest.Mock;

const mockRunMavenBuild = mocked(runMavenBuild);
const mockSetOutput = mocked(core.setOutput);
const mockSetFailed = mocked(core.setFailed);
describe('Maven 构建插件全参数测试', () => {
    const baseParams = {
        mavenVersion: '3.8.6',
        command: 'clean install',
        continueOnFailure: false,
        publishToRepo: true,
        releaseRepo: 'https://repo/releases',
        snapshotRepo: 'https://repo/snapshots',
        needTestsResult: true,
        testsResultFile: 'target/surefire-reports/TEST-*.xml',
        ignoreTestsFilled: false,
        needTestsCoverageResult: true,
        TestsCoverageResultPath: 'target/site/jacoco',
        enableCache: true
    };

    beforeEach(() => {
        // 3. 重置所有 Mock
        jest.clearAllMocks();
        // 先设置 Mock
        jest.spyOn(inputHelper, 'getInputs').mockResolvedValue(baseParams);
        // 4. 设置默认 Mock 实现
        mockPromisify.mockImplementation((fn) => (...args: any[]) =>
            Promise.resolve(fn(...args))
        );

        mockExec.mockImplementation((command, options, callback) => {
            if (typeof callback === 'function') {
                callback(null, {stdout: 'BUILD SUCCESS', stderr: ''});
            }
            return {stdout: 'BUILD SUCCESS', stderr: ''};

        });
    });

    test('整体流程测试', async () => {
            await run();

            // expect(mockRunMavenBuild).toHaveBeenCalledWith(expect.objectContaining({
            //     mavenVersion: '3.8.6',
            //     publishToRepo: true,
            //     needTestsCoverageResult: true
            // }));
            expect(mockSetOutput).toHaveBeenCalledWith('status', 'success');
        }
    );
})
