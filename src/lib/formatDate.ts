export function formatDate(iso: string, locale = "pt-BR") {
  try {
    const d = new Date(iso);                                                 
    return new Intl.DateTimeFormat(locale, {                                  
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;                                                               
  }
}