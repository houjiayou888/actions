# CodeArts Actions 仓库

本项目是一个 **CodeArts 插件集合仓库**，用于统一维护多个 CodeArts 流水线插件（Action），覆盖构建、环境配置、软件上传等常见 DevOps 场景。

---

## 📦 插件列表

| 插件目录                   | 描述                           |
|----------------------------|--------------------------------|
| `codearts-checkout`        | 检出仓库、分支、提交，适配 Git |
| `codearts-setup-node`      | 设置 Node.js 环境              |
| `codearts-setup-python`    | 设置 Python 运行环境           |
| `codearts-setup-maven`     | 设置 Maven 构建环境            |
| `codearts-setup-jdk`       | 安装特定版本 JDK              |
| `codearts-maven-build`     | 基于 Maven 的构建工具插件      |
| `codearts-upload-software-rep` | 上传构建产物到软件仓库        |

---

## 📁 项目结构说明


---

## 🛠 插件开发说明

每个插件目录为一个独立模块，具有完整的：

- `package.json`（依赖 + 构建）
- `src/`（TypeScript 或 JS 源码）
- `action.yml`（CodeArts 插件入口定义）
- `README.md`（使用说明）
- `npm run package`（将 `src/` 编译并打包到 `dist/`）

### 统一打包命令（以 `codearts-checkout` 为例）

```bash
cd codearts-checkout
npm install
npm run package
```

## 🧪 测试
部分插件包含 tests/ 目录，使用 jest 作为单元测试框架：
````
npm run test
````
