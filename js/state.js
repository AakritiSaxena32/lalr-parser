// ── SHARED STATE ──
const State = {
  currentStep: 0, grammarOK: false,
  startSymbol: '', grammar: {},
  augProds: [], nonterms: [], terms: [],
  FIRST: {}, FOLLOW: {},
  lr1States: [], lalrStates: [], lalrTrans: {},
  ACTION: {}, GOTO: {},
  lastRoot: null,
  lr1KeyMap: new Map(),
  lr1Trans: {}, 
  
  reset() {
    this.augProds=[]; this.nonterms=[]; this.terms=[];
    this.FIRST={}; this.FOLLOW={};
    this.lr1States=[]; this.lalrStates=[]; this.lalrTrans={};
    this.ACTION={}; this.GOTO={}; this.lastRoot=null;
    this.lr1KeyMap.clear();
    this.lr1Trans={};
  }
};

function esc(s){ return s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):''; }
function isNT(s){ return State.nonterms.includes(s); }