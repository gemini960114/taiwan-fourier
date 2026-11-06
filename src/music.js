import soundtrackUrl from './assets/coastline-walk.mp3?url';
export class MusicPlayer {
 constructor(onChange=()=>{}){
  this.audio=new Audio(soundtrackUrl);this.audio.loop=true;this.audio.preload='none';this.audio.volume=.75;
  this.enabled=true;this.preview=false;this.unlocked=false;this.wanted=false;this.customUrl=null;this.name='海岸漫步 · 原創鋼琴與輕節奏';this.error='';this.onChange=onChange;
  this.audio.addEventListener('error',()=>{this.error='這個音檔無法播放，請選其他歌曲或恢復預設配樂。';onChange();});
 }
 async sync(playing,hidden=false,unlock=false){
  if(unlock)this.unlocked=true;
  this.wanted=this.unlocked&&this.enabled&&(playing||this.preview)&&!hidden;
  if(!this.wanted){this.audio.pause();return;}
  try{await this.audio.play();if(!this.wanted)this.audio.pause();else this.error='';}
  catch(error){if(this.wanted&&error.name!=='AbortError')this.error='請點「試聽配樂」啟動聲音，或確認瀏覽器沒有封鎖音訊。';}
  this.onChange();
 }
 setVolume(value){this.audio.volume=Math.max(0,Math.min(1,value/100));}
 setTrack(file){
  this.audio.pause();if(this.customUrl)URL.revokeObjectURL(this.customUrl);
  this.customUrl=file?URL.createObjectURL(file):null;
  this.audio.src=this.customUrl||soundtrackUrl;
  this.name=file?file.name:'海岸漫步 · 原創鋼琴與輕節奏';this.error='';this.enabled=true;this.onChange();
 }
 destroy(){this.wanted=false;this.audio.pause();if(this.customUrl)URL.revokeObjectURL(this.customUrl);}
}
