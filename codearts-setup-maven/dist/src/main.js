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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.installMaven = installMaven;
exports.configureEnvironment = configureEnvironment;
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const exec_1 = require("@actions/exec");
const os_1 = __importDefault(require("os"));
async function run() {
    try {
        const version = core.getInput('maven_version');
        const installDir = await installMaven(version);
        await configureEnvironment(installDir);
    }
    catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}
async function installMaven(version) {
    const platform = os_1.default.platform();
    const isWindows = platform === 'win32';
    let url = '';
    if (isWindows) {
        url = `https://dlcdn.apache.org/maven/maven-3/${version}/binaries/apache-maven-${version}-bin.zip`;
    }
    else {
        url = `https://dlcdn.apache.org/maven/maven-3/${version}/binaries/apache-maven-${version}-bin.tar.gz`;
    }
    const dirPath = path.join(__dirname, '..', 'download', 'maven-3', version, 'binaries');
    try {
        // 检查目录是否存在
        await fs.access(dirPath);
        console.log('目录已存在');
    }
    catch {
        try {
            // 不存在则创建
            await fs.mkdir(dirPath, { recursive: true });
            console.log('目录创建成功');
        }
        catch (err) {
            console.error('无法创建目录:', err);
        }
    }
    const filename = `apache-maven-${version}-bin.zip`;
    core.info(`Downloading Maven ${version} from ${url}`);
    const downloadPath = path.join(dirPath, filename);
    const downloadPath2 = await tc.downloadTool(url, downloadPath);
    console.log(`文件下载到: ${downloadPath2}`);
    core.info('Extracting Maven...');
    const extractDir = await tc.extractTar(downloadPath2, 'maven');
    const toolRoot = path.join(extractDir, `apache-maven-${version}`);
    // todo 需要环境变量 RUNNER_TOOL_CACHE
    // const cacheDir = await tc.cacheDir(toolRoot, 'maven', version);
    return toolRoot;
}
async function configureEnvironment(installDir) {
    const m2Home = path.join(installDir, 'bin');
    core.addPath(m2Home);
    core.exportVariable('M2_HOME', installDir);
    // Verify installation
    await (0, exec_1.exec)('mvn', ['-version']);
}
// Run the main function when executed directly
if (require.main === module) {
    run();
}
