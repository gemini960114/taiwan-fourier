export const M=1024,TAU=2*Math.PI;
export function analyzeOutline(coordinates){
// Local equirectangular projection preserves Taiwan's approximate aspect ratio.
let raw=coordinates.map(([lon,lat])=>({x:lon*Math.cos(23.7*Math.PI/180),y:-lat}));
let minX=Math.min(...raw.map(p=>p.x)),maxX=Math.max(...raw.map(p=>p.x)),minY=Math.min(...raw.map(p=>p.y)),maxY=Math.max(...raw.map(p=>p.y));
const height=maxY-minY;
raw=raw.map(p=>({x:(p.x-(minX+maxX)/2)/height,y:(p.y-(minY+maxY)/2)/height}));
const lengths=[0];for(let i=1;i<=raw.length;i++){let a=raw[i-1],b=raw[i%raw.length];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.y-a.y));}
const samples=[];let segment=0;
for(let i=0;i<M;i++){const d=i/M*lengths.at(-1);while(segment<raw.length-1&&lengths[segment+1]<d)segment++;const a=raw[segment],b=raw[(segment+1)%raw.length],q=(d-lengths[segment])/(lengths[segment+1]-lengths[segment]);samples.push({x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q});}
const coefficients=[];
for(let k=0;k<M;k++){let re=0,im=0;for(let j=0;j<M;j++){const t=TAU*k*j/M,c=Math.cos(t),s=Math.sin(t);re+=samples[j].x*c+samples[j].y*s;im+=samples[j].y*c-samples[j].x*s;}re/=M;im/=M;coefficients.push({freq:k>M/2?k-M:k,re,im,amp:Math.hypot(re,im),phase:Math.atan2(im,re)});}
const dc=coefficients[0];const ranked=coefficients.slice(1).sort((a,b)=>b.amp-a.amp);

return {raw,samples,dc,ranked,width:(maxX-minX)/height};
}

export function reconstruct(model,count){
 const active=model.ranked.slice(0,count);
 function point(t){let x=model.dc.re,y=model.dc.im;for(const c of active){x+=c.amp*Math.cos(c.phase+TAU*c.freq*t);y+=c.amp*Math.sin(c.phase+TAU*c.freq*t);}return {x,y};}
 const trace=Array.from({length:M+1},(_,i)=>point(i/M));
 const error=Math.sqrt(model.samples.reduce((sum,p,i)=>sum+(trace[i].x-p.x)**2+(trace[i].y-p.y)**2,0)/M)*100;
 return {active,point,trace,error};
}
