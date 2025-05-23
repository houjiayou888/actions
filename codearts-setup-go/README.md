# 🚀 codearts-setup-go

> CodeArts Actions 插件：设置指定版本的 Go 语言开发环境。

该插件用于在 CodeArts Actions 流水线中自动安装并配置 Go 语言运行环境，支持自定义版本和架构，适用于构建、测试和部署 Go 应用。

---

## ✅ 使用示例

在 `.codearts/workflow.yml` 中使用：

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v1
      - uses: org/codearts-setup-go@v1
        with:
          go-version: '1.21.5'
          architecture: 'x64'

      - run: go version
      - run: go build ./...
