import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export async function run(): Promise<void> {
    try {
        const repository = core.getInput('repository');
        const refType = core.getInput('ref_type');
        const refValue = core.getInput('ref_value');
        const targetPath = core.getInput('target_path') || '.';
        const recurseSubmodules = core.getBooleanInput('recurse_submodules');
        const customDepth = core.getInput('custom_depth');
        const enableLfs = core.getBooleanInput('enable_lfs');

        // const platform = os.platform();
        const platform = process.env['RUNNER_OS'];   //获取系统变量
        core.info(`获取系统变量RUNNER_OS：${platform}`);
        const resolvedTarget = path.resolve(targetPath);

        core.info(`📁 准备克隆到路径：${resolvedTarget}`);

        // 如果目标路径不存在，先创建目录
        if (!fs.existsSync(resolvedTarget)) {
            fs.mkdirSync(resolvedTarget, { recursive: true });
            core.info(`📁 创建目录成功：${resolvedTarget}`);
        }

        // Git LFS 初始化（如启用）
        if (enableLfs) {
            core.info('安装 Git LFS...');
            await exec.exec('git', ['lfs', 'install']);
        }

        // 构建 git clone 命令
        const cloneArgs = ['clone'];
        if (recurseSubmodules) cloneArgs.push('--recurse-submodules');
        if (customDepth) cloneArgs.push(`--depth=${customDepth}`);
        cloneArgs.push(repository, resolvedTarget);

        core.info(`正在执行：git ${cloneArgs.join(' ')}`);
        await exec.exec('git', cloneArgs);

        // 切换到克隆目录
        process.chdir(resolvedTarget);

        // checkout 具体引用
        switch (refType) {
            case 'commitId':
                await exec.exec('git', ['checkout', refValue]);
                break;
            case 'branch':
                await exec.exec('git', ['checkout', '-t', `origin/${refValue}`]);
                break;
            case 'tag':
                await exec.exec('git', ['checkout', `tags/${refValue}`]);
                break;
            default:
                throw new Error(`不支持的引用类型: ${refType}`);
        }

        core.setOutput('checkout_status', 'success');
        // 将路径写入环境变量，供 maven-build 使用
        core.exportVariable('WORKSPACE', resolvedTarget);
        core.info(`已导出 WORKSPACE=${resolvedTarget}`);
        core.info('Checkout 完成');

    } catch (error: any) {
        core.setFailed(`Checkout 失败: ${error.message}`);
    }
}

run();
