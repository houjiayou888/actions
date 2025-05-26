import { exec } from '@actions/exec';

// 模拟 capture 功能
export async function capture(command: any, args: any) {
    try {
      let output = '';
    const options = {
        // 禁止自动打印输出到 GitHub Actions 日志
      silent: false, 
      listeners: {
        stdout: (data: any) => {
          output += data.toString();
        }
      }
    };
    
    const exitCode = await exec(command, args, options);
    if (exitCode !== 0) {
      throw new Error(`Command failed with exit code ${exitCode}`);
    }
    
    return output.trim();
    } catch (error: any) {
      console.error(`Error executing command: ${error.message}`);
      args.unshift(command);
      throw new Error(`执行命令异常！ \n 命令： \n  ${ args.join(' ') } `); // 重新抛出错误，以便在测试中捕获
    }
  }