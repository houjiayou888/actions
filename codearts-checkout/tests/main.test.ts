import { run as main } from '../src/main';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

// 模拟 core 与 exec 模块
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn()
}));

jest.mock('@actions/exec', () => ({
    exec: jest.fn()
}));

// 类型断言
const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockInfo = core.info as jest.Mock;
const mockExec = exec.exec as jest.Mock;

describe('checkout-action 测试', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('正常检出分支', async () => {
        mockGetInput.mockImplementation((key: string) => {
            switch (key) {
                case 'repository':
                    return 'https://gitee.com/perfbenchmark/tone-agent-proxy.git';
                case 'ref_type':
                    return 'branch';
                case 'ref_value':
                    return 'v1.11.0';
                case 'target_path':
                    return './myPro';
                case 'recurse_submodules':
                    return 'true';
                case 'custom_depth':
                    return '2';
                case 'enable_lfs':
                    return 'true';
                default:
                    return '';
            }
        });

        await main();

        expect(mockExec).toHaveBeenCalledWith('git', expect.arrayContaining(['clone']));
        expect(mockExec).toHaveBeenCalledWith('git', ['checkout', '-t', 'origin/main']);
        expect(mockSetOutput).toHaveBeenCalledWith('checkout_status', 'success');
        expect(mockSetFailed).not.toHaveBeenCalled();
        expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('Checkout 完成'));
    },30000);

    it('异常引用类型应标记失败', async () => {
        mockGetInput.mockImplementation((key: string) => {
            if (key === 'ref_type') return 'invalid-ref';
            return '';
        });

        await main();

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('不支持的引用类型'));
    });
});
