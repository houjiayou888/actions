import * as core from '@actions/core';

// 导入 index.ts 文件
import { run }  from '../src/main';
import { STATUS, SUCCESS, FAILURE } from '../src/common/const'; 
import mocked = jest.mocked;

jest.mock('@actions/core'); // 模拟 @actions/cor

const mockSetOutput = mocked(core.setOutput);

describe('run function', () => {
  beforeEach(() => {
     // 清除所有模拟函数的调用
    jest.clearAllMocks();
  });

  it('should log the greeting message', async () => {
        await run();
        // 检测
        expect(mockSetOutput)
            .toHaveBeenCalledWith(STATUS, SUCCESS);
  }, 60000);  // 超时时间为 30 秒
});