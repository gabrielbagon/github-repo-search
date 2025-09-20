// Monta a query de busca do GitHub Search API

export function buildSearchQ(term: string, language: string) {
  const t = term.trim();                  
  let q = t ? `${t} in:name` : "stars:>5000"; 
  if (language.trim()) {                  
    q += ` language:${language.trim()}`;  
  }
  return q;                               
}
