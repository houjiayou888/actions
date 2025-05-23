import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as path from 'path';

export async function run() {
    try {
        const version = core.getInput('go-version');
        const archInput = core.getInput('architecture') || 'x64';

        const platform = os.platform();
        const arch = archInput === 'x86' ? '386' : archInput;

        let platformStr: string = platform;
        if (platform === 'win32') platformStr = 'windows';

        const ext = platformStr === 'windows' ? 'zip' : 'tar.gz';
        const goUrl = `https://golang.org/dl/go${version}.${platformStr}-${arch}.${ext}`;

        core.info(`开始下载 Go：${goUrl}`);
        const goArchive = await tc.downloadTool(goUrl);

        const extractedPath = ext === 'zip'
            ? await tc.extractZip(goArchive)
            : await tc.extractTar(goArchive);

        const goRoot = path.join(extractedPath, 'go');
        core.addPath(path.join(goRoot, 'bin'));
        core.setOutput('go-path', path.join(goRoot, 'bin'));

        core.info(`Go ${version} 安装完成，路径：${goRoot}`);
    } catch (error) {
        core.setFailed((error as Error).message);
    }
}

// 如果是直接运行脚本，则执行
if (require.main === module) {
    run();
}
