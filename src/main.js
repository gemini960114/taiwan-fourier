import './style.css';
import coastline from './data/coastline.json';
import countiesUrl from './data/counties.json?url';
import {analyzeOutline,reconstruct} from './fourier.js';
import {Player,stages} from './player.js';
import {createRenderer} from './renderer.js';

const el=id=>document.getElementById(id);
const player=new Player(matchMedia('(prefers-reduced-motion: reduce)').matches);
const regions=new Map([['taiwan',{id:'taiwan',name:'台灣本島',points:coastline}]]);
const models=new Map();
let region=regions.get('taiwan'),model=analyzeOutline(coastline),drawing=reconstruct(model,player.count);
models.set(region.id,model);
const renderer=createRenderer(document.querySelector('canvas'));
function rebuild(){drawing=reconstruct(model,player.count);el('error').textContent=drawing.error.toFixed(3)+'%';}
function updateUI(){
 const custom=!stages.includes(player.count);
 el('count').value=custom?'custom':String(player.count);el('customCountLabel').hidden=!custom;el('customCount').value=player.count;
 el('formulaCount').textContent=player.count;el('formulaSetCount').textContent=player.count;
 document.querySelector('.equation').setAttribute('aria-label',`z ${player.count} of t equals c zero plus the sum over n in S ${player.count} of c n times e to the power i two pi n t`);
 el('play').textContent=player.playing?'暫停':'播放';el('play').setAttribute('aria-pressed',String(!player.playing));
 el('auto').textContent=player.touring?'■ 結束自動示範':'▶ 自動示範';
 el('regionTitle').textContent=region.name;
 el('regionNote').textContent=region.id==='taiwan'?'台灣本島海岸線，不含離島。':`${region.name}：${region.parts>1?'描繪最大連續陸塊的外輪廓，不包含其他離島或分離區塊。':'描繪行政區外輪廓。'}${region.holes?'內部孔洞（如其他縣市）不在本次描線範圍。':''} 圖資版本：2020-08-20。`;
 document.querySelector('canvas').setAttribute('aria-label',`旋轉圓描繪${region.name}外輪廓的動畫`);
 el('status').textContent=player.completed?'示範完成 · 512 個圓，已達本頁最高精細度':player.touring?`自動示範 ${player.stageIndex+1} / ${stages.length} · ${player.count} 個圓${player.playing?'':' · 已暫停'}`:`手動模式 · ${player.count} 個圓${player.playing?'':' · 已暫停'}`;
 el('tourProgress').value=player.completed?10:player.touring?player.stageIndex+Math.min(player.progress,1):0;
}
function selectCount(n){player.manual(n);if(!player.playing)player.progress=1;rebuild();updateUI();}
el('count').onchange=()=>{
 if(el('count').value==='custom'){el('customCountLabel').hidden=false;el('customCount').value=player.count;el('customCount').focus();el('customCount').select();}
 else selectCount(+el('count').value);
};
el('customCount').onchange=()=>{const input=el('customCount');if(input.value!==''&&input.checkValidity())selectCount(+input.value);else{input.reportValidity();input.value=player.count;}};
el('speed').onchange=()=>{player.speed=+el('speed').value;};
el('auto').onclick=()=>{if(player.touring)player.stopTour();else player.startTour();rebuild();updateUI();};
el('play').onclick=()=>{player.toggle();updateUI();};
el('restart').onclick=()=>{player.restart();updateUI();el('settings').close();};
function setTheme(value){
 const theme=value==='dark'?'dark':'warm';
 document.documentElement.dataset.theme=theme;
 el('theme').value=theme;renderer.setTheme(theme);
 try{localStorage.setItem('taiwan-fourier-theme',theme);}catch{}
}
let savedTheme='warm';try{savedTheme=localStorage.getItem('taiwan-fourier-theme')||'warm';}catch{}
setTheme(savedTheme);
el('theme').onchange=()=>setTheme(el('theme').value);
const settings=el('settings');
el('settingsOpen').onclick=()=>settings.showModal();
el('settingsClose').onclick=()=>settings.close();
el('settingsDone').onclick=()=>settings.close();
settings.addEventListener('click',event=>{if(event.target===settings){const rect=settings.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)settings.close();}});
el('region').onchange=()=>{
 region=regions.get(el('region').value)||regions.get('taiwan');
 if(!models.has(region.id))models.set(region.id,analyzeOutline(region.points));
 model=models.get(region.id);player.changeRegion();rebuild();updateUI();
};
// Keep the main-island initial load small; county boundaries load independently.
fetch(countiesUrl).then(response=>{if(!response.ok)throw Error('County data unavailable');return response.json();}).then(counties=>{
 counties.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hant')).forEach(r=>{regions.set(r.id,r);const option=document.createElement('option');option.value=r.id;option.textContent=r.name;el('region').append(option);});
}).catch(()=>{el('regionNote').textContent='縣市資料載入失敗，請重新整理。台灣本島仍可使用。';});
let last=0,raf;
document.addEventListener('visibilitychange',()=>{last=0;});
function frame(now){
 const dt=last?Math.min((now-last)/1000,.1):0;last=now;
 if(!document.hidden){const previous=player.count,wasPlaying=player.playing;player.advance(dt);if(previous!==player.count){rebuild();updateUI();}if(wasPlaying!==player.playing){updateUI();}
 el('tourProgress').value=player.completed?10:player.touring?player.stageIndex+Math.min(player.progress,1):0;
 renderer.draw(model,drawing,player.progress,el('circles').checked);}
 raf=requestAnimationFrame(frame);
}
rebuild();updateUI();raf=requestAnimationFrame(frame);
if(import.meta.hot)import.meta.hot.dispose(()=>{cancelAnimationFrame(raf);renderer.destroy();});
