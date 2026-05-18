// Maps team codes (FIFA 3-letter) → ISO 3166-1 alpha-2 (lowercase) for FlagCDN
export const FLAG_CODES: Record<string, string> = {
  MAR: 'ma', ESP: 'es', POR: 'pt', FRA: 'fr',
  BRA: 'br', ARG: 'ar', ENG: 'gb-eng', GER: 'de',
  ITA: 'it', NED: 'nl', BEL: 'be', URU: 'uy',
  USA: 'us', MEX: 'mx', COL: 'co', SEN: 'sn',
  NGA: 'ng', EGY: 'eg', JPN: 'jp', KOR: 'kr',
  AUS: 'au', CRO: 'hr', DEN: 'dk', SUI: 'ch',
}

// Returns a FlagCDN PNG URL — 80px wide, crisp on retina
export function flagUrl(teamCode: string): string {
  const iso = FLAG_CODES[teamCode] ?? 'un'
  return `https://flagcdn.com/w80/${iso}.png`
}
