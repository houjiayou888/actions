import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

export async function run(): Promise<void> {
    const version = core.getInput('gradle-version');
    const commands = core.getInput('commands');
    const continueOnError = core.getInput('continue-on-error')?.toLowerCase() === 'true';

    try {
        const platform = os.platform(); // 'linux' | 'darwin' | 'win32'
        const arch = os.arch();         // 'x64', 'arm64' 等
        core.info(`当前平台: ${platform}, 架构: ${arch}`);
        core.info(`开始安装 Gradle ${version}...`);

        const gradleUrl = `https://services.gradle.org/distributions/gradle-${version}-bin.zip`;
        core.info(`下载地址：${gradleUrl}`);

        const downloadPath = await tc.downloadTool(gradleUrl);

        core.info('开始解压...');
        const extractedPath = await tc.extractZip(downloadPath);
        const gradleDirName = `gradle-${version}`;
        const gradleHome = path.join(extractedPath, gradleDirName);

        const gradleBin = path.join(gradleHome, 'bin');
        core.addPath(gradleBin);
        core.exportVariable('GRADLE_HOME', gradleHome);

        core.info(`✅ Gradle ${version} 安装完成`);
        core.info(`🔧 GRADLE_HOME: ${gradleHome}`);
        core.info(`📦 PATH 添加: ${gradleBin}`);

        if (commands) {
            core.info('🚀 执行构建命令...');
            execSync(commands, {
                stdio: 'inherit',
                shell: platform === 'win32' ? 'cmd.exe' : '/bin/bash'
            });
        }

        core.setOutput('status', 'success');
    } catch (error: any) {
        core.error(`❌ 出错: ${error.message}`);
        if (!continueOnError) {
            core.setFailed(`执行失败：${error.message}`);
        } else {
            core.warning('⚠️ 构建失败，但 continue-on-error = true，流程继续');
        }
    }
}

if (require.main === module) {
    run();
}
