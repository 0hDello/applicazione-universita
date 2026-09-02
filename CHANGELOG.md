# Changelog - Applicazione Universita

## [v1.0.15] - 2026-09-02

### Nuove Funzionalità e Miglioramenti

- **Piani di Studio Multicampus UniBo & Aggiornamento Ingegneria Meccanica**:
  - Distinzione e supporto esplicito per le sedi multicampus dell'Università di Bologna:
    - `Ingegneria Meccanica (Campus di Bologna) - UniBo` (Codice 6680 - insegnamenti ufficiali con codici, CFU e semestri esatti).
    - `Ingegneria Meccanica (Campus di Forlì) - UniBo` (Insegnamenti specifici della sede di Forlì).
  - Aggiunta nel catalogo delle opzioni multicampus UniBo (Bologna, Forlì, Cesena, Ravenna, Rimini).
- **Caricamento Selettivo del Piano di Studi per Anno di Corso**:
  - Nella modale *"Carica Piano di Studi"* e nelle Impostazioni è ora possibile selezionare l'anno esatto da importare:
    - **1° Anno** (carica solo i 10 insegnamenti del primo anno, es. 60 CFU).
    - **2° Anno** (carica solo gli insegnamenti del secondo anno).
    - **3° Anno** (carica solo gli insegnamenti del terzo anno).
    - **Tutti gli Anni** (intero triennio da 180 CFU).
  - Modalità non distruttiva (*"Aggiungi corsi"*) o di sostituzione selettiva dell'anno scelto senza cancellare gli altri anni.
  - Anteprima interattiva in tempo reale degli insegnamenti, codici e crediti prima di confermare il caricamento.

## [v1.0.14] - 2026-09-02

### Nuove Funzionalità e Miglioramenti

- **Corsi Predefiniti per Indirizzo di Studi (UniBo Ingegneria Meccanica & Altri)**:
  - Catalogo ufficiale integrato con i corsi di *Ingegneria Meccanica - Università di Bologna (UniBo)* (1°, 2° e 3° anno con CFU, docenti, codici e semestri conformi all'offerta didattica di Ateneo) e altri corsi di laurea di riferimento.
  - Caricamento con 1 click dei corsi predefiniti sia dalla vista Corsi che dalle Impostazioni del Profilo Studente, con possibilità completa di modifica, personalizzazione o rimozione.
- **Riorganizzazione Sezione "Corsi"**:
  - Layout compatto e moderno a griglia (2-3 colonne su desktop, 1 su mobile) con schede informative sintetiche (CFU, Docente, Aula, % frequenza, badge lezioni da recuperare, avanzamento argomenti).
  - Filtri istantanei per Anno di corso (1° Anno, 2° Anno, 3° Anno, Tutti), Semestre (1°, 2°, Annuale, Tutti) e barra di ricerca in tempo reale.
- **Riorganizzazione Menu Laterale, Profilo e Tema Chiaro/Scuro**:
  - Pulsante toggle dedicato per Tema Chiaro / Scuro (Sole / Luna) posizionato nella barra superiore accanto alla campanella delle notifiche.
  - Menu a tendina del profilo utente in alto a destra con accesso a Profilo Studente, Impostazioni, I Miei Corsi e Appelli.
  - Rimozione della voce "Impostazioni" dal menu laterale per una navigazione più pulita.
- **Miglioramenti Calendario & Colore Tema Corsi Dinamico**:
  - Il bottone "Oggi" ha ora le stesse dimensioni, altezza, padding e risalto visivo dei selettori di visualizzazione "Mese", "Settimana" e "Giorno".
  - Il colore personalizzato assegnato a ciascun corso viene applicato dinamicamente a tutte le sue lezioni nel calendario (sfondo, bordi, badge e indicatori) invece di essere forzato a un colore unico.
- **Importazione Eventi da Calendari Esterni**:
  - Supporto per importare file di calendario standard `.ics` (RFC 5545) da Apple iCalendar, Google Calendar o Outlook.
  - Supporto per importare da URL WebCal / iCal pubblico o link di condivisione calendario.
  - Supporto per importare esportazioni CSV da database Notion o fogli di calcolo, con tabella di mappatura interattiva dei corsi e delle categorie prima dell'importazione.

## [v1.0.13] - 2026-09-02

### Nuove Funzionalità e Miglioramenti

- **Appunti Presi & Editor Note per Lezione**: Ripristinato e potenziato il toggle "Appunti presi" direttamente sulle schede delle lezioni, con editor note inline dedicato per scrivere, consultare e modificare gli appunti di ciascuna lezione e filtro rapido per stato appunti.
- **Importazione Orario da Screenshot (OCR) Potenziata**: Algoritmo di riconoscimento ottico multi-passaggio con pulizia automatica dei refusi OCR, supporto per layout a griglia/colonne, fuzzy matching automatico con i corsi esistenti dell'utente ed editor di testo OCR modificabile con pulsante "Rianalizza".
- **Tema Scuro Nero Assoluto (Zero Tonalità Blu)**: Riprogettazione cromatica completa del dark mode con sfondi in nero puro (`#000000` / `#09090b`), superfici neutre e massimo contrasto e riposo visivo.

## [v1.0.12] - 2026-09-01

### Nuove Funzionalità e Miglioramenti

- **Calcolatore Presenze (Frequenza Obbligatoria)**: Calcolo in tempo reale di presenze, percentuale e assenze residue consentite con soglia personalizzabile (es. 75%), periodo lezioni e toggle rapido presenza/assenza.
- **Lezioni da Recuperare (Suggerimento Automatico)**: Tracciamento automatico delle lezioni con assenza, sezione dedicata con dettagli e pulsante "Segna come recuperata" con storico e note.
- **Personalizzazione Tema Colore (Scelta Libera)**: Color picker con ruota colori libera, codice HEX/RGB e applicazione dinamica istantanea su tutta l'interfaccia.
- **Personalizzazione Visiva Corsi**: Scelta di colore distintivo, emoji tematica e banner di copertina / gradiente per ciascun corso con visualizzazione nelle card e nei dettagli.
- **Dimensione Font Regolabile**: Dimensione predefinita aumentata per massima leggibilità (16px) e selettore dimensioni (Piccolo, Medio, Grande, Molto Grande) nelle Impostazioni.
- **Import Orario da Screenshot (OCR) & Bulk Import**: Riconoscimento ottico client-side dei calendari da immagine/screenshot con anteprima interattiva e importazione bulk CSV/JSON.
- **Argomenti Lezioni & Sincronizzazione Programma**: Gestione argomenti trattati per ogni lezione e sincronizzazione interattiva con la scheda "Programma e Argomenti".
- **Libreria Risorse Avanzata**: Selezione esplicita del corso associato o generale, archiviazione locale persistente in IndexedDB e visualizzatore integrato a schermo per PDF, immagini, audio, video e link.

## [v1.0.11] - 2026-09-01

### Modifiche e Risoluzione Bug

- Allineamento Aula e Sede: risolto l'overflow visivo dei testi degli indirizzi lunghi nella modale dei dettagli evento del calendario con a capo automatico pulito e contenimento nei bordi.
- Appelli ed Esami: risolto l'overflow dello stato d'iscrizione nelle schede esame quando l'applicazione è in modalità finestra grazie a un layout a griglia responsivo con troncamento sicuro.

## [v1.0.10] - 2026-09-01

### Modifiche e Risoluzione Bug

- Statistiche Reali: rimossi tutti i valori fittizi di fallback nelle statistiche e nei grafici.
- Calcolo Dinamico: ore di studio, presenze alle lezioni, completamento compiti e streak abitudini riflettono fedelmente e unicamente i dati effettivi registrati dall'utente (visualizzando 0 ore, 0 giorni e messaggi puliti quando non ci sono attività).

## [v1.0.9] - 2026-09-01

### Modifiche e Risoluzione Bug

- Menu Aggiungi Evento: redesign completo della finestra modale in stile minimal, compatto ed elegante senza barre di scorrimento verticali.
- Selettore Orari Compatto: ingressi orari orizzontali puliti con chip rapidi per la durata (+1h, +1.5h, +2h, +3h) e cassetto a comparsa per le fasce universitarie.
- Form Modifica Evento: aggiornato con il nuovo layout ordinato a griglia, campi allineati e pulsante di eliminazione diretta.

## [v1.0.8] - 2026-09-01

### Modifiche e Risoluzione Bug

- Calendario: riorganizzata la barra superiore per evitare sfasamenti visivi con allineamento pulito e ordinato di comandi, viste e navigazione.
- Eliminazione Eventi Calendario: aggiunta eliminazione diretta con icona cestino al passaggio del mouse sulle pillole degli eventi e modal centrale dedicata con tasto Elimina Evento.
- Temi e Colori: corretto il collegamento delle variabili CSS di Tailwind (@theme) per rendere immediatamente reattivo il cambio colore accento (blu, viola, verde smeraldo, arancio, rosa, ciano, ambra) su pulsanti, badge e barre laterali.

## [v1.0.7] - 2026-09-01

### Modifiche e Risoluzione Bug

- Installazione Aggiornamenti: rimossa la finestra di dialogo retro di Windows (NSIS) a favore di un'installazione silenziosa e istantanea in background.
- Nuova schermata di aggiornamento minimale in tema scuro con rotellina di caricamento glowing e animazioni fluide prima del riavvio automatico.
- Miglioramenti di stabilità e rifinitura grafica generale.

## [v1.0.6] - 2026-09-01

### Modifiche e Risoluzione Bug

- Calendario: aggiunta la modifica completa degli eventi esistenti (titolo, data, orario, aula, note, categoria) con aggiornamento del record senza duplicazioni.
- Impostazioni: applicazione immediata e globale del colore tema (accent color) selezionato tramite variabili CSS.
- Appelli ed Esami: selettore interattivo dello stato di iscrizione nelle schede degli esami e nei moduli di inserimento/modifica.
- Compiti: sincronizzazione automatica bidirezionale delle scadenze con gli eventi del calendario.
- Statistiche: selettore dinamico del periodo di analisi e calcolo delle metriche basato su dati reali di corsi, lezioni, esami e compiti.
- Obiettivi: implementazione completa per la gestione di obiettivi semestrali, obiettivi settimanali e tracker delle abitudini.
- Notifiche: pannello a discesa nella barra superiore con avvisi automatici per esami imminenti, scadenze compiti e lezioni odierne.
- Menu Utente: menu a tendina nell'header con informazioni sullo studente, scorciatoie di navigazione e cambio tema chiaro/scuro.
- Luoghi e Aule: apertura diretta su Google Maps per tutte le aule e sedi indicate negli eventi e nei corsi.
- Calendario Avanzato: supporto a eventi ricorrenti settimanali, duplicazione rapida e spostamento eventi tramite drag and drop.

## [v1.0.5] - 2026-09-01

- Calendario: navigazione temporale con viste Mese, Settimana e Giorno, frecce di scorrimento e pulsante Oggi.
- Sincronizzazione automatica tra calendario, lezioni dei corsi e appelli d'esame.
- Selettore orario visivo con fasce universitarie preimpostate.

## [v1.0.4] - 2026-08-31

- Correzione e attivazione immediata del tema scuro e chiaro.
- Componente selettore orari con slot digitali.
