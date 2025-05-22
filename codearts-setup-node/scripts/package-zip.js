const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream('setupnode.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ 插件已打包完成: setupnode.zip (${archive.pointer()} bytes)`);
});

archive.on('error', err => { throw err; });

archive.pipe(output);
archive.file('action.yml', { name: 'action.yml' });
archive.file('README.md', { name: 'README.md' });
archive.directory('dist/', 'dist');
archive.finalize();
