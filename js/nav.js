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
    'Enter a Context Free Grammar or use the NLP Assistant, then click Run.',
    'FIRST and FOLLOW sets drive lookahead computation.',
    'LR(1) items — dot position plus lookahead terminal.',
    'LALR merges states sharing identical item cores.',
    'The parsing table drives every parser decision.',
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
        'Welcome to the Visionary Parser.',
        'Visionary Parser is an interactive tool for visualizing LALR compiler design.',
        'It uses voice guidance and natural language processing to help you explore parsing concepts.',
        'Select a step from the sidebar, or click Start to begin.'
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

    // NLP UI Logic
    document.getElementById('modeNlp').addEventListener('click', () => {
      document.getElementById('nlpBox').style.display = 'block';
      document.getElementById('modeTitle').textContent = 'natural language assistant';
    });
    document.getElementById('modeBnf').addEventListener('click', () => {
      document.getElementById('nlpBox').style.display = 'none';
      document.getElementById('modeTitle').textContent = 'direct bnf entry';
    });
    document.getElementById('btnTranslate').addEventListener('click', () => {
      const res = NLP.toBNF(document.getElementById('nlpInput').value);
      if(res) document.getElementById('grammarInput').value = res;
    });

    showWelcome(false);
    const overlay=document.getElementById('tapOverlay');
    let unlocked=false;
    function unlock(){
      if(unlocked)return;
      unlocked=true;
      overlay.classList.add('hidden');
      showWelcome(true);
    }
    overlay.addEventListener('click',unlock,true);
  }
  return{init,goTo};
})();
