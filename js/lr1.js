const LR1 = (()=>{
  function cKey(it){return `${it.lhs}|${it.rhs.join(' ')}|${it.dot}`;}

  function sKey(items){
    return items.map(it => `${cKey(it)}|${[...it.las].sort().join(',')}`).sort().join('||');
  }

  function closure(items){
    const m = new Map();
    items.forEach(it => {
      const k = cKey(it);
      if(!m.has(k)) m.set(k, { lhs: it.lhs, rhs: it.rhs, dot: it.dot, las: new Set(it.las) });
      else it.las.forEach(la => m.get(k).las.add(la));
    });

    const q = [...m.values()];
    while(q.length){
      const it = q.shift(); 
      if(it.dot >= it.rhs.length) continue;
      
      const B = it.rhs[it.dot]; 
      if(!isNT(B)) continue;

      const lasToAdd = new Set();
      it.las.forEach(la => {
        const f = FirstFollow.firstOfSeq(it.rhs.slice(it.dot + 1), la);
        f.forEach(x => lasToAdd.add(x));
      });

      State.augProds.filter(p => p.lhs === B).forEach(p => {
        const ck = `${B}|${p.rhs.join(' ')}|0`;
        if(!m.has(ck)){
          const ni = { lhs: B, rhs: p.rhs, dot: 0, las: new Set(lasToAdd) };
          m.set(ck, ni);
          q.push(ni);
        } else {
          const existing = m.get(ck);
          let added = false;
          lasToAdd.forEach(la => {
            if(!existing.las.has(la)){
              existing.las.add(la);
              added = true;
            }
          });
          if(added && !q.includes(existing)) q.push(existing);
        }
      });
    }
    return [...m.values()];
  }

  function gotoItems(items, sym){
    const mv = items.filter(it => it.dot < it.rhs.length && it.rhs[it.dot] === sym)
                    .map(it => ({ lhs: it.lhs, rhs: it.rhs, dot: it.dot + 1, las: new Set(it.las) }));
    return mv.length ? closure(mv) : null;
  }

 function build(){
    const startProd = State.augProds[0];
    const s0 = closure([{ lhs: startProd.lhs, rhs: startProd.rhs, dot: 0, las: new Set(['$']) }]);
    State.lr1States = [{ id: 0, items: s0 }];
    const km = new Map([[sKey(s0), 0]]);
    const q = [0];

    State.lr1Trans = {}; // Initialize transition map

    while(q.length){
      const id = q.shift();
      const st = State.lr1States[id];
      const syms = new Set();
      
      State.lr1Trans[id] = {}; // Initialize state map
      
      st.items.forEach(it => { if(it.dot < it.rhs.length) syms.add(it.rhs[it.dot]); });

      syms.forEach(sym => {
        const nx = gotoItems(st.items, sym); 
        if(!nx) return;
        const k = sKey(nx);
        let ni;
        if(!km.has(k)){
          ni = State.lr1States.length;
          km.set(k, ni);
          State.lr1States.push({ id: ni, items: nx });
          q.push(ni);
        } else {
          ni = km.get(k);
        }
        State.lr1Trans[id][sym] = ni; // Record the exact LR(1) transition
      });
    }
    
    State.lr1KeyMap = km; 
  }

  function render(){
    const origin = {};
    State.lr1States.forEach(st => {
      const syms = new Set();
      st.items.forEach(it => { if(it.dot < it.rhs.length) syms.add(it.rhs[it.dot]); });
      syms.forEach(sym => {
        const nx = gotoItems(st.items, sym);
        if(!nx) return;
        const k = sKey(nx);
        const tid = State.lr1KeyMap.get(k);
        if(tid > 0 && !origin[tid]) origin[tid] = { from: st.id, sym };
      });
    });

    let h = '';
    State.lr1States.forEach(st => {
      const lbl = st.id === 0
        ? `<span style="color:var(--c)">I0</span> <span style="color:var(--txt3)">· initial state</span>`
        : `<span style="color:var(--c)">I${st.id}</span> <span style="color:var(--txt3)">= GOTO(I${origin[st.id]?.from??'?'}, <span style="color:var(--cy)">${esc(origin[st.id]?.sym??'?')}</span>)</span>`;
      h += `<div class="si-box"><div class="si-head">${lbl}</div><ul class="si-list">`;
      
      st.items.forEach(it => {
        const be = it.rhs.slice(0, it.dot).map(s => isNT(s) ? `<span class="nt-sym">${esc(s)}</span>` : esc(s)).join(' ');
        const af = it.rhs.slice(it.dot).map(s => isNT(s) ? `<span class="nt-sym">${esc(s)}</span>` : esc(s)).join(' ');
        const las = [...it.las].sort().join('/'); 
        h += `<li><span class="nt-sym">${esc(it.lhs)}</span> &#8594; ${be} <span class="dot-sym">•</span> ${af} <span class="la-sym">, ${esc(las)}</span></li>`;
      });
      h += '</ul></div>';
    });
    document.getElementById('step2Result').innerHTML = h;
  }

  return { build, render, gotoItems, sKey, cKey };
})();