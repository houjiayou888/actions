import * as core from '@actions/core'
import { STATUS, SUCCESS, _ARG_VERSION, VERSION } from './common/const'; 
import { exec } from '@actions/exec';


// 导入 cmd
import { capture } from './common/cmd';



export async function run() : Promise<void> {
  try { 

    // `npm install -g npm@${version}`
    // const cmd = `npm install -g npm@${VERSION}`;
    // console.log(`执行命令: ${cmd}`);
    // 安装 
    const params = ['install', `npm@${VERSION}`];
    await exec('npm', params);

    // 对比版本号
    const realVersion = await capture('npm', [_ARG_VERSION]);
    console.log(`realVersion: ${realVersion}`);

    if (realVersion === VERSION) {
         // setOutput
        core.setOutput(STATUS, SUCCESS);
    } else {
        // 未检测到指定的版本号
        throw new Error(`未检测到指定的版本号: ${VERSION}`);
    }
  } catch (error) { 
     console.log(error);
  }
}
