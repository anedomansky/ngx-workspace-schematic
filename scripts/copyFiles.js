const { join } = require('path');
const fs = require('fs');

async function copySchema(srcDir, destDir) {
  await fs.copyFile(
    join(srcDir, 'schema.json'),
    join(destDir, 'schema.json'),
    (err) => {
      if (err) throw err;
      console.log(
        '> src/new-complete-angular-workspace/schema.json was copied to dist/new-complete-angular-workspace/schema.json'
      );
    }
  );
}

async function copyFiles(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true }, () => null);
  let entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = join(srcDir, entry.name);
    let destPath = join(destDir, entry.name);

    entry.isDirectory()
      ? await copyFiles(srcPath, destPath)
      : await fs.copyFile(srcPath, destPath, (err) => {
          if (err) throw err;
          console.log(`> ${srcPath} was copied to ${destPath}`);
        });
  }
}

async function copyCollection(srcDir, destDir) {
  return fs.copyFile(
    join(srcDir, 'collection.json'),
    join(destDir, 'collection.json'),
    (err) => {
      if (err) throw err;
      console.log('> src/collection.json was copied to dist/collection.json');
    }
  );
}

Promise.all([
  copySchema(
    './src/new-complete-angular-workspace',
    './dist/new-complete-angular-workspace'
  ),
  copyCollection('./src', './dist'),
  copyFiles(
    './src/new-complete-angular-workspace/files',
    './dist/new-complete-angular-workspace/files'
  ),
]).catch((err) => {
  console.error(err);
});
