# Changelog - Applicazione Universita

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
