
import { 
  checkPythonVersion1,
  getInputs2,
  installPip3,
  checkPipVersion4,
  giveOutput5

 } from './app/Steps';



export async function run() : Promise<void> {
  try { 
      // step1. 检测是否安装了 python
      await checkPythonVersion1();

      // step2. 获取输入参数
      const options = await getInputs2();

      // step3. 执行命令， 安装 pip
      await installPip3(options);

      // step4. 校对安装的 pip 版本号
      await checkPipVersion4(options);

      // step5. 输出结果， 给github action 用的
      await giveOutput5(options);

    
    
  } catch (error) { 
     console.log(error);
  }
}
