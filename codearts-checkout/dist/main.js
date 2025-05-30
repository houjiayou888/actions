"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
async function run() {
    try {
        const repository = core.getInput('repository');
        const refType = core.getInput('ref_type');
        const refValue = core.getInput('ref_value');
        const targetPath = core.getInput('target_path') || '.';
        const recurseSubmodules = core.getBooleanInput('recurse_submodules');
        const customDepth = core.getInput('custom_depth');
        const enableLfs = core.getBooleanInput('enable_lfs');
        const platform = os.platform();
        const resolvedTarget = path.resolve(targetPath);
        core.info(`📁 准备克隆到路径：${resolvedTarget}`);
        // 如果目标路径不存在，先创建目录
        if (!fs.existsSync(resolvedTarget)) {
            fs.mkdirSync(resolvedTarget, { recursive: true });
            core.info(`📁 创建目录成功：${resolvedTarget}`);
        }
        // Git LFS 初始化（如启用）
        if (enableLfs) {
            core.info('安装 Git LFS...');
            await exec.exec('git', ['lfs', 'install']);
        }
        // 构建 git clone 命令
        const cloneArgs = ['clone'];
        if (recurseSubmodules)
            cloneArgs.push('--recurse-submodules');
        if (customDepth)
            cloneArgs.push(`--depth=${customDepth}`);
        cloneArgs.push(repository, resolvedTarget);
        core.info(`正在执行：git ${cloneArgs.join(' ')}`);
        await exec.exec('git', cloneArgs);
        // 切换到克隆目录
        process.chdir(resolvedTarget);
        // checkout 具体引用
        switch (refType) {
            case 'commitId':
                await exec.exec('git', ['checkout', refValue]);
                break;
            case 'branch':
                await exec.exec('git', ['checkout', '-t', `origin/${refValue}`]);
                break;
            case 'tag':
                await exec.exec('git', ['checkout', `tags/${refValue}`]);
                break;
            default:
                throw new Error(`不支持的引用类型: ${refType}`);
        }
        core.setOutput('checkout_status', 'success');
        // 将路径写入环境变量，供 maven-build 使用
        core.exportVariable('WORKSPACE', resolvedTarget);
        core.info(`已导出 WORKSPACE=${resolvedTarget}`);
        core.info('Checkout 完成');
    }
    catch (error) {
        core.setFailed(`Checkout 失败: ${error.message}`);
    }
}
run();
