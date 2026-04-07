const Grammar = (()=>{
  function parseText(txt){
    const g={}; let start=null;
    let currentLhs = null; // Track active non-terminal for multiline inputs

    txt.trim().split('\n').forEach(line=>{
      line=line.trim(); if(!line)return;
      
      let rhsPart = line;
      const idx=line.indexOf('->'); 
      
      if(idx >= 0){
        currentLhs=line.slice(0,idx).trim();
        rhsPart=line.slice(idx+2);
        if(!currentLhs)return; 
        if(!start)start=currentLhs;
        if(!g[currentLhs])g[currentLhs]=[];
      } else if (currentLhs && line.startsWith('|')) {
        rhsPart = line.substring(1).trim(); // Remove leading |
      } else {
        return; // Invalid line format
      }

      rhsPart.split('|').forEach(alt=>{
        const syms=alt.trim().split(/\s+/).filter(Boolean);
        g[currentLhs].push(syms.length ? syms.join(' ') : 'ε');
      });
    });
    return{g,start};
  }
  
  function hasLR(g){ for(const nt in g)for(const p of g[nt])if(p.split(' ')[0]===nt)return true; return false; }
  
  function augment(g,s){
    let ns=s+"'";
    while(g[ns])ns+="'";
    State.augProds=[{lhs:ns,rhs:[s]}];
    for(const lhs in g)g[lhs].forEach(r=>{const rhs=r==='ε'?[]:r.split(' ').filter(Boolean);State.augProds.push({lhs,rhs});});
    State.nonterms=[ns,...Object.keys(g).filter(nt=>nt!==ns)];
    const ts=new Set(['$']);
    State.augProds.forEach(p=>p.rhs.forEach(x=>{if(!State.nonterms.includes(x))ts.add(x);}));
    ts.delete('ε'); State.terms=[...ts].sort();
  }
  
  function renderResult(lrWarn,ambigHtml){
    ambigHtml=ambigHtml||'';
    let h='';
    if(lrWarn){
      h+=`<div class="msg msg-warn"><span class="msg-ico">&#9888;</span><span>Left recursion detected. LALR handles this natively.</span></div>`;
    }else{
      h+=`<div class="msg msg-ok"><span class="msg-ico">&#10003;</span><span>No left recursion detected.</span></div>`;
    }
    h+=ambigHtml;
    h+=`<div class="rb" style="margin-top:12px"><div class="rb-head">augmented grammar</div><div class="rb-body"><div class="code-lines">`;
    State.augProds.forEach((p,i)=>h+=`<div><span class="pn">${i}</span><span class="nt">${esc(p.lhs)}</span><span class="arrow"> &#8594; </span><span class="kw">${esc(p.rhs.join(' ')||'ε')}</span></div>`);
    h+=`</div></div></div>`;
    document.getElementById('step0Result').innerHTML=h;
  }

  function checkAmbiguity(g){
    const reasons=[];
    for(const nt in g){
      const prods=g[nt];
      const selfRecBoth=prods.filter(p=>{
        const ss=p.split(' ');
        return ss[0]===nt && ss[ss.length-1]===nt && ss.length>=3;
      });
      if(selfRecBoth.length>=2){
        reasons.push(`"${nt}" has ${selfRecBoth.length} rules of the form ${nt} op ${nt} — no operator precedence encoded, so the same expression can be parsed in multiple ways.`);
      }
      for(let i=0;i<prods.length;i++){
        for(let j=0;j<prods.length;j++){
          if(i===j)continue;
          const a=prods[i].split(' '), b=prods[j].split(' ');
          if(b.length>a.length && a.every((s,k)=>s===b[k])){
            reasons.push(`"${nt}" has a production that is a prefix of another — this creates a dangling-else style ambiguity.`);
          }
        }
      }
      const epsilonOrSingle=prods.filter(p=>p==='ε'||p.split(' ').length===1);
      if(epsilonOrSingle.length>=2 && prods.length===epsilonOrSingle.length){
        reasons.push(`"${nt}" has multiple single-token or epsilon alternatives with no distinguishing context.`);
      }
    }
    return [...new Set(reasons)];
  }

  function renderAmbiguity(reasons){
    if(!reasons.length) return '';
    let h=`<div class="rb" style="margin-top:12px">
      <div class="rb-head">ambiguity analysis</div>
      <div class="rb-body">`;
    h+=`<div class="msg msg-warn" style="margin:0 0 8px">
      <span class="msg-ico">&#9888;</span>
      <span><b>Grammar is likely ambiguous.</b></span>
    </div>`;
    reasons.forEach(r=>{
      h+=`<div style="font-size:11.5px;color:var(--cy);padding:4px 0;border-bottom:1px solid var(--border);line-height:1.6">&#8594; ${esc(r)}</div>`;
    });
    h+=`</div></div>`;
    return h;
  }

  function submit(){
    const txt=document.getElementById('grammarInput').value;
    if(!txt.trim()){alert('Enter a grammar.');return;}
    const{g,start}=parseText(txt);
    if(!start){alert('Cannot parse grammar — check format (use ->).');return;}
    State.reset();
    for(let i=1;i<=6;i++){const e=document.getElementById('step'+i+'Result');if(e)e.innerHTML='';}
    
    const subElReset=document.getElementById('step0Sub');
    if(subElReset) subElReset.innerHTML='Enter a context-free grammar. Use <code>-&gt;</code> and <code>|</code> for alternatives.';
    State.startSymbol=start;
    
    let wg=g, lrWarn=hasLR(g), lfWarn=false;
    
    for(const nt in g){
      const prods=g[nt];
      for(let i=0;i<prods.length;i++){
        for(let j=i+1;j<prods.length;j++){
          if(prods[i].split(' ')[0]===prods[j].split(' ')[0]){lfWarn=true;}
        }
      }
    }
    State.grammar=wg;
    augment(wg,start);
    FirstFollow.compute();
    State.grammarOK=true;

    const ambigReasons=checkAmbiguity(g);
    const isAmbig=ambigReasons.length>0;

    renderResult(lrWarn,renderAmbiguity(ambigReasons));
    FirstFollow.render();

    const voiceLines=['Grammar compiled successfully.'];
    if(lrWarn) voiceLines.push('Left recursion was detected. LALR handles this natively, so the grammar remains unchanged.');
    if(lfWarn) voiceLines.push('Left factoring was detected in this grammar.');
    if(isAmbig){
      voiceLines.push('Warning: this grammar appears to be ambiguous.');
      ambigReasons.forEach(r=>voiceLines.push(r));
      voiceLines.push('You may still explore the parser steps, but conflicts may appear in the table.');
    } else {
      voiceLines.push('The grammar shows no obvious signs of ambiguity.');
    }
    voiceLines.push('Use the sidebar to explore each step.');

    let tbMsg = 'Grammar compiled.';
    if(isAmbig) tbMsg = '⚠ Ambiguous grammar detected — see analysis below.';
    else if(lrWarn && lfWarn) tbMsg = 'Grammar compiled. Left recursion & left factoring detected.';
    else if(lrWarn) tbMsg = 'Grammar compiled. Left recursion detected.';
    else if(lfWarn) tbMsg = 'Grammar compiled. Left factoring detected.';
    else tbMsg = 'Grammar compiled. No structural issues detected.';
    
    document.getElementById('tbMsg').textContent = tbMsg;
    Voice.speakSequence(voiceLines,350);
  }

  function loadExample(){
    const exGrammar='E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id';
    document.getElementById('grammarInput').value=exGrammar;
    const{g}=parseText(exGrammar);
    const reasons=checkAmbiguity(g);
    const lrPresent=hasLR(g);
    let lfPresent=false;
    for(const nt in g){
      const prods=g[nt];
      for(let i=0;i<prods.length;i++)
        for(let j=i+1;j<prods.length;j++)
          if(prods[i].split(' ')[0]===prods[j].split(' ')[0]) lfPresent=true;
    }
    if(reasons.length>0){
      Voice.setMessage('Example grammar loaded. Note: this grammar appears ambiguous. Click Run to compile and see details.');
    } else if(lrPresent){
      Voice.setMessage('Example grammar loaded. It contains left recursion. Click Run to compile.');
    } else if(lfPresent){
      Voice.setMessage('Example grammar loaded. It contains left factoring. Click Run to compile.');
    } else {
      Voice.setMessage('Example grammar loaded. Click Run to compile it.');
    }
  }
  return{submit,loadExample};
})();