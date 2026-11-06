import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Player,stages} from '../src/player.js';
import {analyzeOutline,reconstruct} from '../src/fourier.js';
const load=name=>JSON.parse(readFileSync(new URL('../src/data/'+name,import.meta.url),'utf8'));
test('jump demonstration completes all 10 stages and holds final outline',()=>{
 const p=new Player();assert.equal(p.speed,2);p.startTour();
 for(const n of stages){assert.equal(p.count,n);p.advance(7*1.14/p.speed);}
 assert.equal(p.completed,true);assert.equal(p.progress,1);assert.equal(p.playing,false);p.advance(100);assert.equal(p.progress,1);
 p.startTour();assert.equal(p.count,1);assert.equal(p.progress,0);assert.equal(p.playing,true);
});
test('pause, speed, manual, region change, restart and reduced motion',()=>{
 const p=new Player();p.startTour();p.advance(1);p.toggle();const pause=p.progress;p.advance(100);assert.equal(p.progress,pause);p.toggle();p.speed=4;p.advance(2);assert.equal(p.count,2);
 p.changeRegion();assert.equal(p.count,1);assert.equal(p.touring,true);
 p.manual(11);assert.equal(p.touring,false);assert.equal(p.count,11);p.stopTour();p.toggle();p.changeRegion();assert.equal(p.progress,1);assert.equal(p.playing,false);p.restart();assert.equal(p.progress,0);assert.equal(p.playing,true);
 const reduced=new Player(true);assert.equal(reduced.progress,1);assert.equal(reduced.playing,false);
});
test('all 22 official county outlines are finite, closed and improve with more circles',()=>{
 const counties=load('counties.json');assert.equal(counties.length,22);assert.equal(new Set(counties.map(c=>c.id)).size,22);
 const entries=[{name:'台灣本島',points:load('coastline.json')},...counties];
 for(const region of entries){
  assert.deepEqual(region.points[0],region.points.at(-1),region.name+' closed ring');
  const model=analyzeOutline(region.points);assert(model.width>0);assert(model.raw.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
  let previous=Infinity;
  for(const n of [1,16,64,512]){const d=reconstruct(model,n);assert(Number.isFinite(d.error));assert(d.error<previous,region.name+' error decreases');previous=d.error;assert(Math.hypot(d.trace[0].x-d.trace.at(-1).x,d.trace[0].y-d.trace.at(-1).y)<1e-10);}
 }
});
