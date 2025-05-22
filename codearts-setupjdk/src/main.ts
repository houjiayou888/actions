import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 输出普通信息日志（绿色图标）
 */
function logInfo(msg: string) {
  core.info(`🟢 ${msg}`);
}

/**
 * 输出步骤开始日志（螺丝刀图标）
 */
function logStep(msg: string) {
  core.info(`🔧 ${msg}`);
}

/**
 * 输出警告日志（感叹号图标）
 */
function logWarn(msg: string) {
  core.warning(`⚠️ ${msg}`);
}

/**
 * 输出错误日志（叉图标）
 */
function logError(msg: string) {
  core.error(`❌ ${msg}`);
}

/**
 * 在 Linux/macOS 上安装 JDK
 * @param jdkVersion 要安装的 JDK 版本
 * @returns 安装后的 JAVA_HOME 路径
 */
async function installJDKOnLinux(jdkVersion: string): Promise<string> {
  const sdkmanDir = path.join(os.homedir(), '.sdkman'); // SDKMAN! 安装目录
  const initScript = 'source "$HOME/.sdkman/bin/sdkman-init.sh"'; // 初始化脚本

  // 如果 SDKMAN! 未安装，则下载并安装
  if (!fs.existsSync(sdkmanDir)) {
    logStep('SDKMAN! 未安装，开始安装...');
    execSync('curl -s "https://get.sdkman.io" | bash', { stdio: 'inherit', shell: '/bin/bash' });
    logInfo('SDKMAN! 安装完成');
  } else {
    logInfo('SDKMAN! 已存在，跳过安装');
  }

  // 使用 SDKMAN! 安装指定版本的 JDK
  logStep(`使用 SDKMAN! 安装 JDK ${jdkVersion}`);
  execSync(`${initScript} && sdk install java ${jdkVersion}`, { stdio: 'inherit', shell: '/bin/bash' });

  // 获取当前 JAVA_HOME 环境变量值
  logStep('获取 JAVA_HOME 路径');
  const javaHome = execSync(`${initScript} && echo $JAVA_HOME`, {
    encoding: 'utf-8',
    shell: '/bin/bash',
  }).trim();

  logInfo(`JDK ${jdkVersion} 安装完成，JAVA_HOME = ${javaHome}`);
  return javaHome;
}

/**
 * 在 Windows 上安装 JDK
 * @param jdkVersion 要安装的 JDK 版本
 * @returns 安装后的 JAVA_HOME 路径
 */
async function installJDKOnWindows(jdkVersion: string): Promise<string> {
  logStep(`使用 Chocolatey 安装 JDK ${jdkVersion}`);

  try {
    // 尝试安装 jdk{version}
    execSync(`choco install -y jdk${jdkVersion}`, { stdio: 'inherit' });
  } catch {
    // 如果失败，尝试安装 openjdk{version}
    logWarn(`未找到 jdk${jdkVersion}，尝试 openjdk${jdkVersion}`);
    execSync(`choco install -y openjdk${jdkVersion}`, { stdio: 'inherit' });
  }

  // 假设默认安装路径为 C:\Program Files\Java\jdk-{version}
  const javaHome = `C:\\Program Files\\Java\\jdk-${jdkVersion}`;
  logInfo(`JDK ${jdkVersion} 安装完成，JAVA_HOME = ${javaHome}`);
  return javaHome;
}

/**
 * 设置环境变量和输出参数
 * @param javaHome JDK 安装路径
 */
function exportJavaEnv(javaHome: string) {
  logStep('配置环境变量 JAVA_HOME 和 PATH');
  core.exportVariable('JAVA_HOME', javaHome);
  core.addPath(path.join(javaHome, 'bin'));
  core.setOutput('jdk-path', javaHome);
  logInfo('JAVA_HOME 和 PATH 设置成功');
}

/**
 * 主函数入口
 */
export default async function run() {
  try {
    // 获取用户输入的 JDK 版本
    const jdkVersion = core.getInput('jdk-version');

    // 获取当前运行系统（RUNNER_OS 或 os.platform）
    const runnerOS = (process.env.RUNNER_OS || os.platform()).toLowerCase();

    logStep(`当前运行系统: ${runnerOS}`);
    logStep(`目标 JDK 版本: ${jdkVersion}`);

    let javaHome = '';

    // 根据系统选择不同的安装方式
    if (runnerOS.includes('windows')) {
      javaHome = await installJDKOnWindows(jdkVersion);
    } else {
      javaHome = await installJDKOnLinux(jdkVersion);
    }

    // 配置环境变量
    exportJavaEnv(javaHome);

    logInfo('插件执行完成 ✅');
  } catch (err: any) {
    // 捕获异常并记录错误
    logError(`插件主函数失败: ${err.message}`);
    core.setFailed(`插件失败: ${err.message}`);
  }
}

// === 仅 CLI 执行时自动运行（测试时不触发）===
if (require.main === module) {
  // ✅ 全局异常捕获
  process.on('uncaughtException', (err) => {
    logError(`未捕获异常: ${err.message}`);
    core.setFailed(`插件失败: ${err.message}`);
  });

  process.on('unhandledRejection', (reason: any) => {
    logError(`未处理 Promise 异常: ${reason?.message || reason}`);
    core.setFailed(`插件失败: ${reason?.message || reason}`);
  });

  run();
}
