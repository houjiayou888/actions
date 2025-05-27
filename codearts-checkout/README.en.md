# checkout-action

从 CodeArts 代码仓库中检出代码的插件，支持分支、标签、Commit ID 等多种方式，支持克隆子模块、自定义深度、Git LFS 等高级选项。

## 📦 插件功能

- 支持分支、tag、commitId 三种检出方式
- 支持指定目标路径
- 支持 Git 子模块（--recurse-submodules）
- 支持 Git LFS
- 支持浅克隆（--depth）

## ⚙️ 使用示例

```yaml
- uses: checkout@0.0.1
  with:
    token: ${{ X_AUTH_TOKEN }}
    repository: https://example.com/myrepo.git
    ref_type: branch
    ref_value: main
    target_path: ./my-code
    recurse_submodules: true
    custom_depth: 5
    enable_lfs: true
