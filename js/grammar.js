const Grammar = (()=>{
  function parseText(txt){
    const g={}; let start=null;
    let currentLhs = null; 
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
        rhsPart = line.substring(1).trim(); 
      } else { return; }
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
  
  function submit(){
    const txt=document.getElementById('grammarInput').value;
    if(!txt.trim()){alert('Enter a grammar or use the Assistant.');return;}
    const{g,start}=parseText(txt);
    if(!start){alert('Format error: ensure rules use "->" (e.g., E -> T).');return;}
    State.reset();
    for(let i=1;i<=6;i++){const e=document.getElementById('step'+i+'Result');if(e)e.innerHTML='';}
    State.startSymbol=start;
    State.grammar=g;
    augment(g,start);
    FirstFollow.compute();
    State.grammarOK=true;
    FirstFollow.render();
    Voice.setMessage("Grammar compiled. Use the sidebar to explore.");
    document.getElementById('tbMsg').textContent = 'Grammar compiled successfully.';
  }

  function loadExample(){
    const exGrammar='E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id';
    document.getElementById('grammarInput').value=exGrammar;
    Voice.setMessage('Example grammar loaded.');
  }
  return{submit,loadExample};
})();
