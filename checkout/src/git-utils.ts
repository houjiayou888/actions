import {IGitSourceSettings} from "./IGitSourceSettings";

import {simpleGit} from 'simple-git';
import * as core from '@actions/core'
import {execSync} from 'child_process';


export async function checkoutCode(sourceSettings: IGitSourceSettings) {
    const git = simpleGit();
    try {
        core.info(`🔍 正在克隆仓库到路径: ${sourceSettings.targetPath}...`);

        const options: Array<any> = [];
        if (sourceSettings.lfs) {
            options.push('--filter=blob:none');
        }
        if (sourceSettings.isDepth) {
            options.push('--depth', sourceSettings.depth);
        }
        if (sourceSettings.refType === 'branch') {
            options.push('-b',sourceSettings.ref);
        }
        // 是否克隆子模块
        if (sourceSettings.submoduleInit) {
            options.push('--recurse-submodules');
        }
        // 克隆仓库到目标路径
        if (options.length > 0) {
            await git.clone(sourceSettings.repository, sourceSettings.targetPath, options);
        } else {
            await git.clone(sourceSettings.repository, sourceSettings.targetPath);
        }
        core.info('✅ 仓库克隆完成');

        // 切换到指定 ref
        const repo = simpleGit(sourceSettings.targetPath);
        switch (sourceSettings.refType) {
            // case 'branch':
            //     await repo.checkout(sourceSettings.ref);
            //     core.info(`✅ 已切换到分支: ${sourceSettings.ref}`);
            //     break;
            case 'tag':
                await repo.checkout(`tags/${sourceSettings.ref}`);
                core.info(`✅ 已切换到 Tag: ${sourceSettings.ref}`);
                break;
            case 'commit':
                await repo.checkout(sourceSettings.ref);
                core.info(`✅ 已切换到 Commit: ${sourceSettings.ref.substring(0, 7)}`);
                break;
        }
        // 是否克隆子模块
        // if (submoduleInit) {
        //     // 进入目录并初始化子模块
        //     await repo.submoduleUpdate(['--init', '--recursive']);
        //     core.info('✅ 子模块初始化完成');
        // }
        // lfs
        if (sourceSettings.lfs) {
            // 初始化 LFS 并拉取大文件
            // await repo.lfs(['install']);        // 初始化 LFS
            // await repo.lfs(['pull', 'origin', 'main']); // 拉取 LFS 文件

            // 进入仓库目录并拉取 LFS 文件
            process.chdir(sourceSettings.targetPath);
            execSync('git lfs install', {stdio: 'inherit'});
            execSync(`git lfs pull`, {stdio: 'inherit'});
            core.info('✅ 拉取 LFS 文件完成');
        }
    } catch (error) {
        throw new Error(`代码检出失败: ${error.message}`);
    }
}

module.exports = {checkoutCode};
