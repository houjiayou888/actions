
export interface BuildOptions {
    mavenVersion: string,
    command: string,
    continueOnFailure: boolean,
    publishToRepo: boolean,
    releaseRepo: string,
    snapshotRepo: string,
    needTestsResult: boolean,
    // 单元测试结果文件
    // 目前只支持标准的.xml格式单元测试报告，请填写相对于项目根目录的相对路径，如 target/surefire-reports/TEST*.xml
    testsResultFile: string,
    // 是否忽略用例失败 若选'是'， 则用例失败时构建任务仍然成功，流水线可以继续执行
    ignoreTestsFilled: boolean,
    // 是否处理单元测试覆盖率结果
    // 若选'是'， 请确认项目中有使用jacoco-maven-plugin插件生成单元覆盖率报告
    needTestsCoverageResult: boolean,
    //单元测试覆盖率报告路径
    // 请填写相对于项目根目录的相对路径，如 target/site/jacoco，开启处理单元测试覆盖率报告后，会将此目录下的所有文件进行打包上传
    TestsCoverageResultPath: string,
    // 选择'使用缓存'后，每次构建时，会把下载依赖包缓存起来，以后构建无需重复拉取，可有效提高构建速度。
    enableCache: boolean
}
