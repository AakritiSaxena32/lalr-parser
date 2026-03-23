// ── SHARED STATE ──
const State = {
  currentStep: 0, grammarOK: false,
  startSymbol: '', grammar: {},
  augProds: [], nonterms: [], terms: [],
  FIRST: {}, FOLLOW: {},
  lr1States: [], lalrStates: [], lalrTrans: [],
  ACTION: [], GOTO: [],
  lastRoot: null,
  reset() {
    this.augProds=[]; this.nonterms=[]; this.terms=[];
    this.FIRST={}; this.FOLLOW={};
    this.lr1States=[]; this.lalrStates=[]; this.lalrTrans=[];
    this.ACTION=[]; this.GOTO=[]; this.lastRoot=null;
  }
};

// ── UTILITIES ──
function esc(s){ return s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):''; }
function isNT(s){ return State.nonterms.includes(s); }