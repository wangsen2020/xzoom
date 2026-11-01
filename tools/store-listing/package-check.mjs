import fs from 'node:fs/promises';import path from 'node:path';import{createHash}from'node:crypto';import{unzipSync,strFromU8}from'fflate';
const root=path.resolve(import.meta.dirname,'../..'),pkg=JSON.parse(await fs.readFile(root+'/package.json','utf8')),zip=root+'/artifacts/xzoom-'+pkg.version+'.zip',bytes=await fs.readFile(zip),files=unzipSync(bytes),manifest=JSON.parse(strFromU8(files['manifest.json']));
if(manifest.version!==pkg.version||manifest.manifest_version!==3||manifest.name!=='__MSG_extName__')throw Error('Unexpected package');
for(const name of Object.keys(files))if(/(^|\/)(node_modules|scratch|tools|tests|\.git|profile|Cookies)(\/|$)/i.test(name))throw Error('Forbidden ZIP entry: '+name);
const locales={};for(const locale of['en','zh_CN','pt_BR','es']){const m=JSON.parse(strFromU8(files['_locales/'+locale+'/messages.json']));if(!m.extName?.message||[...m.extName.message].length>75||[...m.description.message].length>132)throw Error('Invalid title or summary: '+locale);locales[locale]={name:m.extName.message,summary:m.description.message};}
if(manifest.homepage_url!=='https://goodexts.com/')throw Error('Homepage mismatch');
const result={version:manifest.version,zip,sha256:createHash('sha256').update(bytes).digest('hex'),files:Object.keys(files).length,permissions:manifest.permissions||[],sites:manifest.content_scripts[0].matches,locales};
await fs.mkdir(root+'/artifacts/store',{recursive:true});await fs.writeFile(root+'/artifacts/store/package-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
