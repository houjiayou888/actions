import {createHash} from 'crypto';
import {existsSync, mkdirSync, readFileSync} from 'fs';
import {globSync} from 'glob';
// 引入缓存模块 启动报错
// import * as cache from '@actions/cache';
import {join} from 'path';
import {homedir} from 'os';
import * as core from '@actions/core';
// Maven 本地仓库路径
const MAVEN_REPO_PATH = join(homedir(), '.m2', 'repository');


/**
 * 初始化缓存目录
 */
function initCacheDir(): void {
    if (!existsSync(MAVEN_REPO_PATH)) {
        mkdirSync(MAVEN_REPO_PATH, {recursive: true});
        core.info(`创建缓存目录: ${MAVEN_REPO_PATH}`);
    }
}

// 自动生成缓存键的逻辑
export function generateAutoCacheKey(): string {
    // 获取所有 pom.xml 的哈希
    const pomFiles = globSync('**/pom.xml', {ignore: '**/target/**'});
    if (pomFiles.length === 0) {
        console.error('未找到 pom.xml 文件')
        return '';
        // throw new Error('未找到 pom.xml 文件');
    }

    const hash = createHash('sha256');

    // 将每个 pom.xml 内容加入哈希计算
    pomFiles.forEach(file => {
        hash.update(readFileSync(file, 'utf-8'));
    });

    // 添加环境标识
    const envTag = process.env.CI ? 'ci' : 'local';

    // 最终缓存键格式：maven-<OS>-<hash>-<env>
    return `maven-${process.platform}-${hash.digest('hex').slice(0, 12)}-${envTag}`;
}

// 缓存恢复方法
export async function restoreCache(): Promise<string | undefined> {
    initCacheDir();
    const cacheKey = generateAutoCacheKey();
    return;
    // return cache.restoreCache(
    //     [MAVEN_REPO_PATH],
    //     cacheKey,
    //     [`maven-${process.platform}`] // 分层恢复键
    // );
}

/**
 * 保存缓存
 */
export async function saveCache(): Promise<void> {
    const cacheKey = generateAutoCacheKey();

    // await cache.saveCache([MAVEN_REPO_PATH], cacheKey);
    core.info(`依赖缓存已更新 (Key: ${cacheKey})`);
    return;

}
