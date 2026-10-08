import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
export function loadTs(path,globals={}) {
 const exports={};
 const source=fs.readFileSync(new URL(`../../src/${path}`,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2018,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const localRequire=name=>name.startsWith('@/')?loadTs(name.slice(2)+'.ts',globals):require(name);
 vm.runInNewContext(code,{exports,require:localRequire,process:{env:{}},Headers,...globals});
 return exports;
}
