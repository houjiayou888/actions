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
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
async function run() {
    const version = core.getInput('python-version');
    const commands = core.getInput('commands');
    const continueOnError = core.getInput('continue-on-error')?.toLowerCase() === 'true';
    try {
        const arch = os.arch();
        const archLabel = arch.includes('arm') ? 'ARM' : 'x86';
        core.info(`当前服务器架构: ${archLabel}`);
        core.info(`正在安装 Python ${version} ...`);
        (0, child_process_1.execSync)(`sudo apt-get update && sudo apt-get install -y python${version}`, { stdio: 'inherit' });
        core.info(`开始执行用户命令...`);
        (0, child_process_1.execSync)(commands, { stdio: 'inherit', shell: '/bin/bash' });
        core.setOutput('status', 'success');
    }
    catch (error) {
        core.error(`出错: ${error.message}`);
        if (!continueOnError) {
            core.setFailed(`执行失败: ${error.message}`);
        }
    }
}
// 如果是直接运行脚本，则执行
if (require.main === module) {
    run();
}
