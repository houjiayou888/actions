import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';
import { run } from '../src/main';

// 模拟 core、tool-cache、os 模块
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    addPath: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
}));
jest.mock('@actions/tool-cache');
jest.mock('os');

const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockAddPath = core.addPath as jest.Mock;
const mockDownloadTool = tc.downloadTool as jest.Mock;
const mockExtractTar = tc.extractTar as jest.Mock;

describe('setup-go 插件测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // 模拟输入参数
        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'go-version': return '1.21.5';
                case 'architecture': return 'x64';
                default: return '';
            }
        });

        // 模拟平台和工具行为
        (os.platform as jest.Mock).mockReturnValue('linux');
        mockDownloadTool.mockResolvedValue('/tmp/go.tar.gz');
        mockExtractTar.mockResolvedValue('/tmp/go-extracted');
    });

    it('应下载、解压并设置 Go 环境变量', async () => {
        await run();

        expect(mockDownloadTool).toHaveBeenCalledWith('https://golang.org/dl/go1.21.5.linux-x64.tar.gz');
        expect(mockExtractTar).toHaveBeenCalledWith('/tmp/go.tar.gz');
        const expectedPath = path.join('/tmp/go-extracted/go/bin');
        expect(mockAddPath).toHaveBeenCalledWith(expectedPath);
        expect(mockSetOutput).toHaveBeenCalledWith('go-path', expectedPath);
    });

    it('下载失败时应调用 setFailed', async () => {
        mockDownloadTool.mockRejectedValue(new Error('模拟下载错误'));

        await run();

        expect(mockSetFailed).toHaveBeenCalledWith('模拟下载错误');
    });
});
