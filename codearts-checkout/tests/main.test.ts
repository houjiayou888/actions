import {main} from '../src';
import * as core from '@actions/core'

// 模拟整个 @actions/core 模块
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
}));
// 类型断言为 Jest 的 Mock 类型
const mockGetInput = core.getInput as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockSetFailed = core.setFailed as jest.Mock;
const mockInfo = core.info as jest.Mock;
describe('checkout 测试', () => {
    beforeEach(() => {
        // 每次测试前重置 mock
        jest.clearAllMocks();
    });

    it('checkout', async () => {
        // 模拟输入
        mockGetInput.mockImplementation((key:string) => {
            switch (key) {
                // https://gitee.com/perfbenchmark/tone-agent-proxy.git
                case 'repository':
                    return 'https://gitee.com/perfbenchmark/tone-agent-proxy.git';
                case 'ref_type':
                    return 'branch';
                case 'ref':
                    return 'v1.11.0';
                case 'target_path':
                    return './myPro';
                case 'submodule_init':
                    return true;
                case 'is_depth':
                    return true;
                case 'depth':
                    return 2;
                case 'lfs':
                    return true;
                default:
                    return '';
            }
        });

        await main();

        // 验证输出
        expect(core.info).toHaveBeenCalledWith( '代码检出成功');
        expect(core.setFailed).not.toHaveBeenCalled();
    },30000);
});
