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
exports.runUpload = runUpload;
// src/main.ts
const core = __importStar(require("@actions/core"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const path_1 = require("path");
async function findArtifacts(pattern) {
    return new Promise((resolve, reject) => {
        (0, glob_1.glob)(pattern, { nodir: true });
    });
}
async function uploadFile(filePath, targetPath) {
    // 实现具体的上传逻辑（示例使用模拟上传）
    const fileStat = await fs_1.promises.stat(filePath);
    core.info(`↑ Uploading ${(0, path_1.basename)(filePath)} (${fileStat.size} bytes)...`);
    // 这里替换为实际的上传实现，例如：
    // await http.put(uploadURL, fs.createReadStream(filePath));
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟上传延迟
    core.info(`✓ Successfully uploaded to ${targetPath}`);
}
async function runUpload(options) {
    const { packageName, version, targetDir, artifactPath } = options;
    // 解析文件路径
    const artifacts = await findArtifacts(artifactPath);
    if (artifacts.length === 0) {
        throw new Error(`未找到匹配的构建包：${artifactPath}`);
    }
    // 构造目标路径
    const basePath = (0, path_1.join)(targetDir, packageName, version);
    try {
        await Promise.all(artifacts.map(async (file) => {
            try {
                const fileName = (0, path_1.basename)(file);
                const targetPath = (0, path_1.join)(basePath, fileName);
                await uploadFile(file, targetPath);
            }
            catch (error) {
                if (!options.continueOnFailure)
                    throw error;
                core.warning(`文件上传失败：${error.message}`);
            }
        }));
    }
    catch (error) {
        throw new Error(`上传失败：${error.message}`);
    }
}
async function run() {
    try {
        const options = {
            packageName: core.getInput('name', { required: true }),
            artifactPath: core.getInput('build-path', { required: true }),
            version: core.getInput('version', { required: true }),
            targetDir: core.getInput('target-dir', { required: true }),
            continueOnFailure: core.getBooleanInput('continue-on-failure')
        };
        await runUpload(options);
        core.setOutput('uploaded-files', '成功上传文件');
    }
    catch (error) {
        core.setFailed(error instanceof Error ? error.message : '未知错误');
    }
}
run();
