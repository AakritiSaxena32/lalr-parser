const NLP = (() => {
  // Mapping for programming, math, and general descriptive phrases
  const KEYWORDS = {
    "plus": "+", 
    "minus": "-", 
    "times": "*", 
    "multiplied by": "*",
    "divided by": "/",
    "equals": "==",
    "and": "&&",
    "or": "||",
    "not": "!",
    "open": "(",
    "close": ")",
    "opening parenthesis": "(",
    "closing parenthesis": ")",
    "semicolon": ";",
    "comma": ",",
    "id": "id"
  };

  function toBNF(text) {
    // Split input into individual rules based on periods or new lines
    const lines = text.split(/[.\n;]/).filter(l => l.trim().length > 3);
    let output = "";

    lines.forEach(line => {
      let l = line.trim().toLowerCase();
      
      // Recognition pattern for "goes to", "is", or "consists of"
      const match = l.match(/(\w+)\s+(?:goes to|is|consists of|defines|is either)\s+(.+)/i);
      
      if (match) {
        let lhs = match[1].toUpperCase();
        let rhsRaw = match[2];

        // Handle the "or" keyword for BNF alternatives (|)
        let alternatives = rhsRaw.split(/\bor\b/g);

        let processedAlts = alternatives.map(alt => {
          let tokens = alt.trim().split(/\s+/);
          return tokens.map(token => {
            if (KEYWORDS[token]) return KEYWORDS[token];
            
            // Heuristic: Capitalize potential Non-Terminals
            if (token.length > 2 && !token.includes("'")) {
              return token.charAt(0).toUpperCase() + token.slice(1);
            }
            return token.replace(/['"]/g, ""); 
          }).join(' ');
        });

        output += `${lhs} -> ${processedAlts.join(' | ')}\n`;
      }
    });
    return output.trim();
  }

  return { toBNF };
})();
