import soundtrackUrl from './assets/coastline-walk.mp3?url';
export class MusicPlayer {
 constructor(onChange=()=>{}){
  this.audio=new Audio(soundtrackUrl);this.audio.loop=true;this.audio.preload='none';this.audio.volume=.75;
  this.enabled=true;this.unlocked=false;this.wanted=false;this.error='';this.onChange=onChange;
  this.audio.addEventListener('error',()=>{this.error='配樂無法載入，請重新整理後再試。';onChange();});
 }
 async sync(playing,hidden=false,unlock=false){
  if(unlock)this.unlocked=true;
  this.wanted=this.unlocked&&this.enabled&&playing&&!hidden;
  if(!this.wanted){this.audio.pause();return;}
  try{await this.audio.play();if(!this.wanted)this.audio.pause();else this.error='';}
  catch(error){if(this.wanted&&error.name!=='AbortError')this.error='請點播放以啟動聲音，或確認瀏覽器沒有封鎖音訊。';}
  this.onChange();
 }
 destroy(){this.wanted=false;this.audio.pause();}
}
