"""Create an original 16-bar instrumental loop; requires numpy. No external samples."""
from pathlib import Path
import numpy as np
import wave
SR=22050;beat=60/84;duration=64*beat;N=round(duration*SR)
mix=np.zeros((N,2));rng=np.random.default_rng(16)
def add(sound,start,level=.1,pan=0):
 data=np.asarray(sound)*level
 indices=(round(start*SR)+np.arange(len(data)))%N
 np.add.at(mix[:,0],indices,data*np.sqrt((1-pan)/2))
 np.add.at(mix[:,1],indices,data*np.sqrt((1+pan)/2))
def note(midi,start,length,level,kind='piano',pan=0):
 t=np.arange(round(length*SR))/SR;f=440*2**((midi-69)/12)
 if kind=='piano':
  sound=sum(a*np.sin(2*np.pi*f*h*t)*np.exp(-t*(1.5+h*.5)) for h,a in [(1,1),(2,.35),(3,.13),(4,.05)])
  sound*=np.minimum(t/.008,1)*np.minimum((length-t)/.08,1)
 elif kind=='pad':
  sound=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*1.002*t))*np.minimum(t/.25,1)*np.minimum((length-t)/.4,1)*.6
 else:
  sound=(np.sin(2*np.pi*f*t)+.2*np.sin(4*np.pi*f*t))*np.minimum(t/.012,1)*np.exp(-t*2.5)*np.minimum((length-t)/.08,1)
 add(sound,start,level,pan)
 if kind=='piano':add(sound,start+beat*.75,level*.18,-pan)
chords=[[60,64,67,71],[55,59,62,69],[57,60,64,67],[53,57,60,64]]
melodies=[[76,79,83,81,79,76],[74,78,81,79,78,74],[72,76,79,83,81,79],[72,76,79,76,74,71]]
for bar in range(16):
 start=bar*4*beat;chord=chords[bar%4]
 for i,n in enumerate(chord):note(n,start,4.5*beat,.052,'pad',(i-1.5)*.3)
 for i,n in enumerate([chord[0]-12,chord[0]-12,chord[2]-12]):note(n,start+[0,1.5,2.5][i]*beat,beat,.23,'bass')
 for i,n in enumerate(melodies[bar%4]):
  n=n+(12 if bar>=12 and i in [1,4] else 0)
  note(n,start+[0,.75,1.5,2,2.75,3.5][i]*beat,1.4*beat,.17,'piano',.15)
 for b in [0,2]:
  t=np.arange(int(SR*.28))/SR
  kick=np.sin(2*np.pi*(45*t+5*(1-np.exp(-t*30))))*np.exp(-t*16)*np.minimum(t/.003,1)
  add(kick,start+b*beat,.27)
 for b in [1,3]:
  t=np.arange(int(SR*.16))/SR;noise=rng.normal(0,1,len(t));noise=np.convolve(noise,[.25,.5,.25],mode='same')
  add((noise*.5+np.sin(2*np.pi*180*t)*.25)*np.exp(-t*27)*np.minimum(t/.003,1),start+b*beat,.13,-.15)
 for b in np.arange(.5,4,.5):
  t=np.arange(int(SR*.07))/SR;noise=rng.normal(0,1,len(t));noise=np.diff(noise,prepend=0)
  add(noise*np.exp(-t*65)*np.minimum(t/.002,1),start+b*beat,.025,.4)
# Gentle saturation and normalized peak, keeping headroom and a seamless periodic tail.
mix=np.tanh(mix*1.5);mix*=.88/np.max(np.abs(mix))
Path('src/assets').mkdir(exist_ok=True)
with wave.open('src/assets/coastline-walk.wav','wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((mix*32767).astype('<i2').tobytes())
print(f'{duration:.2f}s, peak={np.max(np.abs(mix)):.3f}, RMS={np.sqrt(np.mean(mix**2)):.3f}')
