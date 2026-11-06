export const stages=[1,2,4,8,16,32,64,128,256,512];
export class Player {
 constructor(reduced=false){this.count=64;this.progress=reduced?1:0;this.playing=!reduced;this.touring=false;this.stageIndex=0;this.completed=false;this.speed=2;}
 startTour(){this.touring=true;this.completed=false;this.stageIndex=0;this.count=1;this.progress=0;this.playing=true;}
 stopTour(){this.touring=false;}
 manual(count){this.count=Math.max(1,Math.min(512,Math.round(count)));this.touring=false;this.completed=false;this.progress=0;}
 toggle(){if(this.completed){this.completed=false;this.progress=0;}this.playing=!this.playing;}
 restart(){this.completed=false;this.progress=0;this.playing=true;}
 changeRegion(){if(this.touring)this.startTour();else{this.completed=false;this.progress=this.playing?0:1;}}
 advance(dt){
  if(!this.playing)return;
  this.progress+=dt/(this.touring?7:24)*this.speed;
  if(this.touring&&this.progress>=1.13){
   if(this.stageIndex<stages.length-1){this.stageIndex++;this.count=stages[this.stageIndex];this.progress=0;}
   else{this.progress=1;this.playing=false;this.touring=false;this.completed=true;}
  }else if(!this.touring&&this.progress>1.07)this.progress=0;
 }
}
