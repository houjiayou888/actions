import * as core from '@actions/core'
import { exec } from '@actions/exec';

import { capture } from '../common/cmd';
import { toCameCase, validateVersionWithoutV } from '../common/util';
import { BuildOptions } from './BuildOptions';
import { STATUS, SUCCESS } from '../common/const';

// step1. 检测是否安装了 npm
export async function checkNpmVersion1() : Promise<void> {
    try {
        const checkyarnVersion = await capture('npm', ['-v']);
        const nodeFlag = validateVersionWithoutV(checkyarnVersion);
        if (!nodeFlag) {
            throw new Error('step1. 未检测到 npm');
        }
        console.log(`step1. 检测到 npm 版本: ${checkyarnVersion}  is OK !`);
    } catch (error) {
        console.log(error);
        throw new Error('step1. 未检测到 npm ');
    }
}

// step2. 获取输入参数
export async function getInputs2(callback? : (res: BuildOptions) => void): Promise<BuildOptions> {
    const result = {} as unknown as BuildOptions ; 

    try {
        const keys = [ 'yarn-version' ];
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

// step3. 安装指定版本的 yarn
export async function installYarn3(options: BuildOptions) : Promise<void> {
    try {
        const yarnVersion = options.yarnVersion;
        const params = ['install', `yarn@${yarnVersion}`];
        await exec('npm', params);
        console.log(`step3. 安装指定版本${yarnVersion}的 yarn  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step3. 安装指定版本的 yarn 异常！ \n 命令: npm install yarn@ '+ options.yarnVersion );
    }
}

// step4. 校对安装的 yarn 版本号
export async function checkYarnVersion4(options: BuildOptions) : Promise<void> {
    try {
        const params = ['-v'];
        const cmdVersion = await capture('yarn',  params);
        if (cmdVersion !== options.yarnVersion) {
            throw new Error('step4. 校对安装的 yarn 版本号异常！ \n 命令: npm install yarn@ '+ options.yarnVersion );
        }
        console.log(`step4. 校对安装的 cmdVersion 版本号 ${cmdVersion}  is  OK!  `);
    } catch (error) {
        console.log(error);
        throw new Error('step4. 校对安装的 yarn 版本号异常！ \n 命令: npm install yarn@ '+ options.yarnVersion );
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