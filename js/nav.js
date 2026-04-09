const Nav = (()=>{
  const STEPS=[
    {label:'Grammar',       short:'grammar'},
    {label:'FIRST / FOLLOW',short:'first-follow'},
    {label:'LR(1) Items',   short:'lr1-items'},
    {label:'LALR States',   short:'lalr-states'},
    {label:'Parse Table',   short:'parse-table'},
    {label:'Simulate',      short:'simulate'},
    {label:'Parse Tree',    short:'parse-tree'},
  ];
  const HINTS=[
    'Enter a Context Free Grammar and click Run.',
    'FIRST and FOLLOW sets drive lookahead computation.',
    'LR(1) items — dot position plus lookahead terminal.',
    'LALR merges states sharing identical item cores.',
    'The parsing table drives every parser decision. Action columns say shift, reduce, or accept. Goto columns say which state to enter after a reduction.',
    'Type space-separated tokens then click Parse.',
    'Purple nodes are nonterminals. Cyan leaves are terminals.',
  ];

  function buildSidebar(){
    const nav=document.getElementById('sbNav');
    STEPS.forEach((s,i)=>{
      const d=document.createElement('div');
      d.className='nav-step'; d.dataset.idx=i;
      d.innerHTML='<span class="ns-idx">'+String(i).padStart(2,'0')+'</span><span class="ns-lbl">'+s.label+'</span><span class="ns-pip"></span>';
      d.addEventListener('click',()=>goTo(i));
      nav.appendChild(d);
    });
  }

  function showWelcome(speak){
    document.getElementById('welcome').classList.remove('hidden');
    document.querySelectorAll('.step-pane').forEach(p=>p.classList.remove('on'));
    document.querySelectorAll('.nav-step').forEach(el=>{el.classList.remove('active','done');});
    document.getElementById('tbStep').textContent='welcome';
    if(speak){
      Voice.speakSequence([
        'Welcome to the LALR Parser Generator.',
        'LALR stands for Look-Ahead L-R parser.',
        'It reads input Left to right, produces a Rightmost derivation, and uses one token of Look-Ahead to decide every shift or reduce action.',
        'LALR parsers power real-world tools like YACC and Bison because they handle most programming languages with very compact tables.',
        'They work by building the full LR-1 item sets, then merging states that share the same core, cutting table size without losing accuracy for most grammars.',
        'Select a step from the right sidebar, or click Start to enter your grammar.'
      ], 120);
    }
  }

  function goTo(s){
    if(s<0||s>6)return;
    if(s>0&&!State.grammarOK){alert('Submit a grammar first (step 00).');return;}
    let built2=false,built3=false,built4=false;
    try{
      if(s>=2&&!State.lr1States.length){LR1.build();built2=true;}
      if(s>=3&&!State.lalrStates.length){LALR.build();built3=true;}
      if(s>=4&&!State.ACTION.length){ParseTable.build();built4=true;}
    }catch(e){alert('Error: '+e.message);console.error(e);return;}
    document.getElementById('welcome').classList.add('hidden');
    if(s===2&&(built2||!document.getElementById('step2Result').innerHTML))LR1.render();
    if(s===3&&(built3||!document.getElementById('step3Result').innerHTML))LALR.render();
    if(s===4&&(built4||!document.getElementById('step4Result').innerHTML))ParseTable.render();
    if(s===6)Parser.renderTree();
    document.querySelectorAll('.step-pane').forEach((p,i)=>p.classList.toggle('on',i===s));
    document.querySelectorAll('.nav-step').forEach((el,i)=>{el.classList.toggle('active',i===s);el.classList.toggle('done',i<s);});
    document.getElementById('tbStep').textContent=STEPS[s].short;
    State.currentStep=s;
    Voice.setMessage(HINTS[s]);
  }

  function init(){
    buildSidebar();
    Voice.init();
    document.getElementById('btnRun').addEventListener('click',Grammar.submit);
    document.getElementById('btnExample').addEventListener('click',Grammar.loadExample);
    document.getElementById('btnParse').addEventListener('click',Parser.simulate);
    document.getElementById('btnPrev').addEventListener('click',()=>{
      if(State.currentStep===0) showWelcome(true);
      else goTo(State.currentStep-1);
    });
    document.getElementById('btnNext').addEventListener('click',()=>goTo(State.currentStep+1));
    document.getElementById('btnStart').addEventListener('click',()=>goTo(0));

    showWelcome(false);

    const overlay=document.getElementById('tapOverlay');
    let unlocked=false;

    function unlock(){
      if(unlocked)return;
      unlocked=true;
      ['mousedown','touchstart','click','keydown'].forEach(ev=>{
        overlay.removeEventListener(ev,unlock,true);
        document.removeEventListener(ev,unlock,true);
      });
      overlay.classList.add('hidden');
      showWelcome(true);
    }

    ['mousedown','touchstart','click'].forEach(ev=>
      overlay.addEventListener(ev,unlock,true)
    );
    document.addEventListener('keydown',unlock,true);
  }

  return{init,goTo};
})();