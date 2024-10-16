const path = require('path');
const fs = require('fs');
const dirname = __dirname;

const args = process.argv.slice(2);
console.log('Build arguments:', args);
const env = args[0] || 'prod';

function copyFolderRecursiveSync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }
  fs.readdirSync(source).forEach(function (file) {
    const currentPath = `${source}/${file}`;
    const targetPath = `${destination}/${file}`;

    if (fs.lstatSync(currentPath).isDirectory()) {
      copyFolderRecursiveSync(currentPath, targetPath);
    } else {
      fs.copyFileSync(currentPath, targetPath);
    }
  });
}
function copyFile(source, destination) {
  fs.copyFile(source, destination, (err) => {
    if (err) {
      console.error('文件复制失败:', err);
    } else {
      console.log('文件复制成功！');
    }
  });
}

copyFolderRecursiveSync(path.resolve(dirname, '../libs'), path.resolve(dirname, '../dist/libs'));
copyFolderRecursiveSync(path.resolve(dirname, '../sdk'), path.resolve(dirname, '../dist/sdk'));

copyFolderRecursiveSync(path.resolve(dirname, '../assets'), path.resolve(dirname, '../dist/assets'));
