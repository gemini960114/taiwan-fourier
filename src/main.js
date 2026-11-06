import './style.css';
import coastline from './data/coastline.json';
import countiesUrl from './data/counties.json?url';
import {analyzeOutline,reconstruct} from './fourier.js';
import {Player,stages} from './player.js';
import {createRenderer} from './renderer.js';
import {MusicPlayer} from './music.js';

const el=id=>document.getElementById(id);
const player=new Player(matchMedia('(prefers-reduced-motion: reduce)').matches);
const regions=new Map([['taiwan',{id:'taiwan',name:'台灣本島',points:coastline}]]);
const models=new Map();
let region=regions.get('taiwan'),model=analyzeOutline(coastline),drawing=reconstruct(model,player.count);
models.set(region.id,model);
const renderer=createRenderer(document.querySelector('canvas'));
const music=new MusicPlayer(updateMusicUI);
function updateMusicUI(){
 el('music').textContent=music.enabled?'♫ 音樂：開':'♫ 音樂：關';el('music').setAttribute('aria-pressed',String(music.enabled));
 el('listen').textContent=music.preview?'■ 停止試聽':'▶ 試聽配樂';
 el('audioNote').textContent=music.error||`配樂：${music.name} · 可獨立試聽，也可載入自己的音檔（僅在本機播放）。`;
}
function syncMusic(unlock=false){void music.sync(player.playing,document.hidden,unlock);}
function rebuild(){drawing=reconstruct(model,player.count);el('error').textContent=drawing.error.toFixed(3)+'%';}
function updateUI(){
 el('count').value=player.count;el('n').value=player.count;el('stageCount').textContent=player.count;
 el('play').textContent=player.playing?'暫停':'播放';el('play').setAttribute('aria-pressed',String(!player.playing));
 el('auto').textContent=player.touring?'■ 結束自動示範':'▶ 自動示範';
 el('regionTitle').textContent=region.name;
 el('regionNote').textContent=region.id==='taiwan'?'台灣本島海岸線，不含離島。':`${region.name}：${region.parts>1?'描繪最大連續陸塊的外輪廓，不包含其他離島或分離區塊。':'描繪行政區外輪廓。'}${region.holes?'內部孔洞（如其他縣市）不在本次描線範圍。':''} 圖資版本：2020-08-20。`;
 document.querySelector('canvas').setAttribute('aria-label',`旋轉圓描繪${region.name}外輪廓的動畫`);
 el('status').textContent=player.completed?'示範完成 · 512 個圓，已達本頁最高精細度':player.touring?`自動示範 ${player.stageIndex+1} / ${stages.length} · ${player.count} 個圓${player.playing?'':' · 已暫停'}`:`手動模式 · ${player.count} 個圓${player.playing?'':' · 已暫停'}`;
 document.querySelectorAll('#steps button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.count===player.count)));
 el('tourProgress').value=player.completed?10:player.touring?player.stageIndex+Math.min(player.progress,1):0;
}
function selectCount(n){player.manual(n);rebuild();updateUI();}
for(const n of stages){const button=document.createElement('button');button.textContent=n;button.dataset.count=n;button.onclick=()=>{selectCount(n);syncMusic(true)};el('steps').append(button);}
el('count').addEventListener('input',()=>selectCount(+el('count').value));
el('speed').onchange=()=>{player.speed=+el('speed').value;};
el('auto').onclick=()=>{if(player.touring)player.stopTour();else player.startTour();rebuild();updateUI();syncMusic(true);};
el('play').onclick=()=>{player.toggle();music.preview=false;updateMusicUI();updateUI();syncMusic(true);};
el('restart').onclick=()=>{player.restart();updateUI();syncMusic(true);};
el('music').onclick=()=>{music.enabled=!music.enabled;updateMusicUI();syncMusic(true);};
el('volume').oninput=()=>music.setVolume(+el('volume').value);
el('listen').onclick=()=>{music.preview=!music.preview;if(music.preview)music.enabled=true;else if(player.playing)music.enabled=false;updateMusicUI();syncMusic(true);};
el('audioFile').onchange=()=>{const file=el('audioFile').files[0];if(file){music.setTrack(file);music.preview=true;updateMusicUI();syncMusic(true);}};
el('defaultMusic').onclick=()=>{music.setTrack(null);el('audioFile').value='';music.preview=true;updateMusicUI();syncMusic(true);};
el('region').onchange=()=>{
 region=regions.get(el('region').value)||regions.get('taiwan');
 if(!models.has(region.id))models.set(region.id,analyzeOutline(region.points));
 model=models.get(region.id);player.changeRegion();rebuild();updateUI();syncMusic();
};
// Keep the main-island initial load small; county boundaries load independently.
fetch(countiesUrl).then(response=>{if(!response.ok)throw Error('County data unavailable');return response.json();}).then(counties=>{
 counties.sort((a,b)=>a.name.localeCompare(b.name,'zh-Hant')).forEach(r=>{regions.set(r.id,r);const option=document.createElement('option');option.value=r.id;option.textContent=r.name;el('region').append(option);});
}).catch(()=>{el('regionNote').textContent='縣市資料載入失敗，請重新整理。台灣本島仍可使用。';});
let last=0,raf;
document.addEventListener('visibilitychange',()=>{last=0;syncMusic();});
function frame(now){
 const dt=last?Math.min((now-last)/1000,.1):0;last=now;
 if(!document.hidden){const previous=player.count,wasPlaying=player.playing;player.advance(dt);if(previous!==player.count){rebuild();updateUI();}if(wasPlaying!==player.playing){updateUI();syncMusic();}
 el('tourProgress').value=player.completed?10:player.touring?player.stageIndex+Math.min(player.progress,1):0;
 renderer.draw(model,drawing,player.progress,el('circles').checked);}
 raf=requestAnimationFrame(frame);
}
rebuild();updateUI();updateMusicUI();raf=requestAnimationFrame(frame);
if(import.meta.hot)import.meta.hot.dispose(()=>{cancelAnimationFrame(raf);renderer.destroy();music.destroy();});
