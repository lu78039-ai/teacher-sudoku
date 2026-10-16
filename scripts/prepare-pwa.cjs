const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../dist');
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    const file = path.join(dir,e.name);
    return e.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root).filter(f => /\.(html|js|css|png|webmanifest)$/.test(f) && path.basename(f) !== 'sw.js').sort();
const assets = files.map(f => path.relative(root,f).split(path.sep).join('/'));
const template = fs.readFileSync(path.join(__dirname,'sw-template.js'),'utf8').replace(/\r\n/g,'\n');
const hash = crypto.createHash('sha256').update(template);
// Git/Windows newline conversion must not invalidate the release fingerprint.
files.forEach((f,i) => hash.update(assets[i]).update('\0').update(f.endsWith('.png') ? fs.readFileSync(f) : fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n')));
const version = hash.digest('hex').slice(0,20);
const output = template.replace('__VERSION__',version).replace('__ASSETS__',JSON.stringify(assets,null,2));
const target = path.join(root,'sw.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n') !== output) throw Error('Service Worker is stale: run node scripts/prepare-pwa.cjs');
} else fs.writeFileSync(target,output);
console.log(`PWA ${version}: ${assets.length} offline assets verified`);
