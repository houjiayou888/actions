# ⚙️ setup-gradle

> CodeArts Actions 插件：跨平台设置 Gradle 环境并执行构建命令

---

## 📦 功能支持

- 指定版本下载 Gradle（来自官方源）
- 支持 Windows / macOS / Linux
- 自动配置 `GRADLE_HOME` 和 `PATH`
- 支持构建命令执行与异常处理

---

## 🚀 使用示例

```yaml
steps:
  - uses: actions/checkout@v1
  - uses: org/setup-gradle@v1
    with:
      step-name: '安装 Gradle'
      gradle-version: '8.4'
      commands: 'gradle build'
