const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const workspace=path.resolve(__dirname,'../..');
http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const old=pathname.startsWith('/before/'),root=old?path.join(__dirname,'before/dist'):path.join(workspace,'dist');
  let relative=old?pathname.slice(8):pathname.replace(/^\/dist\//,'/').replace(/^\//,'');
  if(!relative||relative.endsWith('/'))relative+='index.html';
  const target=path.resolve(root,relative);
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(target,(err,bytes)=>{res.writeHead(err?404:200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.png':'image/png'})[path.extname(target)]||'text/plain','Cache-Control':'no-store'});res.end(err?'Not found':bytes)});
}).listen(4173,'127.0.0.1',()=>console.log('QA preview: http://127.0.0.1:4173/ (before: /before/)'));
