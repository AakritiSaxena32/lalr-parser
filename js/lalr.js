const LALR = (()=>{
  function build(){
    const cg=new Map();
    State.lr1States.forEach(st=>{
      // Since LR1 groups cores perfectly now, this accurately maps identical cores
      const ck=st.items.map(LR1.cKey).sort().join('||');
      if(!cg.has(ck))cg.set(ck,[]); cg.get(ck).push(st.id);
    });
    
    State.lalrStates=[]; const map=new Map();
    
    cg.forEach(ids=>{
      const lid=State.lalrStates.length; ids.forEach(id=>map.set(id,lid));
      const cm=new Map();
      
      ids.forEach(id=>State.lr1States[id].items.forEach(it=>{
        const k=LR1.cKey(it);
        if(!cm.has(k))cm.set(k,{lhs:it.lhs,rhs:it.rhs,dot:it.dot,las:new Set()});
        // Group all merged lookaheads from multiple LR1 states
        it.las.forEach(la => cm.get(k).las.add(la));
      }));
      
      // Flatten the lookaheads specifically so parsetable.js can read `it.la` as strings
      const items=[]; 
      cm.forEach(({lhs,rhs,dot,las})=>las.forEach(la=>items.push({lhs,rhs,dot,la})));
      State.lalrStates.push({id:lid,items});
    });

    State.lalrTrans=State.lalrStates.map(()=>({}));
    State.lr1States.forEach(st=>{
      const lf=map.get(st.id);
      const syms=new Set(); st.items.forEach(it=>{if(it.dot<it.rhs.length)syms.add(it.rhs[it.dot]);});
      syms.forEach(sym=>{
        const nx=LR1.gotoItems(st.items,sym); if(!nx)return;
        const tk=LR1.sKey(nx),tgt=State.lr1States.find(s=>LR1.sKey(s.items)===tk); if(!tgt)return;
        const lt=map.get(tgt.id);
        if(State.lalrTrans[lf][sym]===undefined)State.lalrTrans[lf][sym]=lt;
      });
    });
  }
  
  function render(){
    const origin={};
    State.lalrStates.forEach((_,from)=>{
      const tr=State.lalrTrans[from]||{};
      Object.entries(tr).forEach(([sym,to])=>{
        if(to!==from&&!origin[to])origin[to]={from,sym};
      });
    });
    let h='';
    State.lalrStates.forEach(st=>{
      const lbl=st.id===0
        ?`<span style="color:var(--c)">I0</span> <span style="color:var(--txt3)">· initial state</span>`
        :`<span style="color:var(--c)">I${st.id}</span> <span style="color:var(--txt3)">= GOTO(I${origin[st.id]?.from??'?'}, <span style="color:var(--cy)">${esc(origin[st.id]?.sym??'?')}</span>)</span>`;
      h+=`<div class="si-box"><div class="si-head">${lbl}</div><ul class="si-list">`;
      
      // Re-group just for rendering purposes to keep LALR visually clean
      const grp = new Map();
      st.items.forEach(it => {
         const ck = LR1.cKey(it);
         if(!grp.has(ck)) grp.set(ck, { ...it, las: new Set([it.la]) });
         else grp.get(ck).las.add(it.la);
      });

      grp.forEach(it=>{
        const be=it.rhs.slice(0,it.dot).map(s=>isNT(s)?`<span class="nt-sym">${esc(s)}</span>`:esc(s)).join(' ');
        const af=it.rhs.slice(it.dot).map(s=>isNT(s)?`<span class="nt-sym">${esc(s)}</span>`:esc(s)).join(' ');
        const las = [...it.las].sort().join('/');
        h+=`<li><span class="nt-sym">${esc(it.lhs)}</span> &#8594; ${be} <span class="dot-sym">•</span> ${af} <span class="la-sym">, ${esc(las)}</span></li>`;
      });
      h+='</ul></div>';
    });
    document.getElementById('step3Result').innerHTML=h;
  }
  return{build,render};
})();