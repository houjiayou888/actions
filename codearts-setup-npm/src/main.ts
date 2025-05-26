import { 
  checkNodeJS, 
  getInputs, 
  installNpm, 
  checkNpmVersion, 
  giveOutput
 } from './app/Steps';


export async function run() : Promise<void> {
  try { 

    // step0. 检测是否安装了 nodeJS
    await checkNodeJS();

    // step1. 获取输入参数
    const options = await getInputs();

    // step2. 安装指定版本的 npm
    await installNpm(options);

    // step3. 检测是否安装成功
    await checkNpmVersion(options);

    // step4. 输出结果
    await giveOutput(options);


  } catch (error) { 
     console.log(error);
     throw new Error(error + ' , 程序异常！');
  }
}
