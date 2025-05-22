import {exec} from 'child_process';
import {promisify} from 'util';
import * as core from '@actions/core';
import * as os from 'os';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import { promises as fs } from 'fs';
const { readFile, writeFile } = fs;
import {BuildOptions} from "./Build";
import {join} from 'path';
import {parseJacocoReport} from "./jacoco-parser";
import {glob} from "glob";
import {parseJUnitXML} from "./junit-parser";
import {restoreCache, saveCache} from "./cache-utils";

const execAsync = promisify(exec);


export async function runMavenBuild(options: BuildOptions): Promise<void> {
    try {
        //0. 缓存
        if (options.enableCache) {
            try {
                await restoreCache();
            } catch (error) {
                if (options.continueOnFailure) {
                    core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } else {
                    throw error;
                }
            }
        }
        // 1. 配置 Maven 版本
        try {
            core.info(`Using Maven ${options.mavenVersion}`);
            const mavenHome = os.platform() === 'win32'
                ? `C:\\maven\\${options.mavenVersion}`
                : `/usr/share/maven/${options.mavenVersion}`;
            process.env.MAVEN_HOME = mavenHome;
        } catch (error) {
            if (options.continueOnFailure) {
                core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } else {
                throw error;
            }
        }


        // 2. 处理发布到私有仓库
        let deplloy = '';
        if (options.publishToRepo) {
            try {
                deplloy = await configurePrivateRepo(options.releaseRepo, options.snapshotRepo);
            } catch (error) {
                if (options.continueOnFailure) {
                    core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } else {
                    throw error;
                }
            }
        }

        // 3. 构建命令参数
        try {
            const args = [
                options.command,
                options.ignoreTestsFilled ? '-Dmaven.test.failure.ignore=true' : '',
                '-Dmaven.test.force=true',
                options.publishToRepo ? deplloy : '',

            ].filter(Boolean).join(' ');
            // 4. 执行 Maven 命令
            const {stdout, stderr} = await execAsync(
                `mvn ${args}`,
                {env: process.env}
            );
            core.info(stdout);
            if (stderr) core.warning(stderr);
        } catch (error) {
            if (options.continueOnFailure) {
                core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } else {
                throw error;
            }
        }

        // 4.处理测试结果
        try {
            await handleTestResults(options);
            await handleCoverageReport(options);
        }catch (error){
            if (options.continueOnFailure) {
                core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } else {
                throw error;
            }
        }

        // 5. 处理缓存
        if (options.enableCache) {
            try {
                await handleCache();
            } catch (error) {
                if (options.continueOnFailure) {
                    core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } else {
                    throw error;
                }
            }
        }
    } catch (error) {
        if (options.continueOnFailure) {
            core.warning(`构建继续运行: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } else {
            throw error;
        }
    }
}

async function handleCoverageReport(options: BuildOptions) {
    if (!options.needTestsCoverageResult) return;

    // 1. 验证覆盖率文件存在
    if (!existsSync(options.TestsCoverageResultPath)) {
        core.warning(`覆盖率报告未生成: ${options.TestsCoverageResultPath}`);
        return;
    }

    // 2. 解析并简化覆盖率数据（示例）
    const report = await parseJacocoReport(options.TestsCoverageResultPath);
    const summary = {
        lineCoverage: report.line.covered / report.line.total,
        branchCoverage: report.branch.covered / report.branch.total
    };

    // 3. 写入结果
    writeFileSync('coverage-summary.json', JSON.stringify(summary, null, 2));
    core.info(`覆盖率摘要已保存: ${process.cwd()}/coverage-summary.json`);
}
async function handleTestResults(options: BuildOptions) {
    if (!options.needTestsResult) return;

    // 1. 验证测试结果文件存在
    const files = await glob(options.testsResultFile);
    if (files.length === 0) {
        core.warning(`未找到测试结果文件: ${options.testsResultFile}`);
        return;
    }

    // 2. 解析并记录结果（示例：统计成功率）
    let total = 0;
    let passed = 0;

    for (const file of files) {
        const content = await readFile(file, 'utf-8');
        const { tests, failures } = await parseJUnitXML(content); // 需要实现 XML 解析
        total += tests;
        passed += (tests - failures);
    }

    // 3. 写入自定义结果文件
    const result = {
        timestamp: new Date().toISOString(),
        total,
        passed,
        successRate: ((passed / total) * 100).toFixed(2) + '%'
    };

    writeFileSync('test-results.json', JSON.stringify(result, null, 2));
    core.info(`测试结果已保存: ${process.cwd()}/test-results.json`);
}
async function configurePrivateRepo(releaseRepo: string, snapshotRepo: string): Promise<string> {

    try {
        // 1. 确定版本类型
        const isSnapshot = await checkVersionType();
        const repoUrl = isSnapshot ? snapshotRepo : releaseRepo;

        // 2. 生成 Maven settings.xml
        const settingsXml = generateSettingsXml(repoUrl, 'username', 'password');
        const mavenHome = join(os.homedir(), '.m2');
        if (!existsSync(mavenHome)) mkdirSync(mavenHome, {recursive: true});
        writeFileSync(join(mavenHome, 'settings.xml'), settingsXml);


        return `-DaltDeploymentRepository=repo::default::${repoUrl}`;


    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : 'Unknown error');
    }
}

// 检查是否为 Snapshot 版本
async function checkVersionType(): Promise<boolean> {
    const {stdout} = await execAsync('mvn help:evaluate -Dexpression=project.version -q -DforceStdout');
    return stdout.trim().endsWith('-SNAPSHOT');
}

// 生成动态 settings.xml
function generateSettingsXml(repoUrl: string, username: string, password: string): string {
    return `
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">
  
  <servers>
    <server>
      <id>repo</id>
      <username>${username}</username>
      <password>${password}</password>
    </server>
  </servers>

  <profiles>
    <profile>
      <id>codearts</id>
      <repositories>
        <repository>
          <id>repo</id>
          <url>${repoUrl}</url>
          <releases><enabled>${!repoUrl.includes('snapshots')}</enabled></releases>
          <snapshots><enabled>${repoUrl.includes('snapshots')}</enabled></snapshots>
        </repository>
      </repositories>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>codearts</activeProfile>
  </activeProfiles>
</settings>`;
}


async function handleCache(): Promise<void> {
    // 缓存处理逻辑 (示例)
    core.info('保存缓存...');
    await saveCache();
}
