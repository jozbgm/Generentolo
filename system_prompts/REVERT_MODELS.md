# Nota di revert — cambio modelli (2026-05-14)

## Cosa è stato cambiato

Tutte le chiamate API per task di ragionamento testuale (enhancement, planning, analisi,
rewrite prompt, storyboard, DNA extraction, negative prompt) sono state migrate da:

    gemini-3-flash-preview  →  gemini-3.1-pro-preview

**File coinvolti:**
- `services/geminiService.ts` — 13 occorrenze (righe ~56, 231, 321, 434, 522, 596, 667, 955, 1000, 1032, 1063, 1909)
- `services/storyboardService.ts` — 2 occorrenze (righe ~195, 249)
- `services/enhancePromptNew.ts` — 1 occorrenza (riga ~151)

**Non toccato:** `generateImage()` e qualsiasi modello con "image" nel nome.

## Come tornare indietro

Esegui questo comando dalla root del progetto:

    npx replace-in-files --string "gemini-3.1-pro-preview" --replacement "gemini-3-flash-preview" --files-glob "services/**/*.ts"

Oppure manualmente con sed (Git Bash / WSL):

    sed -i "s/gemini-3\.1-pro-preview/gemini-3-flash-preview/g" services/geminiService.ts services/storyboardService.ts services/enhancePromptNew.ts

Poi rebuilda:

    npm run build

## Note aggiuntive

- I commenti `// v2.0: Restored Gemini 3.0 Flash as per user request` sulle righe 231 e 321
  di geminiService.ts sono stati rimossi insieme alla migrazione — non impattano il funzionamento.
- I system prompt nei file `01_*.txt` ... `10_*.txt` di questa cartella sono quelli ORIGINALI
  (pre-aggiornamento). I nuovi sono in `../system_prompts_new/`.
