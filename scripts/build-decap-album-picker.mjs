// Rebuild the pinned Decap bundle with native album multi-selection support.
// Usage: node scripts/build-decap-album-picker.mjs /path/to/original-decap-cms-3.8.3.js
import fs from 'node:fs';
const input=process.argv[2];
if(!input)throw new Error('Supply the original official Decap CMS 3.8.3 dist/decap-cms.js');
let s=fs.readFileSync(input,'utf8');
function replace(a,b){if(!s.includes(a))throw Error('Pinned Decap source differs: '+a.slice(0,60));s=s.replace(a,()=>b);}
replace('type:"file",accept:t?"image/*":"*/*",onChange:n','type:"file",multiple:true,accept:t?"image/*":"*/*",onChange:n');
replace('handleAssetClick",e=>{const t=this.state.selectedFile.key===e.key?{}:e;this.setState({selectedFile:t})}',`handleAssetClick",e=>{if(this.props.albumMultiple){this.setState(previous=>{const files=previous.selectedFiles||[];const next=files.some(f=>f.key===e.key||f.path===e.path)?files.filter(f=>f.key!==e.key&&f.path!==e.path):[...files,e];return {selectedFiles:next,selectedFile:next[next.length-1]||{}}});return;}const t=this.state.selectedFile.key===e.key?{}:e;this.setState({selectedFile:t})}`);
replace('selectedFile:{},query:""}),this.state.isPersisted','selectedFile:{},selectedFiles:[],query:""}),this.state.isPersisted');
replace('handleInsert",()=>{const{selectedFile:e}=this.state,{path:t}=e,{insertMedia:n,field:r}=this.props;n(t,r),this.handleClose()}',`handleInsert",()=>{const{selectedFile:e}=this.state,{path:t}=e,{insertMedia:n,field:r}=this.props;n(this.props.albumMultiple?(this.state.selectedFiles||[]).map(f=>f.path):t,r),this.handleClose()}`);
replace('field:n})},{loadMedia:Nc',`field:n,albumMultiple:t.get("allowMultiple")!==false&&n?.get("widget")==="album-photos"})},{loadMedia:Nc`);
replace('selectedFile:this.state.selectedFile,handleFilter', 'selectedFile:this.state.selectedFile,selectedFiles:this.props.albumMultiple?this.state.selectedFiles||[]:[],handleFilter');
replace('query:p,selectedFile:f,handleFilter','query:p,selectedFile:f,selectedFiles:albumSelection=[],handleFilter');
replace('isSelectedFile:e=>f.key===e.key','isSelectedFile:e=>albumSelection.some(item=>item.key===e.key||item.path===e.path)||f.key===e.key');
replace('s=[...a][0],l=r.get("max_file_size");',`s=[...a][0],l=r.get("max_file_size");if(this.props.albumMultiple){const uploaded=[];for(const file of [...a]){if(l&&file.size>l){window.alert(i("mediaLibrary.mediaLibrary.fileTooLarge",{size:Math.floor(l/1e3)}));continue;}const result=await t(file,{privateUpload:n,field:o});const asset=result?.payload?.file||result?.payload;if(asset?.path)uploaded.push(asset);}this.setState(previous=>{const next=[...(previous.selectedFiles||[]),...uploaded];return {selectedFiles:next,selectedFile:next[next.length-1]||{},isPersisted:false}});e.target.value=null;return;}`);

fs.writeFileSync(new URL('../public/admin/vendor/decap-cms-3.8.3.js',import.meta.url),s);
