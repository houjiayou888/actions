import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';

export async function run() {
    try {
        const version = core.getInput('go-version');
        const archInput = core.getInput('architecture') || os.arch(); // 支持自动判断架构

        // 架构转换
        const arch = archInput === 'x86' ? '386' : archInput === 'x64' ? 'amd64' : archInput;

        // 平台转换
        let platform: string = os.platform();
        platform = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'darwin' : 'linux';

        const ext = platform === 'windows' ? 'zip' : 'tar.gz';
        const url = `https://golang.org/dl/go${version}.${platform}-${arch}.${ext}`;

        core.info(`开始下载 Go ${version}：${url}`);
        const archivePath = await tc.downloadTool(url);

        core.info(`解压 Go 包...`);
        const extracted = ext === 'zip'
            ? await tc.extractZip(archivePath)
            : await tc.extractTar(archivePath);

        const goRoot = path.join(extracted, 'go');
        const goBin = path.join(goRoot, 'bin');

        core.addPath(goBin);
        core.exportVariable('GOROOT', goRoot);
        core.setOutput('go-path', goBin);

        core.info(`✅ Go ${version} 安装成功，路径：${goRoot}`);
    } catch (error: any) {
        core.setFailed(`❌ 安装失败：${error.message}`);
    }
}

if (require.main === module) {
    run();
}
