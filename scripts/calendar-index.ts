import fs from 'node:fs';
import path from 'node:path';
import type {Plugin} from 'vite';

export function calendarIndex(): Plugin {
  const folder=path.resolve('src/content/calendar');
  const read=()=>JSON.stringify(fs.readdirSync(folder).filter(file=>file.endsWith('.json')).map(file=>{
    const event=JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));
    return {slug:file.slice(0,-5),title:event.title,date:event.date,time:event.time,category:event.category};
  }));
  return {
    name:'ksis-admin-calendar-index',
    configureServer(server) {
      server.middlewares.use('/admin/calendar-index.json',(_req,res)=>{
        try {res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(read());}
        catch {res.statusCode=500;res.end('{"error":"CALENDAR_INDEX_FAILED"}');}
      });
    },
    generateBundle() {this.emitFile({type:'asset',fileName:'admin/calendar-index.json',source:read()});}
  };
}
