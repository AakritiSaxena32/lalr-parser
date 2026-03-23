const Parser = (()=>{

  // ── PARSE SIMULATION ──
  function simulate(){
    const raw=document.getElementById('inputString').value.trim();
    if(!raw){alert('Enter space-separated tokens.');return;}
    const toks=[...raw.split(/\s+/).filter(Boolean),'$'];
    let stk=[0],sym=[],ns=[],idx=0,accepted=false;
    State.lastRoot=null;
    const rows=[];
    while(true){
      const state=stk[stk.length-1],la=toks[idx],act=State.ACTION[state]?.[la];
      rows.push({stk:[...stk],sym:[...sym],inp:toks.slice(idx),act:act||'ERROR'});
      if(!act)break;
      if(act==='acc'){
        accepted=true;
        State.lastRoot=ns.length===1?ns[0]:{sym:State.startSymbol,children:ns.slice()};
        break;
      }
      if(act[0]==='s'){
        const j=parseInt(act.slice(1));
        stk.push(j);sym.push(la);ns.push({sym:la,children:[]});idx++;
      }else if(act[0]==='r'){
        const pi=parseInt(act.slice(1)),prod=State.augProds[pi],n=prod.rhs.length;
        const ch=[];
        for(let k=0;k<n;k++){stk.pop();sym.pop();ch.unshift(ns.pop());}
        const top=stk[stk.length-1],gs=State.GOTO[top]?.[prod.lhs];
        if(gs===undefined){rows.push({stk:[...stk],sym:[...sym],inp:toks.slice(idx),act:'ERROR — no GOTO'});break;}
        stk.push(gs);sym.push(prod.lhs);ns.push({sym:prod.lhs,children:ch});
      }
      if(rows.length>600){rows.push({stk:[],sym:[],inp:[],act:'LIMIT'});break;}
    }

    let h='<div class="rb" style="margin-top:16px"><div class="rb-head">trace &mdash; '+rows.length+' step'+(rows.length!==1?'s':'')+'</div><div class="rb-body"><div style="overflow-x:auto"><table>';
    h+='<tr><th>States</th><th>Symbols</th><th>Input</th><th>Action</th></tr>';
    rows.forEach(r=>{
      const pi=r.act.startsWith('r')?parseInt(r.act.slice(1)):-1;
      const prod=pi>=0?State.augProds[pi]:null;
      const at=r.act==='acc'?'<span class="c-ac">accept</span>'
        :r.act.startsWith('ERROR')?'<span class="c-er">'+esc(r.act)+'</span>'
        :r.act.startsWith('s')?'<span class="c-sh">shift &#8594; '+r.act.slice(1)+'</span>'
        :prod?'<span class="c-re">reduce &nbsp;'+esc(prod.lhs)+' &#8594; '+esc(prod.rhs.join(' ')||'ε')+'</span>'
        :'<span class="c-er">'+esc(r.act)+'</span>';
      h+='<tr><td class="c-st">'+r.stk.join(' ')+'</td><td>'+(r.sym.join(' ')||'&mdash;')+'</td><td>'+r.inp.join(' ')+'</td><td>'+at+'</td></tr>';
    });
    h+='</table></div></div></div>';
    h+=accepted
      ?'<div class="msg msg-acc"><span class="msg-ico">&#10003;</span><span>String accepted &mdash; navigate to step 06 to view the parse tree.</span></div>'
      :'<div class="msg msg-rej"><span class="msg-ico">&#10007;</span><span>String rejected &mdash; verify tokens against the grammar\'s terminal alphabet.</span></div>';
    document.getElementById('step5Result').innerHTML=h;
    Voice.setMessage(accepted?'Accepted! See the parse tree in step 06.':'Rejected. Check your input tokens.');
  }

  // ── SVG PARSE TREE RENDERER ──
  const NODE_R = 22;   // node circle radius
  const H_GAP  = 20;   // min horizontal gap between siblings
  const V_GAP  = 70;   // vertical gap between levels
  const PAD    = 36;   // canvas padding

  // Step 1: compute subtree width (bottom-up)
  function _measure(node){
    if(!node.children||!node.children.length){
      node._w = NODE_R*2;
      return;
    }
    node.children.forEach(_measure);
    const total = node.children.reduce((s,c)=>s+c._w, 0) + H_GAP*(node.children.length-1);
    node._w = Math.max(NODE_R*2, total);
  }

  // Step 2: assign x,y positions (top-down, centred)
  function _place(node, x, y){
    node._x = x;
    node._y = y;
    if(!node.children||!node.children.length) return;
    const total = node.children.reduce((s,c)=>s+c._w,0) + H_GAP*(node.children.length-1);
    let cx = x - total/2;
    node.children.forEach(child=>{
      _place(child, cx + child._w/2, y + V_GAP);
      cx += child._w + H_GAP;
    });
  }

  // Step 3: collect canvas bounds
  function _bounds(node, b){
    b.minX=Math.min(b.minX, node._x - NODE_R);
    b.maxX=Math.max(b.maxX, node._x + NODE_R);
    b.maxY=Math.max(b.maxY, node._y + NODE_R);
    (node.children||[]).forEach(c=>_bounds(c,b));
  }

  // Step 4: emit SVG strings into arrays (lines first, then circles, then text)
  function _emit(node, dx, lines, circles, texts){
    const cx = node._x + dx;
    const cy = node._y;
    const isTerm = !isNT(node.sym);

    // Lines to children (drawn behind circles)
    (node.children||[]).forEach(child=>{
      const ccx = child._x + dx;
      const ccy = child._y;
      // Line from bottom of parent to top of child
      lines.push('<line x1="'+cx+'" y1="'+(cy+NODE_R)+'" x2="'+ccx+'" y2="'+(ccy-NODE_R)+'" stroke="#243346" stroke-width="1.5"/>');
      _emit(child, dx, lines, circles, texts);
    });

    // Circle
    const fill   = isTerm ? 'rgba(0,217,200,0.10)'   : 'rgba(167,139,250,0.12)';
    const stroke = isTerm ? 'rgba(0,217,200,0.40)'    : 'rgba(167,139,250,0.40)';
    const tcolor = isTerm ? '#00d9c8'                 : '#a78bfa';
    circles.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+NODE_R+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1"/>');

    // Label (truncate if too long)
    const lbl = node.sym.length > 5 ? node.sym.slice(0,4)+'\u2026' : node.sym;
    texts.push('<text x="'+cx+'" y="'+cy+'" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono,monospace" font-size="11" font-weight="500" fill="'+tcolor+'">'+esc(lbl)+'</text>');
  }

  function renderTree(){
    const el=document.getElementById('step6Result');
    if(!State.lastRoot){
      el.innerHTML='<div class="msg msg-warn"><span class="msg-ico">&#9888;</span><span>No parse tree yet. Complete a successful parse in step 05 first.</span></div>';
      return;
    }

    const root=State.lastRoot;
    _measure(root);
    _place(root, root._w/2, NODE_R + PAD);

    const b={minX:Infinity,maxX:-Infinity,maxY:-Infinity};
    _bounds(root,b);

    const dx  = PAD - b.minX;
    const svgW = b.maxX - b.minX + PAD*2;
    const svgH = b.maxY + NODE_R + PAD*2;

    const lines=[], circles=[], texts=[];
    _emit(root, dx, lines, circles, texts);

    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+svgW+'" height="'+svgH+'" style="display:block;">'
      +lines.join('')
      +circles.join('')
      +texts.join('')
      +'</svg>';

    el.innerHTML='<div style="background:#131920;border:1px solid #1c2736;border-radius:8px;margin-top:14px;overflow:auto;padding:20px;">'
      +'<div style="display:inline-block;min-width:100%;">'+svg+'</div>'
      +'</div>';
  }

  return{simulate,renderTree};
})();