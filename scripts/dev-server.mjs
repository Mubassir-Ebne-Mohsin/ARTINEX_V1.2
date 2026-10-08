import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GET as getNews } from '../api/news.js';
import { POST as newsletterPost } from '../api/newsletter.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT)||3000;
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost:3000'}`);
  if(url.pathname==='/api/news'||url.pathname==='/api/newsletter'){
    try{
      let body;
      if(req.method==='POST'){
        body=await new Promise(resolve=>{
          const chunks=[];let size=0;
          req.on('data',part=>{size+=part.length;if(size<=4096)chunks.push(part)});
          req.on('end',()=>resolve(Buffer.concat(chunks)));
        });
      }
      const request=new Request(url.toString(),{
        method:req.method,
        headers:req.headers,
        ...(req.method==='POST'?{body}:{}),
      });
      const response=url.pathname==='/api/news'?req.method==='GET'?await getNews(request):Response.json({error:'Method not allowed'}, {status:405}):req.method==='POST'?await newsletterPost(request):Response.json({error:'Method not allowed'},{status:405});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    }catch(err){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Internal server error'}));}return;
  }
  let pathname;
  try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end('Bad URL');return;}
  if(pathname.includes('\0')){res.writeHead(400);res.end();return;}
  let name=path.resolve(root,'.'+pathname);
  if(!name.startsWith(root+path.sep)&&name!==root){res.writeHead(403);res.end();return;}
  if(pathname==='/'||pathname.endsWith('/'))name=path.join(name,'index.html');
  if(!fs.existsSync(name)&&path.extname(name)==='')name+='.html';
  if(!fs.existsSync(name)||!fs.statSync(name).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  fs.createReadStream(name).pipe(res);
});
server.listen(port,()=>console.log(`Artinex local preview: http://localhost:${port}`));
