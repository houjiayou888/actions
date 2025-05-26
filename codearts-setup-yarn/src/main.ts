
import { 
  checkNpmVersion1,
  getInputs2,
  installYarn3,
  checkYarnVersion4,
  giveOutput5
 } from './app/Steps';



export async function run() : Promise<void> {
  try { 

    // 1. 检测是否安装了 npm
    await checkNpmVersion1();
    
    // 2. 获取输入参数
    const options = await getInputs2();

    // 3. 安装指定版本的 yarn
    await installYarn3(options);

    // 4. 校对安装的 npm 版本号
    await checkYarnVersion4(options);

    // 5. 输出结果
    await giveOutput5(options);

  } catch (error) { 
     console.log(error);
     throw new Error(`Error: ${error}`);
  }
}
