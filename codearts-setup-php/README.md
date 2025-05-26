# 📦 setup-php

> CodeArts Actions 插件：设置 PHP 环境并执行构建命令，支持多平台（Linux/macOS/Windows）

本插件支持按需安装指定版本的 PHP，并配置环境变量，适用于构建、测试或部署 PHP 项目。

---

## ✅ 使用示例

```yaml
steps:
  - uses: actions/checkout@v1
  - uses: org/setup-php@v1
    with:
      step-name: '安装 PHP'
      php-version: '8.2'
      commands: 'php -v'

  - run: echo "构建步骤..."
