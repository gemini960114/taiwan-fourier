import {M,TAU} from './fourier.js';
export function createRenderer(canvas){
 const palettes={
  warm:{grid:'#95856b35',outline:'#82766380',circle:'#36857eaa',vector:'#417e78aa',trace:'#243746',glow:'#fff1b8',tip:'#c66b32',tipGlow:'#e9a05c'},
  dark:{grid:'#6685a335',outline:'#94abc080',circle:'#64d8ff99',vector:'#a3eaffb3',trace:'#ffffff',glow:'#dcbfff',tip:'#ffc466',tipGlow:'#ffb64b'}
 };
 let palette=palettes.warm;
 const ctx=canvas.getContext('2d');let W=0,H=0,scale=1,modelWidth=1;
 function resize(){const b=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=b.width;H=b.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);scale=Math.min(H*.77,W*.75/Math.max(modelWidth,.75));}
 function path(points,color,width){ctx.beginPath();points.forEach((p,i)=>{const x=W/2+p.x*scale,y=H/2+p.y*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 function draw(model,drawing,progress,circles){
  if(modelWidth!==model.width){modelWidth=model.width;resize();}
  ctx.clearRect(0,0,W,H);ctx.strokeStyle=palette.grid;ctx.lineWidth=1;
  for(let x=W/2%32;x<W;x+=32)for(let y=H/2%32;y<H;y+=32){ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();}
  path(model.raw,palette.outline,1);const t=Math.min(progress,1);let x=model.dc.re,y=model.dc.im;
  if(circles)for(const c of drawing.active){const a=c.phase+TAU*c.freq*t,nx=x+c.amp*Math.cos(a),ny=y+c.amp*Math.sin(a);ctx.beginPath();ctx.arc(W/2+x*scale,H/2+y*scale,c.amp*scale,0,TAU);ctx.strokeStyle=palette.circle;ctx.lineWidth=1;ctx.stroke();path([{x,y},{x:nx,y:ny}],palette.vector,1);x=nx;y=ny;}
  const tip=drawing.point(t),visible=drawing.trace.slice(0,Math.floor(t*M)+1);visible.push(tip);ctx.shadowColor=palette.glow;ctx.shadowBlur=9;path(visible,palette.trace,2.5);ctx.shadowColor=palette.tipGlow;ctx.shadowBlur=18;ctx.fillStyle=palette.tip;ctx.beginPath();ctx.arc(W/2+tip.x*scale,H/2+tip.y*scale,4,0,TAU);ctx.fill();ctx.shadowBlur=0;
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 return {draw,setTheme:theme=>{palette=palettes[theme]||palettes.warm;},destroy:()=>observer.disconnect()};
}
