// Small synthesized game sounds: no downloads, no autoplay, one shared audio context.
let gameAudio=null,soundEnabled=true;
try{soundEnabled=localStorage.getItem('teacher-sound')!=='off'}catch{}
function playGameSound(kind){
  if(!soundEnabled||typeof window==='undefined'||document.visibilityState==='hidden')return;
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    gameAudio ||= new Audio();
    if(gameAudio.state==='suspended')gameAudio.resume().catch(()=>{});
    const tunes={mark:[[740,0,.055]],teacher:[[523,0,.09],[784,.08,.14]],error:[[330,0,.1],[247,.1,.18]],win:[[523,0,.12],[659,.12,.12],[784,.24,.12],[1047,.36,.25]],fail:[[392,0,.12],[330,.14,.12],[262,.28,.25]]};
    for(const [hz,delay,duration] of tunes[kind]||[]){const t=gameAudio.currentTime+delay,osc=gameAudio.createOscillator(),gain=gameAudio.createGain();osc.type='sine';osc.frequency.setValueAtTime(hz,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain);gain.connect(gameAudio.destination);osc.start(t);osc.stop(t+duration+.01)}
  }catch{}
}
