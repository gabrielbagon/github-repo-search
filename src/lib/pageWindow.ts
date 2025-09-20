export function pageWindow(current: number, total: number, radius = 2) {
  const start = Math.max(1, current - radius);                                  
  const end = Math.min(total, current + radius);                                
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);          
}