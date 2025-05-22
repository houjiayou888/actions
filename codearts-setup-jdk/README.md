# setupjdk 插件

> 华为云 CodeArts Actions 插件：自动安装并配置 JDK 开发环境，支持多平台、多版本选择。

---

## 📌 插件简介

`setupjdk` 是一个用于初始化 Java 开发环境的 CodeArts Actions 插件，具备以下特性：

- **多版本支持**：支持 JDK 8、11、17、21 版本安装  
- **跨平台适配**：自动适配 Linux / macOS / Windows 操作系统  
- **环境配置**：自动配置 `JAVA_HOME` 环境变量及系统 PATH  
- **终止处理**：插件被取消或失败时自动清理临时资源  
- **输出集成**：提供 `jdk-path` 输出参数供后续任务使用  

---

## 🗂️ 项目结构

```bash
setupjdk/
├── src/               # 插件源代码（TypeScript）
│   ├── main.ts        # 插件主逻辑
│   └── stop.ts        # 插件终止处理逻辑
├── dist/              # 构建输出（由 ncc 生成）
│   ├── main.js
│   └── stop.js
├── tests/             # 单元测试
├── action.yml         # 插件元数据定义
├── README.md          # 插件说明文档
├── package.json       # 构建依赖与脚本定义
├── tsconfig.json      # TypeScript 编译配置
└── setupjdk.zip       # 构建后生成的插件压缩包（供发布）
```

---

## 🚀 快速使用

### 流水线配置示例

```yaml
steps:
  - name: 安装 JDK 环境
    uses: codehub.xxx.com/org/setupjdk@v1.0.0
    with:
      jdk-version: '17'
```

---

## ⚙️ 参数说明

### 输入参数

| 参数名       | 是否必填 | 默认值 | 描述                   |
|--------------|----------|--------|------------------------|
| `jdk-version` | 是       | `17`   | 需安装的 JDK 版本（支持下拉选择） |

### 输出参数

| 输出名     | 描述                 |
|------------|----------------------|
| `jdk-path` | 安装完成后的 JAVA_HOME 路径 |

---

## 📦 插件元数据（action.yml）

```yaml
name: 'setupjdk'
version: '1.0.0'
author: 'edward'
description: '初始化并配置指定版本的 JDK 环境'
inputs:
  jdk-version:
    description: '要安装的 JDK 版本'
    required: true
    default: '17'
    layout:
      type: 'singleSelect'
      label: 'JDK 版本'
      extend_prop:
        options:
          - label: 'JDK 8'
            value: '8'
          - label: 'JDK 11'
            value: '11'
          - label: 'JDK 17'
            value: '17'
          - label: 'JDK 21'
            value: '21'
        api_type: 'fixed'
outputs:
  jdk-path:
    description: '安装后的 JDK 路径'
runs:
  using: 'node16'
  main: 'dist/main.js'
  post: 'dist/stop.js'
```

---

## 🛠️ 开发与构建

### 安装依赖

```bash
npm install
```

### 编译与打包

```bash
npm run package
```

#### 构建流程：
1. 使用 `tsc` 编译 TypeScript 源码。
2. 通过 `ncc` 打包 `main.ts` 和 `stop.ts` 到 `dist/`.
3. 生成 `setupjdk.zip`（包含 `action.yml` 和 `README.md`）。

---

## 🧪 测试指南

### 单元测试

```bash
npm run test
```

#### 测试覆盖内容：

- 不同平台的 JDK 安装流程（Mock 实现）
- 异常处理是否触发 `core.setFailed()`
- `stop.ts` 的终止逻辑验证
- 环境变量路径配置正确性

---

## 📤 发布流程

1. 打包插件：执行 `npm run package` 生成 `setupjdk.zip`
2. 登录控制台：进入 [CodeArts 控制台 > 插件中心](https://codearts.console.huaweicloud.com/)
3. 上传插件：选择 `setupjdk.zip` 并填写版本信息
4. 发布版本：提交后等待审核通过

---

## 🛑 终止处理（stop.ts）

插件注册 `post` 钩子，在以下场景自动调用：

- 流水线被手动取消
- 插件执行失败
- 进程收到终止信号（如 `SIGINT`）

#### 默认行为：

- 输出 SDKMAN 安装状态日志
- 可扩展逻辑（如清理临时目录、发送通知等）

---

## 🌍 平台支持

| 平台    | 安装方式 | 依赖工具           |
|---------|----------|--------------------|
| Linux   | SDKMAN   | `curl`, `bash`     |
| macOS   | SDKMAN   | `curl`, `bash`     |
| Windows | Chocolatey | 需预装 `choco` 命令 |

---

## 📚 参考文档

- [CodeArts 插件开发规范](https://developer.huaweicloud.com)
- [SDKMAN 官网](https://sdkman.io/)
- [Chocolatey 官网](https://chocolatey.org/)

---

## 📝 插件信息

| 属性         | 说明                        |
|--------------|---------------------------|
| 插件名称     | `setupjdk`                |
| 版本         | `1.0.0`                   |
| 开发者工号   | `edward`                  |
| 支持平台     | `Linux / macOS / Windows` |
| 创建时间     | `2025-05`                 |

---

### ✅ 验证说明

1. **快速使用** 部分已包含 YAML 示例，位于 **快速使用** 章节。
2. 后续所有内容（参数说明、元数据、开发构建、测试、发布流程等）均已完整呈现。
3. 若仍有内容缺失，可能是 Markdown 渲染工具兼容性问题，建议使用标准工具（如 VS Code、GitHub）查看。
