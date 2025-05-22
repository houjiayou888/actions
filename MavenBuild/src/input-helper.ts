import {BuildOptions} from "./Build";
import * as core from '@actions/core';

export async function getInputs(): Promise<BuildOptions> {
    const result = {} as unknown as BuildOptions
    result.mavenVersion = core.getInput('maven-version', {required: true}),
        result.command =

            core.getInput('command', {required: true}),
        result.continueOnFailure =

            core.getBooleanInput('continue-on-failure'),
        result.publishToRepo =
            core.getBooleanInput('publish-to-repo'),
        result.releaseRepo =
            core.getInput('release-repo'),
        result.snapshotRepo =
            core.getInput('snapshot-repo'),
        // 是否处理单元测试结果
        // 若选'是'，请在mvn命令末尾增加 ‘-Dmaven.test.failure.ignore=true’ 参数
        result.needTestsResult
            =
            core.getBooleanInput('tests-result'),
        // 单元测试结果文件
        // 目前只支持标准的.xml格式单元测试报告，请填写相对于项目根目录的相对路径，如 target/surefire-reports/TEST*.xml
        result.testsResultFile
            =
            core.getInput('tests-result-file'),
        // 是否忽略用例失败 若选'是'， 则用例失败时构建任务仍然成功，流水线可以继续执行
        result.ignoreTestsFilled
            =
            core.getBooleanInput('ignore-tests-filled'),
        // 是否处理单元测试覆盖率结果
        // 若选'是'， 请确认项目中有使用jacoco-maven-plugin插件生成单元覆盖率报告
        result.needTestsCoverageResult
            =
            core.getBooleanInput('need-tests-coverage-result'),
        //单元测试覆盖率报告路径
        // 请填写相对于项目根目录的相对路径，如 target/site/jacoco，开启处理单元测试覆盖率报告后，会将此目录下的所有文件进行打包上传
        result.TestsCoverageResultPath
            =
            core.getInput('tests-coverage-result-path'),
        // 选择'使用缓存'后，每次构建时，会把下载依赖包缓存起来，以后构建无需重复拉取，可有效提高构建速度。
        result.enableCache
            =
            core.getBooleanInput('enable-cache')
    return result
}
