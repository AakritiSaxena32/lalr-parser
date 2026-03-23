const FirstFollow = (()=>{
  function firstOfSeq(seq,la){
    const r=new Set(); let an=true;
    for(const s of seq){
      if(!isNT(s)){if(s!=='ε')r.add(s);an=false;break;}
      State.FIRST[s].forEach(x=>{if(x!=='ε')r.add(x);});
      if(!State.FIRST[s].has('ε')){an=false;break;}
    }
    if(an)r.add(la); return r;
  }
  function compute(){
    State.FIRST={}; State.nonterms.forEach(n=>State.FIRST[n]=new Set());
    let ch;
    do{ ch=false;
      State.augProds.forEach(({lhs,rhs})=>{
        const pre=State.FIRST[lhs].size;
        if(!rhs.length){State.FIRST[lhs].add('ε');}
        else{
          let an=true;
          for(const s of rhs){
            if(!isNT(s)){if(s!=='ε')State.FIRST[lhs].add(s);an=false;break;}
            State.FIRST[s].forEach(x=>{if(x!=='ε')State.FIRST[lhs].add(x);});
            if(!State.FIRST[s].has('ε')){an=false;break;}
          }
          if(an)State.FIRST[lhs].add('ε');
        }
        if(State.FIRST[lhs].size>pre)ch=true;
      });
    }while(ch);

    State.FOLLOW={}; State.nonterms.forEach(n=>State.FOLLOW[n]=new Set());
    State.FOLLOW[State.nonterms[0]].add('$');
    do{ ch=false;
      State.augProds.forEach(({lhs,rhs})=>{
        for(let i=0;i<rhs.length;i++){
          const B=rhs[i]; if(!isNT(B))continue;
          const pre=State.FOLLOW[B].size,beta=rhs.slice(i+1); let an=true;
          for(const s of beta){
            if(!isNT(s)){if(s!=='ε')State.FOLLOW[B].add(s);an=false;break;}
            State.FIRST[s].forEach(x=>{if(x!=='ε')State.FOLLOW[B].add(x);});
            if(!State.FIRST[s].has('ε')){an=false;break;}
          }
          if(an)State.FOLLOW[lhs].forEach(x=>State.FOLLOW[B].add(x));
          if(State.FOLLOW[B].size>pre)ch=true;
        }
      });
    }while(ch);
  }
  function render(){
    let h='<div class="ff-grid">';
    h+='<div class="rb"><div class="rb-head">first sets</div><div class="rb-body"><table><tr><th>NT</th><th>FIRST( · )</th></tr>';
    State.nonterms.forEach(n=>h+=`<tr><td class="c-nt">${esc(n)}</td><td class="c-sh">{ ${[...State.FIRST[n]].join(', ')} }</td></tr>`);
    h+='</table></div></div>';
    h+='<div class="rb"><div class="rb-head">follow sets</div><div class="rb-body"><table><tr><th>NT</th><th>FOLLOW( · )</th></tr>';
    State.nonterms.forEach(n=>h+=`<tr><td class="c-nt">${esc(n)}</td><td class="c-gt">{ ${[...State.FOLLOW[n]].join(', ')} }</td></tr>`);
    h+='</table></div></div></div>';
    document.getElementById('step1Result').innerHTML=h;
  }
  return{compute,render,firstOfSeq};
})();