// 引入必要的模块
const fs = require('fs');         // Node.js 文件系统模块，用于文件操作
const archiver = require('archiver');  // 用于创建 ZIP 压缩包
const path = require('path');     // 路径处理模块，跨平台兼容路径拼接

// 插件名称，用于生成压缩包文件名
const PLUGIN_NAME = 'setup-go';

// 输出的 ZIP 文件名
const OUTPUT_ZIP = `${PLUGIN_NAME}.zip`;

// 构建输出目录，包含编译后的插件主文件
const DIST_DIR = 'dist';

// 检查必要文件是否存在
if (!fs.existsSync(DIST_DIR) || !fs.existsSync('action.yml')) {
    console.error('❌ 缺少必要文件：dist/, action.yml');
    process.exit(1); // 如果缺少关键文件，则终止脚本执行
}

// 创建写入 ZIP 文件的流对象
const output = fs.createWriteStream(OUTPUT_ZIP);

// 创建 archiver 实例，指定压缩格式为 zip，使用最高压缩等级（zlib level 9）
const archive = archiver('zip', {zlib: {level: 9}});

// 当 ZIP 文件写入完成时触发
output.on('close', function () {
    console.log(`✅ 插件已打包完成: ${OUTPUT_ZIP}（${archive.pointer()} bytes）`);
});

// 捕获压缩过程中的错误
archive.on('error', function (err) {
    throw err;
});

// 将 ZIP 内容通过管道写入到输出文件流中
archive.pipe(output);

// 向 ZIP 包中添加 action.yml 文件，并保持原文件名
archive.file('action.yml', {name: 'action.yml'});
if (fs.existsSync('action-layout.json')) {
    archive.file('action-layout.json', {name: 'action-layout.json'});
}

// 向 ZIP 包中添加 README.md 文件，并保持原文件名
if (fs.existsSync('README.md')) {
    archive.file('README.md', {name: 'README.md'});
}
// 向 ZIP 包中添加 dist 目录及其所有内容，压缩后路径为 dist/
archive.directory(DIST_DIR, 'dist');

// 完成 ZIP 打包操作
archive.finalize();
