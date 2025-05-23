# setup-python

> 在 CodeArts 流水线中设置并执行指定 Python 环境（支持 x86 / ARM 架构）、选择版本、挂载依赖并执行自定义命令。


## 📦 安装方式


- npm install
- npm run all
- node package-zip.js

## ✨ 功能特性

- 设置 Python 版本（支持 2.7 ~ 3.12）
- 自动识别 CPU 架构（x86/ARM 鲲鹏）
- 支持自定义构建命令
- 支持失败后是否继续执行配置
- 支持前端界面化输入控件
- 支持 `stop.ts` 停止后清理逻辑

## 🔧 使用示例

```yaml
- name: Setup Python
  uses: your-org/setup-python@v1
  with:
    python-version: '3.10'
    commands: |
      python setup.py install
    continue-on-error: false
