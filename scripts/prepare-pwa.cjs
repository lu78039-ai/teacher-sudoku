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
const digest=content=>crypto.createHash('sha256').update(content).digest('hex');
const hashes=Object.fromEntries(files.map((f,i)=>[assets[i],digest(f.endsWith('.png')?fs.readFileSync(f):fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'))]));
const levelText=fs.readFileSync(path.join(root,'levels.js'),'utf8');
const match=levelText.match(/const LEVELS=(\[[\s\S]*\]);?\s*$/);if(!match)throw Error('Unrecognized levels data');
const levelCount=JSON.parse(match[1]).length;
const release=JSON.stringify({version,levelCount,assets:hashes},null,2)+'\n';
hashes['release.json']=digest(release);assets.push('release.json');
const output = template.replace('__VERSION__',version).replace('__ASSETS__',JSON.stringify(assets,null,2)).replace('__HASHES__',JSON.stringify(hashes,null,2)).replace('__LEVEL_COUNT__',String(levelCount));
const target = path.join(root,'sw.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n') !== output) throw Error('Service Worker is stale: run node scripts/prepare-pwa.cjs');
  if(!fs.existsSync(path.join(root,'release.json'))||fs.readFileSync(path.join(root,'release.json'),'utf8').replace(/\r\n/g,'\n')!==release)throw Error('release.json is stale');
} else {fs.writeFileSync(target,output);fs.writeFileSync(path.join(root,'release.json'),release);}
console.log(`PWA ${version}: ${assets.length} offline assets verified`);
