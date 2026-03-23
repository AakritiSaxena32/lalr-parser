const ParseTable = (()=>{
  function build(){
    const as=State.augProds[0]?.lhs;
    State.ACTION=State.lalrStates.map(()=>({}));
    State.GOTO=State.lalrStates.map(()=>({}));
    State.lalrStates.forEach((st,i)=>{
      st.items.forEach(it=>{
        if(it.dot<it.rhs.length){
          const sym=it.rhs[it.dot];
          if(!isNT(sym)&&sym!=='ε'){
            const j=State.lalrTrans[i][sym];
            if(j!==undefined)State.ACTION[i][sym]='s'+j;
          }
        }else{
          if(it.lhs===as&&it.la==='$'){State.ACTION[i]['$']='acc';}
          else{
            const pi=State.augProds.findIndex(p=>p.lhs===it.lhs&&p.rhs.join(' ')===it.rhs.join(' '));
            if(pi!==-1&&!State.ACTION[i][it.la])State.ACTION[i][it.la]='r'+pi;
          }
        }
      });
      State.nonterms.forEach(nt=>{const j=State.lalrTrans[i][nt];if(j!==undefined)State.GOTO[i][nt]=j;});
    });
  }
  function render(){
    const tl=State.terms.filter(t=>t!=='$').sort(); tl.push('$');
    const ntl=State.nonterms;
    const sepL='border-left:2px solid var(--border2)';
    const sepR='border-right:2px solid var(--border2)';

    let h='<div class="rb"><div class="rb-head">parsing table</div><div class="rb-body"><div style="overflow-x:auto"><table>';

    // ── Row 1: group headers ──
    h+=`<tr style="background:rgba(255,255,255,.04)">`;
    h+=`<th rowspan="2" style="vertical-align:middle;${sepR};color:var(--txt3);font-size:10px;letter-spacing:1px">STATE</th>`;
    h+=`<th colspan="${tl.length}" style="text-align:center;${sepR};color:var(--c);font-size:10px;letter-spacing:2px;border-bottom:1px solid var(--border2)">ACTION</th>`;
    h+=`<th colspan="${ntl.length}" style="text-align:center;color:var(--cp);font-size:10px;letter-spacing:2px;border-bottom:1px solid var(--border2)">GOTO</th>`;
    h+=`</tr>`;

    // ── Row 2: individual column names ──
    h+=`<tr>`;
    tl.forEach((t,i)=>{
      const extra=i===0?sepL:'';
      const isLast=i===tl.length-1;
      h+=`<th class="t-col" style="${extra}${isLast?';'+sepR:''}">${esc(t)}</th>`;
    });
    ntl.forEach((nt,i)=>{
      const isFirst=i===0;
      h+=`<th class="n-col" style="${isFirst?sepL:''}">${esc(nt)}</th>`;
    });
    h+=`</tr>`;

    // ── Data rows ──
    State.lalrStates.forEach((_,i)=>{
      h+=`<tr><td class="c-st" style="${sepR}">${i}</td>`;
      tl.forEach((t,ti)=>{
        const v=State.ACTION[i][t]||'';
        let c='';
        if(v.startsWith('s'))c='c-sh';
        else if(v.startsWith('r'))c='c-re';
        else if(v==='acc')c='c-ac';
        const extra=ti===0?sepL:'';
        const isLast=ti===tl.length-1;
        h+=`<td class="${c}" style="${extra}${isLast?';'+sepR:''}">${v}</td>`;
      });
      ntl.forEach((nt,ni)=>{
        const v=State.GOTO[i][nt];
        h+=`<td class="c-gt" style="${ni===0?sepL:''}">${v!==undefined?v:''}</td>`;
      });
      h+=`</tr>`;
    });

    h+='</table></div></div></div>';

    // Productions reference
    h+='<div class="rb" style="margin-top:12px"><div class="rb-head">productions</div><div class="rb-body"><div class="code-lines">';
    State.augProds.forEach((p,i)=>h+=`<div><span class="pn">${i}</span><span class="nt">${esc(p.lhs)}</span><span class="arrow"> &#8594; </span><span class="kw">${esc(p.rhs.join(' ')||'ε')}</span></div>`);
    h+='</div></div></div>';

    document.getElementById('step4Result').innerHTML=h;
  }
  return{build,render};
})();
