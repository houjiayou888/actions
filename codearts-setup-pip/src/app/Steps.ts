import * as core from '@actions/core'
import { exec } from '@actions/exec';

import { capture } from '../common/cmd';
import { toCameCase, validateVersionWithoutV, splitAndLower } from '../common/util';
import { BuildOptions } from './BuildOptions';
import { STATUS, SUCCESS, __ARG_VERSION } from '../common/const';

// step1. 检测是否安装了 python
export async function checkPythonVersion1() : Promise<void> {
    try {
        const checkPythonVersion = await capture('python', [__ARG_VERSION]);
        const temp = splitAndLower(checkPythonVersion);
        if ('python' === temp[0] && validateVersionWithoutV(temp[1]) ) {
            console.log(`step1. 检测到 python 版本: ${checkPythonVersion}  is OK !`);
        } else {
            throw new Error('step1. 未检测到 python');
        }
    } catch (error) {
        console.log(error);
        throw new Error('step1. 未检测到 python ');
    }
}

// step2. 获取输入参数
export async function getInputs2(callback? : (res: BuildOptions) => void): Promise<BuildOptions> {
    const result = {} as unknown as BuildOptions ; 

    try {
        const keys = [ 'pip-version' ];
        for (const key of keys) {
            // 由于 TypeScript 无法确定 toCameCase(key) 能作为 BuildOptions 的索引，这里使用类型断言
            const camelCaseKey = toCameCase(key) as keyof BuildOptions;
            result[camelCaseKey] = core.getInput(key);
        }
        if (callback) {
            callback(result)
        }
        console.log('step2. 输入参数获取  is  OK !  ');
        return result
    } catch (error) {
        console.log(error);
        throw new Error('step2. 输入参数获取异常！ \n result:  ' + JSON.stringify(result) );
    }
}

// step3. 安装指定版本的 pip
export async function installPip3(options: BuildOptions) : Promise<void> {
    try {
        // python -m pip install pip==22.3.1 
        const pipVersion = options.pipVersion;
        const params = ['-m', 'pip', 'install', `pip==${pipVersion}`];
        await exec('python', params);
        console.log(`step3. 安装指定版本${pipVersion}的 pip  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step3. 安装指定版本的 pip 异常！ \n 命令: python -m pip install pip=='+ options.pipVersion );
    }
}

// step4. 校对安装的 pip 版本号
export async function checkPipVersion4(options: BuildOptions) : Promise<void> {
    try {
        const params = [__ARG_VERSION];
        const cmdVersion = await capture('pip',  params);
        const temp = splitAndLower(cmdVersion);
        if ('pip' === temp[0] && validateVersionWithoutV(temp[1]) && temp[1] === options.pipVersion ) {
            console.log(`step4. 校对安装pip的 cmdVersion 版本号 ${cmdVersion}  is  OK!  `);
        } else {
            throw new Error('step4. 校对安装的 yarn 版本号异常！ \n 命令: python -m pip install pip=='+ options.pipVersion );
        }
    } catch (error) {
        console.log(error);
        throw new Error('step4. 校对安装的 pip 版本号异常！ \n 命令: python -m pip install pip=='+ options.pipVersion );
    }
}

// step5. 设置成功状态
export async function giveOutput5(options: BuildOptions) : Promise<void> {
    try {
        core.setOutput(STATUS, SUCCESS);
        console.log(`step5. 输出结果  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step5. 输出结果异常！ \n  '+ options );
    }
}