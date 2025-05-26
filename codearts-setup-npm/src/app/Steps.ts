import * as core from '@actions/core'
import { exec } from '@actions/exec';

import { capture } from '../common/cmd';
import { toCameCase, validateVersion } from '../common/util';
import { BuildOptions } from './BuildOptions';
import { STATUS, SUCCESS } from '../common/const';

// step0. 检测是否安装了 nodeJS
export async function checkNodeJS() : Promise<void> {
    try {
        const nodeVersion = await capture('node', ['-v']);
        const nodeFlag = validateVersion(nodeVersion);
        if (!nodeFlag) {
            throw new Error('step0. 未检测到 nodeJS');
        }
        console.log(`step0. 检测到 nodeJS 版本: ${nodeVersion}  is OK !`);
    } catch (error) {
        console.log(error);
        throw new Error('step0. 未检测到 nodeJS');
    }
}

// step1. 获取输入参数
export async function getInputs(callback? : (res: BuildOptions) => void): Promise<BuildOptions> {
    const result = {} as unknown as BuildOptions ; 

    try {
        const keys = [ 'npm-version' ];
        for (const key of keys) {
            // 由于 TypeScript 无法确定 toCameCase(key) 能作为 BuildOptions 的索引，这里使用类型断言
            const camelCaseKey = toCameCase(key) as keyof BuildOptions;
            result[camelCaseKey] = core.getInput(key);
        }
        if (callback) {
            callback(result)
        }
        console.log('step1. 输入参数获取  is  OK !  ');
        return result
    } catch (error) {
        console.log(error);
        throw new Error('step1. 输入参数获取异常！ \n result:  ' + JSON.stringify(result) );
    }
}

// step2. 安装指定版本的 npm
export async function installNpm(options: BuildOptions) : Promise<void> {
    try {
        const npmVersion = options.npmVersion;
        const params = ['install', `npm@${npmVersion}`];
        await exec('npm', params);
        console.log(`step2. 安装指定版本${npmVersion}的 npm  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step2. 安装指定版本的 npm 异常！ \n 命令: npm install npm@ '+ options.npmVersion );
    }
}

// step3. 校对安装的 npm 版本号
export async function checkNpmVersion(options: BuildOptions) : Promise<void> {
    try {
        const params = ['-v'];
        const cmdVersion = await capture('npm',  params);
        if (cmdVersion !== options.npmVersion) {
            throw new Error('step3. 校对安装的 npm 版本号异常！ \n 命令: npm install npm@ '+ options.npmVersion );
        }
        console.log(`step3. 校对安装的 cmdVersion 版本号 ${cmdVersion}  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step3. 校对安装的 npm 版本号异常！ \n 命令: npm install npm@ '+ options.npmVersion );
    }
}

// step4. 输出结果
export async function giveOutput(options: BuildOptions) : Promise<void> {
    try {
        core.setOutput(STATUS, SUCCESS);
        console.log(`step4. 输出结果  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step4. 输出结果异常！ \n  '+ options );
    }
}