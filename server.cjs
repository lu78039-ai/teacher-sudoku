const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 if(pathname==='/__qa/pwa.html'){fs.readFile(path.join(__dirname,'qa/pwa/diagnostics.html'),(err,data)=>{res.writeHead(err?404:200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(err?'Not found':data)});return}
 let relative=pathname.replace(/^\/teacher-sudoku\/dist(?=\/|$)/,'').replace(/^\/dist(?=\/|$)/,'').replace(/^\//,'');
 if(!relative||relative.endsWith('/'))relative+='index.html';
 const target=path.resolve(root,relative);
 if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(target,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(err?'Not found':data)});
});
if(require.main===module)server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/teacher-sudoku/dist/index.html'));
module.exports={server,mime};
