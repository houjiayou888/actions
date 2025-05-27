import { 
  checkNodeJS1, 
  getInputs2, 
  installNpm3, 
  checkNpmVersion4, 
  giveOutput5
 } from './app/Steps';


export async function run() : Promise<void> {
  try { 

    // step1. 检测是否安装了 nodeJS
    await checkNodeJS1();

    // step2. 获取输入参数
    const options = await getInputs2();

    // step3. 安装指定版本的 npm
    await installNpm3(options);

    // step4. 检测是否安装成功
    await checkNpmVersion4(options);

    // step5. 输出结果
    await giveOutput5(options);


  } catch (error) { 
     console.log(error);
     throw new Error(error + ' , 程序异常！');
  }
}
