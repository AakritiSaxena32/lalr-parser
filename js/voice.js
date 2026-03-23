// ── VOICE MODULE ──
// Cross-OS female voice selection with mute/resume support.
// Priority: Apple Siri voices → Google female → Microsoft Zira → any en-US

const Voice = (()=>{
  let muted = false;
  let femaleVoice = null;
  let voicesLoaded = false;

  // Per-OS best female voice priority lists
  const VOICE_PRIORITY = [
    // Apple / macOS / iOS — Siri voices
    'Samantha',       // macOS/iOS default Siri (en-US)
    'Siri',
    'Karen',          // Australian Siri
    'Moira',          // Irish Siri
    'Tessa',          // South African Siri
    'Fiona',          // Scottish Siri
    'Ava',            // Enhanced macOS
    'Allison',        // Enhanced macOS
    'Victoria',       // macOS
    'Nicky',          // macOS Siri-style
    // Google (Chrome on Windows/Android/Linux)
    'Google US English',
    'Google UK English Female',
    // Microsoft (Windows / Edge)
    'Microsoft Zira - English (United States)',
    'Microsoft Zira Desktop - English (United States)',
    'Zira',
    // Amazon / Other
    'Joanna',
    'Amy',
  ];

  function _pickVoice(){
    const voices = window.speechSynthesis.getVoices();
    if(!voices.length) return;
    voicesLoaded = true;

    // Try priority list first
    for(const name of VOICE_PRIORITY){
      const v = voices.find(v => v.name === name);
      if(v){ femaleVoice = v; return; }
    }
    // Fallback: any voice with 'female' in name or description
    femaleVoice = voices.find(v => /female/i.test(v.name))
      // Fallback: prefer en-US then en-GB then any English
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang === 'en-GB')
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
  }

  // Pre-warm immediately and on async voice load
  _pickVoice();
  if('onvoiceschanged' in window.speechSynthesis){
    window.speechSynthesis.onvoiceschanged = () => { _pickVoice(); };
  }

  // Resume state
  let _resumeSentences = [];
  let _resumeIndex = 0;
  let _resumePauseMs = 180;
  let _resumeText = null;

  function _utter(text, rate=1.15){
    return new Promise(resolve => {
      if(muted){ resolve(); return; }
      if(!voicesLoaded) _pickVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = 1.1;
      if(femaleVoice) u.voice = femaleVoice;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.speak(u);
    });
  }

  async function speakSequence(sentences, pauseMs=180){
    if(!sentences.length) return;
    _resumeSentences = sentences;
    _resumePauseMs = pauseMs;
    _resumeText = null;
    window.speechSynthesis.cancel();

    _resumeIndex = 0;
    if(!muted) await _utter(sentences[0]);

    for(let i = 1; i < sentences.length; i++){
      if(muted){
        _resumeIndex = i;
        return;
      }
      _resumeIndex = i;
      if(pauseMs > 0) await new Promise(r => setTimeout(r, pauseMs));
      if(!muted) await _utter(sentences[i]);
    }
    _resumeSentences = [];
  }

  function setMessage(t){
    const el = document.getElementById('tbMsg');
    if(el) el.textContent = t;
    _resumeSentences = [];
    _resumeText = t;
    if(muted) return;
    window.speechSynthesis.cancel();
    _utter(t);
  }

  function init(){
    _pickVoice();
    document.getElementById('muteBtn').addEventListener('click', () => {
      muted = !muted;
      document.getElementById('vpulse').classList.toggle('off', muted);
      document.getElementById('vlbl').textContent = muted ? 'VOICE MUTED' : 'VOICE ACTIVE';
      document.getElementById('muteBtn').textContent = muted ? 'UNMUTE' : 'MUTE';

      if(muted){
        window.speechSynthesis.cancel();
      } else {
        // Resume from where we left off
        if(_resumeSentences.length > 0){
          speakSequence(_resumeSentences.slice(_resumeIndex), _resumePauseMs);
        } else if(_resumeText){
          _utter(_resumeText);
        }
      }
    });
  }

  return { setMessage, speakSequence, init };
})();