// Produce a minimal, self-contained Pages artifact; no research archive or build JS.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dest=path.join(root,'_site');
await fs.rm(dest,{recursive:true,force:true});
await fs.mkdir(dest,{recursive:true});
for(const file of await fs.readdir(root))if(file.endsWith('.html'))await fs.copyFile(path.join(root,file),path.join(dest,file));
for(const dir of ['assets','docs'])await fs.cp(path.join(root,dir),path.join(dest,dir),{recursive:true});
await fs.mkdir(path.join(dest,'vendor/katex'),{recursive:true});
for(const file of ['katex.min.css','LICENSE'])await fs.copyFile(path.join(root,'vendor/katex',file),path.join(dest,'vendor/katex',file));
await fs.cp(path.join(root,'vendor/katex/fonts'),path.join(dest,'vendor/katex/fonts'),{recursive:true});
await fs.writeFile(path.join(dest,'.nojekyll'),'');
console.log('Staged HTML, browser modules, local fonts, licenses and restoration records in _site/.');
