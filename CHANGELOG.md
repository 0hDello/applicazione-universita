# Changelog — Applicazione Università

Tutte le novità, miglioramenti e risoluzioni dei bug per ciascuna versione rilasciata.

---

## [v1.0.6] — 2026-09-01

### 🛠️ Bug Risolti & Nuove Funzionalità

#### 1. 📅 Calendario — Modifica Eventi Esistenti (Bug Risolto)
- Aggiunta la possibilità di modificare qualsiasi evento già creato (titolo, orario, aula, corso, note, categoria).
- Salvataggio diretto sul record esistente senza duplicazioni e con sincronizzazione automatica.

#### 2. 🎨 Impostazioni — Selettore Colore Tema (Accent Color Reattivo)
- Selezione del colore tema (Blu, Viola, Smeraldo, Arancio, Rosa, Ciano, Ambra) applicata istantaneamente su tutta l'interfaccia via CSS Variables globali.

#### 3. 📝 Appelli ed Esami — Stato Iscrizione Interattivo
- Menu a tendina su ogni card esame e nel form di creazione/modifica per cambiare lo stato in qualsiasi momento (*⏳ In attesa, ✅ Iscritto, 🎯 Confermata, ❌ Non iscritto, 🏆 Verbalizzato*).

#### 4. ⏰ Compiti — Sincronizzazione Automatica con il Calendario
- I compiti con scadenza generano automaticamente un evento *"Scadenza"* sul calendario. Modificando o eliminando il compito, il calendario si aggiorna in tempo reale.

#### 5. 📊 Statistiche — Selezione Periodo e Calcolo su Dati Reali
- Menu a discesa interattivo per selezionare il periodo di analisi (*Mese Corrente, Precedente, Ultimi 3 Mesi, Semestre, Anno Accademico*).
- Calcolo dinamico di ore di studio, presenze alle lezioni, compiti e trend con grafici Recharts basati su dati effettivi.

#### 6. 🎯 Obiettivi — CRUD Completo (Semestrali, Settimanali, Abitudini)
- Form modale per creare obiettivi semestrali con avanzamento, obiettivi settimanali con spunta interattiva dei giorni (L-D) e tracker abitudini con calcolo streak di costanza (🔥).

#### 7. 🔔 Notifiche — Dropdown Header Interattivo
- Menu a discesa al click sulla campanella con badge non lette, avvisi per esami entro 7 giorni, compiti in scadenza entro 48h e lezioni odierne.

#### 8. 👤 Menu Utente — Dropdown del Profilo
- Dropdown rapido con dati dello studente, cambio rapido Tema Chiaro/Scuro e scorciatoie per Impostazioni, Corsi ed Esami.

#### 9. 📍 Luogo / Aula — Link Diretto a Google Maps
- Tutte le aule e sedi in Calendario, Corsi ed Esami sono ora cliccabili per aprire la ricerca su Google Maps in una nuova scheda.

#### 10. 🔄 Calendario Avanzato — Ricorrenza, Duplicazione e Drag & Drop
- Supporto a eventi ricorrenti settimanali (4, 8, 12 o 16 settimane per l'intero semestre).
- Pulsante *"Duplica"* per copiare al volo gli eventi.
- **Drag & Drop** per spostare gli eventi direttamente con il mouse sulla griglia del calendario.

---

## [v1.0.5] — 2026-09-01
- **Calendario Dinamico:** Viste funzionanti per Mese, Settimana (tabellone orario 08:00–20:00) e Giorno.
- **Frecce di Navigazione:** Scorrimento dinamico temporale con pulsante *"Oggi"*.
- **Sync Bidirezionale:** Sincronizzazione automatica tra Calendario, Registro Lezioni dei Corsi e Appelli Esami.
- **TimeSlotPicker:** Selettore visivo degli orari con fasce universitarie rapide.

---

## [v1.0.4] — 2026-08-31
- **Dark Mode Fix:** Supporto completo per Tailwind v4 con transizione istantanea tra chiaro e scuro.
- **TimeSlotPicker Component:** Introduzione del selettore orari digitale con fasce universitarie preimpostate.
