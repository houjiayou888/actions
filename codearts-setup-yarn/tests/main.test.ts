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
            // 模拟多个输入参数
            (core.getInput as jest.Mock).mockImplementation((name: string) => {
              const inputs = {
                'yarn-version':  '1.22.19'
              };
              // 检查是否存在且 required
              // 定义一个类型来明确 inputs 对象的结构
              type Inputs = {
                'yarn-version': string;
              };

              const inputKeys: Array<keyof Inputs> = Object.keys(inputs) as Array<keyof Inputs>;
              if (!inputKeys.includes(name as keyof Inputs)) {
                      throw new Error(`缺少参数: ${name}`);
              }
              // 由于 name 类型为 string，不能直接作为索引访问 inputs 对象，这里使用类型断言确保可以正确访问
              const inputName = name as keyof Inputs;
              return inputs[inputName] || '';
        });
        // 调用 run 函数
        await run();
        // 检测
        expect(mockSetOutput)
            .toHaveBeenCalledWith(STATUS, SUCCESS);
  }, 60000);  // 超时时间为 60 秒
});