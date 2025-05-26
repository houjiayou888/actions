import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';

jest.mock('@actions/core');
jest.mock('@actions/tool-cache');
jest.mock('os');

const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockAddPath = core.addPath as jest.Mock;
const mockExportVariable = core.exportVariable as jest.Mock;

const mockDownloadTool = tc.downloadTool as jest.Mock;
const mockExtractTar = tc.extractTar as jest.Mock;
const mockExtractZip = tc.extractZip as jest.Mock;

describe('setup-go action', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'go-version': return '1.20.5';
                case 'architecture': return 'x64';
                default: return '';
            }
        });

        (os.platform as jest.Mock).mockReturnValue('linux');
        (os.arch as jest.Mock).mockReturnValue('x64');
        mockDownloadTool.mockResolvedValue('/tmp/go.tar.gz');
        mockExtractTar.mockResolvedValue('/tmp/go-extracted');
    });

    it('should download and setup go correctly on Linux x64', async () => {
        const { run } = await import('../src/main'); // 确保测试编译后的文件路径正确
        await run();

        expect(mockDownloadTool).toHaveBeenCalledWith(expect.stringContaining('go1.20.5.linux-amd64.tar.gz'));
        expect(mockExtractTar).toHaveBeenCalledWith('/tmp/go.tar.gz');
        expect(mockAddPath).toHaveBeenCalledWith(path.join('/tmp/go-extracted', 'go', 'bin'));
        expect(mockExportVariable).toHaveBeenCalledWith('GOROOT', path.join('/tmp/go-extracted', 'go'));
        expect(mockSetOutput).toHaveBeenCalledWith('go-path', path.join('/tmp/go-extracted', 'go', 'bin'));
    });

    it('should fail and call setFailed on error', async () => {
        mockDownloadTool.mockRejectedValue(new Error('下载失败'));
        const { run } = await import('../src/main');
        await run();

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('下载失败'));
    });
});
