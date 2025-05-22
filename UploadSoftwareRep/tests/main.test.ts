import * as core from '@actions/core';
import { runUpload } from '../src/main';
import { mocked } from 'jest-mock';
import * as fs from "node:fs";

jest.mock('@actions/core');
jest.mock('glob');

const mockSetFailed = mocked(core.setFailed);
// const mockSetOutput = mocked(core.setOutput);

describe('Package Uploader', () => {
    const baseOptions = {
        packageName: 'my-app',
        artifactPath: '**/target/*.?ar',
        version: '1.0.0',
        targetDir: 'releases/prod',
        continueOnFailure: false
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('应成功上传匹配文件', async () => {
        // Mock glob 返回
        require('glob').__setMockFiles([
            'target/app.jar',
            'target/module.war'
        ]);

        await runUpload(baseOptions);

        expect(mockSetFailed).not.toHaveBeenCalled();
        // expect(mockSetOutput).toHaveBeenCalled();
    });

    it('找不到文件时应报错', async () => {
        require('glob').__setMockFiles([]);

        await expect(runUpload(baseOptions)).rejects.toThrow();
        expect(mockSetFailed).toHaveBeenCalled();
    });

    // it('continueOnFailure=true 时应忽略部分失败', async () => {
    //     require('glob').__setMockFiles(['valid.jar', 'error.jar']);
    //     // Mock 上传函数抛出部分错误
    //     jest.spyOn(fs, 'stat').mockImplementation((file) => {
    //         if (file.includes('error')) throw new Error('Upload failed');
    //         return Promise.resolve({} as any);
    //     });
    //
    //     await runUpload({ ...baseOptions, continueOnFailure: true });
    //     expect(core.warning).toHaveBeenCalled();
    // });
});
