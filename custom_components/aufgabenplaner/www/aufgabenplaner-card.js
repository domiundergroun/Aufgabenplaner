/* Aufgabenplaner – Dashboard-Karte (ohne externe Abhängigkeiten) */
(() => {
  if (customElements.get("aufgabenplaner-card")) return;

  const CARD_VERSION = "0.8.0";
  const LS_KEY = "aufgabenplaner_active_person";
  const LS_UP = "aufgabenplaner_hide_upcoming";
  const COLORS = ["#ef476f", "#f78c6b", "#ffb703", "#06d6a0", "#118ab2", "#7b5ea7", "#ec6ca8", "#4cc9f0"];
  const EMOJIS = ["🦊", "🐼", "🦁", "🐯", "🐸", "🦄", "🐙", "🐧", "🐻", "🦉", "🌟", "🚀"];
  const LIST_ICONS = ["🏠", "🧺", "🌱", "🛒", "🧹", "🍳", "🐾", "📚", "💼", "🎒"];
  const STAR_PRESETS = [0, 1, 2, 3, 5, 10];

  const L = {
    de: {
      everyone: "Alle", today: "Heute", overdue: "Überfällig", upcoming: "Demnächst", nodate: "Ohne Datum",
      done: "Erledigt", allDone: "Alles erledigt!", allDoneSub: "Zeit für eine Pause. 🎉",
      nothing: "Hier ist noch nichts.", nothingSub: "Lege die erste Aufgabe an.",
      addTask: "Aufgabe hinzufügen", newTask: "Neue Aufgabe", editTask: "Aufgabe bearbeiten",
      taskTitle: "Was ist zu tun?", list: "Liste", stars: "Sterne", assignee: "Zuständig", anyone: "Egal wer",
      due: "Fällig am", todayBtn: "Heute", tomorrowBtn: "Morgen", noDue: "Kein Datum",
      repeat: "Wiederholen", repNone: "Nie", repDaily: "Täglich", repWeekly: "Wöchentlich", repMonthly: "Monatlich",
      every: "Alle", unitDays: "Tag(e)", unitWeeks: "Woche(n)", unitMonths: "Monat(e)", onDay: "am Tag",
      pickWeekday: "Wähle mindestens einen Wochentag.", personalList: "Persönliche Liste: Sterne gehen an",
      save: "Speichern", cancel: "Abbrechen", delete: "Löschen", close: "Schließen",
      settings: "Einstellungen", persons: "Personen", lists: "Listen",
      addPerson: "Person hinzufügen", newPerson: "Neue Person", editPerson: "Person bearbeiten",
      name: "Name", emoji: "Symbol", color: "Farbe",
      addList: "Liste hinzufügen", newList: "Neue Liste", editList: "Liste bearbeiten",
      owner: "Besitzer", shared: "Gemeinsam",
      adjust: "Sterne anpassen", adjustHint: "Negative Zahl, um Sterne einzulösen.", amount: "Anzahl",
      reason: "Grund (optional)", apply: "Anwenden", adjustment: "Anpassung",
      who: "Wer hat es erledigt?", undo: "Rückgängig",
      backup: "Datensicherung", exportBtn: "Sicherung exportieren", importBtn: "Sicherung importieren",
      backupHint: "Exportiert alles (Personen, Listen, Aufgaben, Vorlagen, Sterne) als Datei. Beim Import werden alle aktuellen Daten ersetzt (nur Administratoren).",
      confirmImport: "Alle aktuellen Daten werden durch die Sicherung ersetzt. Fortfahren?",
      importDone: "Sicherung importiert", importFailed: "Die Datei ist keine gültige Sicherung.", exported: "Sicherung gespeichert",
      confirmDelete: "„{n}“ wirklich löschen?",
      removed: "„{n}“ gelöscht",
      skipped: "„{n}“ entfernt – die nächste Wiederholung bleibt",
      confirmDeletePerson: "„{n}“ wirklich löschen? Die persönliche Liste und ihre Aufgaben werden ebenfalls gelöscht.",
      notSetUp: "Der Aufgabenplaner ist noch nicht eingerichtet. Füge die Integration unter Einstellungen → Geräte & Dienste hinzu.",
      welcome: "Willkommen!", welcomeSub: "Lege zuerst die Personen an, die Aufgaben erledigen und Sterne sammeln.",
      tomorrow: "Morgen", todayLbl: "Heute", daily: "Täglich", weekly: "Wöchentlich",
      everyNDays: "Alle {n} Tage", everyNWeeks: "Alle {n} Wochen", everyNMonths: "Alle {n} Monate",
      everyWd: "Jeden {d}", monthlyOn: "Monatlich am {d}.",
      titleRequired: "Bitte gib einen Titel ein.", nameRequired: "Bitte gib einen Namen ein.",
      noPersonsHint: "Noch keine Personen angelegt.", ownerOf: "Liste von",
      symbol: "Symbol", pickSymbol: "Symbol wählen", changeSymbol: "Symbol ändern", noSymbol: "Kein Symbol",
      together: "Gemeinsam erledigt", severalPeople: "Mehrere Personen",
      togetherHint: "Wähle alle, die mitgemacht haben. Die Sterne werden gleichmäßig geteilt, in 0,5er-Schritten.",
      splitInfo: "★ {total} geteilt durch {n} = je ★ {each}", sharedBy: "geteilt durch {n}",
      templates: "Vorlagen", templatesHint: "Tippe auf eine Vorlage, um daraus eine Aufgabe anzulegen. Die Sterne sind schon eingetragen.",
      noTemplates: "Noch keine Vorlagen.", noTemplatesSub: "Speichere hier Aufgaben, die immer wieder kommen, z. B. Gießen oder Staubsaugen.",
      addTemplate: "Vorlage hinzufügen", newTemplate: "Neue Vorlage", editTemplate: "Vorlage bearbeiten", useTemplate: "Als Aufgabe anlegen",
      haUser: "Home-Assistant-Benutzer", noUser: "Keiner (gemeinsames Gerät)", linked: "verknüpft",
      userHint: "Wer mit diesem Benutzer eingeloggt ist, wird automatisch erkannt und bekommt die Sterne.",
    },
    en: {
      everyone: "Everyone", today: "Today", overdue: "Overdue", upcoming: "Upcoming", nodate: "No date",
      done: "Done", allDone: "All done!", allDoneSub: "Time for a break. 🎉",
      nothing: "Nothing here yet.", nothingSub: "Add the first task.",
      addTask: "Add task", newTask: "New task", editTask: "Edit task",
      taskTitle: "What needs doing?", list: "List", stars: "Stars", assignee: "Assigned to", anyone: "Anyone",
      due: "Due on", todayBtn: "Today", tomorrowBtn: "Tomorrow", noDue: "No date",
      repeat: "Repeat", repNone: "Never", repDaily: "Daily", repWeekly: "Weekly", repMonthly: "Monthly",
      every: "Every", unitDays: "day(s)", unitWeeks: "week(s)", unitMonths: "month(s)", onDay: "on day",
      pickWeekday: "Pick at least one weekday.", personalList: "Personal list: stars go to",
      save: "Save", cancel: "Cancel", delete: "Delete", close: "Close",
      settings: "Settings", persons: "People", lists: "Lists",
      addPerson: "Add person", newPerson: "New person", editPerson: "Edit person",
      name: "Name", emoji: "Icon", color: "Color",
      addList: "Add list", newList: "New list", editList: "Edit list",
      owner: "Owner", shared: "Shared",
      adjust: "Adjust stars", adjustHint: "Use a negative number to redeem stars.", amount: "Amount",
      reason: "Reason (optional)", apply: "Apply", adjustment: "Adjustment",
      who: "Who did it?", undo: "Undo",
      backup: "Backup", exportBtn: "Export backup", importBtn: "Import backup",
      backupHint: "Exports everything (people, lists, tasks, templates, stars) to a file. Importing replaces all current data (administrators only).",
      confirmImport: "All current data will be replaced by the backup. Continue?",
      importDone: "Backup imported", importFailed: "This file is not a valid backup.", exported: "Backup saved",
      confirmDelete: "Really delete “{n}”?",
      removed: "“{n}” deleted",
      skipped: "“{n}” removed – the next repeat stays",
      confirmDeletePerson: "Really delete “{n}”? Their personal list and its tasks will be deleted too.",
      notSetUp: "Aufgabenplaner is not set up yet. Add the integration under Settings → Devices & services.",
      welcome: "Welcome!", welcomeSub: "Start by adding the people who do tasks and collect stars.",
      tomorrow: "Tomorrow", todayLbl: "Today", daily: "Daily", weekly: "Weekly",
      everyNDays: "Every {n} days", everyNWeeks: "Every {n} weeks", everyNMonths: "Every {n} months",
      everyWd: "Every {d}", monthlyOn: "Monthly on the {d}.",
      titleRequired: "Please enter a title.", nameRequired: "Please enter a name.",
      noPersonsHint: "No people yet.", ownerOf: "List of",
      symbol: "Icon", pickSymbol: "Pick an icon", changeSymbol: "Change icon", noSymbol: "No icon",
      together: "Done together", severalPeople: "Several people",
      togetherHint: "Pick everyone who helped. The stars are split equally, in steps of 0.5.",
      splitInfo: "★ {total} split by {n} = ★ {each} each", sharedBy: "split by {n}",
      templates: "Templates", templatesHint: "Tap a template to create a task from it. The stars are already filled in.",
      noTemplates: "No templates yet.", noTemplatesSub: "Save tasks that come up again and again here, e.g. watering or vacuuming.",
      addTemplate: "Add template", newTemplate: "New template", editTemplate: "Edit template", useTemplate: "Create as task",
      haUser: "Home Assistant user", noUser: "None (shared device)", linked: "linked",
      userHint: "Whoever is logged in with this user is recognised automatically and gets the stars.",
    },
  };

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Sterne können halbe Werte haben: 1,5 statt 1.5 (de), ganze Zahlen ohne Nachkommastelle. */
  const fmtStars = (n, lang) =>
    Number.isInteger(n) ? String(n) : Number(n).toLocaleString(lang || "de", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  /* Sterne gleichmäßig teilen, auf 0,5 gerundet (ab .25 aufgerundet) – wie im Backend. */
  const splitStars = (total, n) => (n <= 1 ? total : Math.floor((total / n) * 2 + 0.5) / 2);

  /* Symbole: Material Design Icons (Pictogrammers, Apache-2.0) als SVG-Pfade eingebettet, unabhängig von der HA-Version. */
  const ICONS = {
    "watering-can": "M18.5 7.47c-.74.73-.93 1.78-.58 2.68L15 13.07V11c0-.55-.45-1-1-1h-1.03c.03-.17.03-.33.03-.5C13 6.46 10.54 4 7.5 4A5.497 5.497 0 0 0 4 13.74V20c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-4.11l4.33-4.33c.9.35 1.95.17 2.67-.56zM4.05 10C4.03 9.83 4 9.67 4 9.5 4 7.57 5.57 6 7.5 6S11 7.57 11 9.5c0 .17-.03.33-.05.5z",
    "vacuum": "M23 20v2h-7v-2h2.46L12 4.61c-.19-.47-.5-.85-.94-1.15S10.14 3 9.61 3c-.71 0-1.33.27-1.85.79S7 4.92 7 5.64V9h1c2.21 0 4 1.79 4 4v9H8c.61-.84 1-1.87 1-3 0-2.76-2.24-5-5-5-.71 0-1.39.15-2 .42V9h3V5.64c0-.84.23-1.64.63-2.32.41-.7.96-1.26 1.67-1.69Q8.35 1 9.61 1c.94 0 1.79.26 2.55.77s1.34 1.2 1.71 2.04L20.66 20zM7 19c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3m-2 0c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1",
    "broom": "m19.36 2.72 1.42 1.42-5.72 5.71c1.07 1.54 1.22 3.39.32 4.59L9.06 8.12c1.2-.9 3.05-.75 4.59.32zM5.93 17.57c-2.01-2.01-3.24-4.41-3.58-6.65l4.88-2.09 7.44 7.44-2.09 4.88c-2.24-.34-4.64-1.57-6.65-3.58",
    "spray-bottle": "M16.72 10.43C14.68 8.39 14.5 4.66 14.5 4H13v2H9V4H7c0-1.1.9-2 2-2h7v1c0 .08.04 4.63 1.78 6.37zM17 2v2h1V2zm-2 10c-2-2-2-5-2-5H9v2c0 1 0 1-1 2s-1 2-1 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2z",
    "bucket-outline": "M3 4h18v3h-1l-2.5 14h-11L4 7H3zm14.97 3H6.03l2.12 12h7.7z",
    "trash-can-outline": "M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z",
    "recycle": "m21.82 15.42-2.5 4.33c-.49.86-1.4 1.31-2.32 1.25h-2v2l-2.5-4.5L15 14v2h2.82l-2.22-3.85 4.33-2.5 1.8 3.12c.52.77.59 1.8.09 2.65M9.21 3.06h5c.98 0 1.83.57 2.24 1.39l1 1.74 1.73-1-2.64 4.41-5.15.09 1.73-1-1.41-2.45-2.21 3.85-4.34-2.5 1.8-3.12c.41-.83 1.26-1.41 2.25-1.41m-4.16 16.7-2.5-4.33c-.49-.85-.42-1.87.09-2.64l1-1.73-1.73-1 5.14.08 2.65 4.42-1.73-1L6.56 16H11v5H7.4a2.51 2.51 0 0 1-2.35-1.24",
    "washing-machine": "M14.83 11.17a4.01 4.01 0 0 1 0 5.66 4.01 4.01 0 0 1-5.66 0zM6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m1 2a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m3 0a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m2 4a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6 6 6 0 0 0-6-6",
    "tumble-dryer": "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m1 2a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m3 0a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m2 4a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6 6 6 0 0 0-6-6m-3.89 2.5H10c-.24 1.38 0 2.17.58 2.79 1.1 1.07 1.58 2.42 1.31 4.21H10c.24-1.38 0-2.17-.58-2.79-1.1-1.07-1.57-2.42-1.31-4.21m4 0H14c-.24 1.38 0 2.17.58 2.79 1.1 1.07 1.58 2.42 1.31 4.21H14c.24-1.38 0-2.17-.58-2.79-1.1-1.07-1.57-2.42-1.31-4.21",
    "tshirt-crew": "M16 21H8a1 1 0 0 1-1-1v-7.93l-1.3 1a.996.996 0 0 1-1.41 0l-2.83-2.78a.996.996 0 0 1 0-1.41L7.34 3H9c0 1.1 1.34 2 3 2s3-.9 3-2h1.66l5.88 5.88c.39.39.39 1.02 0 1.41l-2.83 2.83c-.39.38-1.02.38-1.41 0l-1.3-1V20a1 1 0 0 1-1 1",
    "hanger": "M12 4a3.5 3.5 0 0 0-3.5 3.5h2A1.5 1.5 0 0 1 12 6a1.5 1.5 0 0 1 1.5 1.5A1.5 1.5 0 0 1 12 9c-.55 0-1 .45-1 1v1.75L2.4 18.2A1 1 0 0 0 3 20h18a1 1 0 0 0 .6-1.8L13 11.75v-.9a3.5 3.5 0 0 0 2.5-3.35A3.5 3.5 0 0 0 12 4m0 9.5 6 4.5H6Z",
    "iron": "M21 6c-1.66 0-3 1.34-3 3v4c0 .55-.45 1-1 1v-4c0-1.66-1.34-3-3-3h-4c-1.66 0-3 1.34-3 3h2c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1H6c-2.21 0-4 1.79-4 4v3h15v-2c1.66 0 3-1.34 3-3V9c0-.55.45-1 1-1h1V6z",
    "dishwasher": "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-8 2a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1M7 4a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m11 16H6V8h12zm-3.33-4.67c.02.7-.26 1.38-.76 1.88a2.7 2.7 0 0 1-3.82 0c-.5-.5-.78-1.18-.76-1.88.07-.71.3-1.39.67-2 .37-.83.81-1.6 1.33-2.33l.67-1c1.79 2.59 2.67 4.36 2.67 5.33",
    "silverware-fork-knife": "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4",
    "pot-steam": "M19 19c0 1.11-.89 2-2 2H7a2 2 0 0 1-2-2v-7H3v-2h18v2h-2M8 1.5a3.35 3.35 0 0 0 0 6.7h1.53c.39 0 .76.1 1.08.3h2.02c-.58-1.05-1.77-1.75-3.1-1.75H8c-1 0-1.85-.98-1.85-2S7 3 8 3m4.85-1c0 1-.85 1.85-1.85 1.85v1.5c1.92 0 3.5 1.35 3.89 3.15h1.53a5.54 5.54 0 0 0-3.07-4.12c.62-.61 1-1.45 1-2.38Z",
    "stove": "M6 14h2l3 3H9zM4 4h1V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2v1h-3v-1H7v1H4v-1a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m14 3a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m6-1H4v4h16zM4 19h16v-7H4zM6 7a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m7 7h2l3 3h-2z",
    "fridge-outline": "M9 21v1H7v-1a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2v1h-2v-1zM7 4v5h10V4zm0 15h10v-8H7zm1-7h2v3H8zm0-6h2v2H8z",
    "bed": "M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4M7 13a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3",
    "toilet": "M9 22h8v-2.5c2.41-1.63 4-4.38 4-7.5V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8H3c0 3.09 2 6 6 7.5zm-3.71-8h13.42A7.02 7.02 0 0 1 15 18.33V20h-4v-1.67C9 18 5.86 15.91 5.29 14M15 4h4v8h-4zm1 1v3h2V5z",
    "shower": "M21 14v1c0 1.91-1.07 3.57-2.65 4.41L19 22h-2l-.5-2h-9L7 22H5l.65-2.59A4.99 4.99 0 0 1 3 15v-1H2v-2h18V5a1 1 0 0 0-1-1c-.5 0-.88.34-1 .79.63.54 1 1.34 1 2.21h-6a3 3 0 0 1 3-3h.17c.41-1.16 1.52-2 2.83-2a3 3 0 0 1 3 3v9zm-2 0H5v1a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3z",
    "sofa": "M12.5 7c0-1.11.89-2 2-2H18c1.1 0 2 .9 2 2v2.16c-1.16.41-2 1.51-2 2.81V14h-5.5zM6 11.96V14h5.5V7c0-1.11-.89-2-2-2H6c-1.1 0-2 .9-2 2v2.15c1.16.41 2 1.52 2 2.81m14.66-1.93c-.98.16-1.66 1.09-1.66 2.09V15H5v-3a2 2 0 1 0-4 0v5c0 1.1.9 2 2 2v2h2v-2h14v2h2v-2c1.1 0 2-.9 2-2v-5c0-1.21-1.09-2.18-2.34-1.97",
    "window-closed-variant": "M21 20V2H3v18H1v3h22v-3M19 4v7h-6V4M5 4h6v7H5m0 9v-7h6v7m2 0v-7h6v7Z",
    "lightbulb-outline": "M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7M9 21v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1m3-17a5 5 0 0 0-5 5c0 2.05 1.23 3.81 3 4.58V16h4v-2.42c1.77-.77 3-2.53 3-4.58a5 5 0 0 0-5-5",
    "hand-wash": "m17 5 .62 1.37L19 7l-1.38.63L17 9l-.64-1.37L15 7l1.36-.63zm-6 1.13V4h2c.57 0 1.1.17 1.55.45L16 3c-.85-.61-1.87-1-3-1H7.5v2H9v2.14A4.99 4.99 0 0 0 5.26 9.5h3.98L15 11.65v-.62a5 5 0 0 0-4-4.9M1 22h4V11H1zm19-5h-7l-2.09-.73.33-.94L13 16h2.82c.65 0 1.18-.53 1.18-1.18 0-.49-.31-.93-.77-1.11L8.97 11H7v9l7 2 8-3a2 2 0 0 0-2-2m0-3c1.1 0 2-.9 2-2s-2-4-2-4-2 2.9-2 4 .9 2 2 2",
    "flower": "M3 13a9 9 0 0 0 9 9c0-5-4.03-9-9-9m9-7.5A2.5 2.5 0 0 1 14.5 8a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 8 2.5 2.5 0 0 1 12 5.5m-6.4 4.75a2.5 2.5 0 0 0 2.5 2.5c.53 0 1.02-.17 1.4-.44v.19A2.5 2.5 0 0 0 12 15a2.5 2.5 0 0 0 2.5-2.5v-.19c.38.27.87.44 1.4.44a2.5 2.5 0 0 0 2.5-2.5c0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.26 1.43-2.25a2.5 2.5 0 0 0-2.5-2.5c-.53 0-1.02.16-1.4.44V3.5A2.5 2.5 0 0 0 12 1a2.5 2.5 0 0 0-2.5 2.5v.19c-.38-.28-.87-.44-1.4-.44a2.5 2.5 0 0 0-2.5 2.5c0 .99.59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25M12 22a9 9 0 0 0 9-9c-5 0-9 4-9 9",
    "flower-tulip": "M3 13a9 9 0 0 0 9 9 9 9 0 0 0-9-9m9 9a9 9 0 0 0 9-9 9 9 0 0 0-9 9m6-19v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V3c.74 0 1.47.12 2.16.39.55.23 1.04.57 1.45 1L12 2l2.39 2.39c.41-.43.9-.77 1.45-1A5.9 5.9 0 0 1 18 3",
    "sprout": "M2 22v-2s5-2 10-2 10 2 10 2v2zm9.3-12.9c-1.2-3.9-7.3-3-7.3-3s.2 7.8 5.9 6.6C9.5 9.8 8 9 8 9c2.8 0 3 3.4 3 3.4V17h2v-4.2s0-3.9 3-4.9c0 0-2 3-2 5 7 .7 7-8.9 7-8.9s-8.9-1-9.7 5.1",
    "leaf": "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8",
    "tree": "M11 21v-4.26c-.47.17-.97.26-1.5.26C7 17 5 15 5 12.5c0-1.27.5-2.41 1.36-3.23C6.13 8.73 6 8.13 6 7.5 6 5 8 3 10.5 3c1.56 0 2.94.8 3.75 2h.25a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5q-.75 0-1.5-.21V21z",
    "shovel": "m15.1 1.81-2.83 2.83c-.77.78-.77 2.05 0 2.83l1.41 1.41-4.55 4.55-2.82-2.83L4.89 12c-4.95 5-1.39 8.5-1.39 8.5S7 24 12 19.09l1.41-1.41-2.8-2.8 4.54-4.54 1.39 1.39c.78.77 2.05.77 2.83 0L22.2 8.9zm2.83 8.47L16.55 8.9l-1.44-1.44-1.4-1.4 1.41-1.41 4.23 4.23z",
    "grass": "M12 20H2v-2h5.75C7 15.19 4.81 13 2 12.26c.64-.16 1.31-.26 2-.26 4.42 0 8 3.58 8 8m10-7.74c-.64-.16-1.31-.26-2-.26-2.93 0-5.5 1.58-6.88 3.93.29.66.53 1.35.67 2.07.13.65.21 1.32.21 2h8v-2h-5.76c.76-2.81 2.95-5 5.76-5.74M15.64 11c.78-2.07 2.23-3.82 4.09-5-4.29.16-7.73 3.67-7.73 8 .95-1.25 2.2-2.28 3.64-3m-4.22-2.15A8.53 8.53 0 0 0 6.7 4C8.14 5.86 9 8.18 9 10.71c0 .21-.03.41-.04.61.43.24.83.52 1.22.82a9.9 9.9 0 0 1 1.24-3.29",
    "paw": "M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89-.37-1.77.3-3.35 1.48-3.54m7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38 1.41-1.41 2.41-4.06 4.42-4.06 2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88",
    "dog": "M18 4c-1.71 0-2.75.33-3.35.61C13.88 4.23 13 4 12 4s-1.88.23-2.65.61C8.75 4.33 7.71 4 6 4c-3 0-5 8-5 10 0 .83 1.32 1.59 3.14 1.9.64 2.24 3.66 3.95 7.36 4.1v-4.28c-.59-.37-1.5-1.04-1.5-1.72 0-1 2-1 2-1s2 0 2 1c0 .68-.91 1.35-1.5 1.72V20c3.7-.15 6.72-1.86 7.36-4.1C21.68 15.59 23 14.83 23 14c0-2-2-10-5-10M4.15 13.87c-.5-.12-.89-.26-1.15-.37.25-2.77 2.2-7.1 3.05-7.5.54 0 .95.06 1.32.11-2.1 2.31-2.93 5.93-3.22 7.76M9 12a1 1 0 0 1-1-1c0-.54.45-1 1-1a1 1 0 0 1 1 1c0 .56-.45 1-1 1m6 0a1 1 0 0 1-1-1c0-.54.45-1 1-1a1 1 0 0 1 1 1c0 .56-.45 1-1 1m4.85 1.87c-.29-1.83-1.12-5.45-3.22-7.76.37-.05.78-.11 1.32-.11.85.4 2.8 4.73 3.05 7.5-.25.11-.64.25-1.15.37",
    "cat": "m12 8-1.33.09C9.81 7.07 7.4 4.5 5 4.5c0 0-1.97 2.96-.04 6.91-.55.83-.89 1.26-.96 2.25l-1.93.29.21.98 1.76-.26.14.71-1.57.94.47.89 1.45-.89C5.68 18.76 8.59 20 12 20s6.32-1.24 7.47-3.68l1.45.89.47-.89-1.57-.94.14-.71 1.76.26.21-.98-1.93-.29c-.07-.99-.41-1.42-.96-2.25C20.97 7.46 19 4.5 19 4.5c-2.4 0-4.81 2.57-5.67 3.59zm-3 3a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m6 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m-4 3h2l-.7 1.39c.2.64.76 1.11 1.45 1.11a1.5 1.5 0 0 0 1.5-1.5h.5a2 2 0 0 1-2 2c-.75 0-1.4-.41-1.75-1-.35.59-1 1-1.75 1a2 2 0 0 1-2-2h.5a1.5 1.5 0 0 0 1.5 1.5c.69 0 1.25-.47 1.45-1.11z",
    "fish": "m12 20 .76-3c-3.26-.21-6.17-1.6-7.01-3.42-.09.48-.22.92-.42 1.25C4.67 16 3.33 16 2 16c1.1 0 1.5-1.57 1.5-3.5S3.1 9 2 9c1.33 0 2.67 0 3.33 1.17.2.33.33.77.42 1.25.65-1.42 2.57-2.57 4.91-3.1L9 5c2 0 4 0 5.33.67 1.13.56 1.78 1.6 2.36 2.71 2.92.7 5.31 2.28 5.31 4.12 0 1.88-2.5 3.5-5.5 4.16-.83 1.1-1.64 2.12-2.33 2.67-.84.67-1.5.67-2.17.67m5-9a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1",
    "bird": "m23 11.5-3.05-1.13c-.26-1.15-.91-1.81-.91-1.81a4.19 4.19 0 0 0-5.93 0l-1.48 1.48L5 3c-1 4 0 8 2.45 11.22L2 19.5s8.89 2 14.07-2.05c2.76-2.16 3.38-3.42 3.77-4.75zm-5.29.22c-.39.39-1.03.39-1.42 0a.996.996 0 0 1 0-1.41c.39-.39 1.03-.39 1.42 0s.39 1.02 0 1.41",
    "cart": "M17 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2M1 2v2h2l3.6 7.59-1.36 2.45c-.15.28-.24.61-.24.96a2 2 0 0 0 2 2h12v-2H7.42a.25.25 0 0 1-.25-.25q0-.075.03-.12L8.1 13h7.45c.75 0 1.41-.42 1.75-1.03l3.58-6.47c.07-.16.12-.33.12-.5a1 1 0 0 0-1-1H5.21l-.94-2M7 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2",
    "basket-outline": "M22 9h-4.79l-4.38-6.56a.997.997 0 0 0-1.66.01L6.79 9H2c-.55 0-1 .45-1 1 0 .09 0 .18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1M12 4.8 14.8 9H9.2zM18.5 19h-13l-2.19-8H20.7zM12 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2",
    "package-variant": "M2 10.96a.985.985 0 0 1-.37-1.37L3.13 7c.11-.2.28-.34.47-.42l7.83-4.4c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.19.1.35.26.44.46l1.45 2.52c.28.48.11 1.09-.36 1.36l-1 .58v4.96c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.99.99 0 0 1 3 16.5v-5.54c-.3.17-.68.18-1 0m10-6.81v6.7l5.96-3.35zM5 15.91l6 3.38v-6.71L5 9.21zm14 0v-3.22l-5 2.9c-.33.18-.7.17-1 .01v3.69zm-5.15-2.55 6.28-3.63-.58-1.01-6.28 3.63z",
    "mailbox": "M17 4H7a5 5 0 0 0-5 5v11h18a2 2 0 0 0 2-2V9a5 5 0 0 0-5-5m-7 14H4V9a3 3 0 0 1 3-3 3 3 0 0 1 3 3zm9-3h-2v-2h-4v-2h6zM9 11H5V9h4z",
    "car": "m5 11 1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m-11 0A1.5 1.5 0 0 1 5 14.5 1.5 1.5 0 0 1 6.5 13 1.5 1.5 0 0 1 8 14.5 1.5 1.5 0 0 1 6.5 16M18.92 6c-.2-.58-.76-1-1.42-1h-11c-.66 0-1.22.42-1.42 1L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8z",
    "bike": "M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5 3.5 3.5 0 0 1 8.5 17 3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m9.8-2H19V8.2h-3.2l-1.94-3.27c-.29-.5-.86-.83-1.46-.83-.47 0-.9.19-1.2.5L7.5 8.29C7.19 8.6 7 9 7 9.5c0 .63.33 1.16.85 1.47L11.2 13v5H13v-6.5l-2.25-1.65 2.32-2.35m5.93 13a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5 3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m0-8.5a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m-3-7.2c1 0 1.8-.8 1.8-1.8S17 1.2 16 1.2 14.2 2 14.2 3 15 4.8 16 4.8",
    "gift": "M9.06 1.93C7.17 1.92 5.33 3.74 6.17 6H3a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h9V8h2v3h9a1 1 0 0 0 1-1V8a2 2 0 0 0-2-2h-3.17C19 2.73 14.6.42 12.57 3.24L12 4l-.57-.78c-.63-.89-1.5-1.28-2.37-1.29M9 4c.89 0 1.34 1.08.71 1.71S8 5.89 8 5a1 1 0 0 1 1-1m6 0c.89 0 1.34 1.08.71 1.71S14 5.89 14 5a1 1 0 0 1 1-1M2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8h-9v8h-2v-8z",
    "school": "M12 3 1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17z",
    "book-open-variant": "M12 21.5c-1.35-.85-3.8-1.5-5.5-1.5-1.65 0-3.35.3-4.75 1.05-.1.05-.15.05-.25.05-.25 0-.5-.25-.5-.5V6c.6-.45 1.25-.75 2-1 1.11-.35 2.33-.5 3.5-.5 1.95 0 4.05.4 5.5 1.5 1.45-1.1 3.55-1.5 5.5-1.5 1.17 0 2.39.15 3.5.5.75.25 1.4.55 2 1v14.6c0 .25-.25.5-.5.5-.1 0-.15 0-.25-.05-1.4-.75-3.1-1.05-4.75-1.05-1.7 0-4.15.65-5.5 1.5M12 8v11.5c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V7c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5m1 3.5c1.11-.68 2.6-1 4.5-1 .91 0 1.76.09 2.5.28V9.23c-.87-.15-1.71-.23-2.5-.23q-2.655 0-4.5.84zm4.5.17c-1.71 0-3.21.26-4.5.79v1.69c1.11-.65 2.6-.99 4.5-.99 1.04 0 1.88.08 2.5.24v-1.5c-.87-.16-1.71-.23-2.5-.23m2.5 2.9c-.87-.16-1.71-.24-2.5-.24-1.83 0-3.33.27-4.5.8v1.69c1.11-.66 2.6-.99 4.5-.99 1.04 0 1.88.08 2.5.24z",
    "pencil": "M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z",
    "bag-personal": "M16 5V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1a4 4 0 0 0-4 4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a4 4 0 0 0-4-4m-6-1h4v1h-4zm2 5 2 2-2 2-2-2zm6 7H9v2H8v-2H6v-1h12z",
    "music-note": "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z",
    "basketball": "M2.34 14.63c.6-.22 1.22-.33 1.88-.33q2.01 0 3.51 1.26L4.59 18.7a10.6 10.6 0 0 1-2.25-4.07M15.56 9.8c1.97 1.47 4.1 1.83 6.38 1.08.03.21.06.59.06 1.12 0 1.03-.25 2.18-.72 3.45-.47 1.26-1.05 2.28-1.73 3.05l-6.33-6.31zm-6.79 6.84c1.06 1.53 1.28 3.2.65 5.02-1.42-.41-2.69-1.05-3.75-1.93zm3.42-3.42 6.31 6.33c-2.17 1.9-4.72 2.7-7.62 2.39.21-.66.32-1.38.32-2.16 0-.62-.14-1.35-.42-2.18s-.61-1.51-.98-2.04zM8.81 14.5a6.7 6.7 0 0 0-3.23-1.59c-1.22-.23-2.39-.16-3.52.22-.03-.22-.06-.6-.06-1.13 0-1.03.25-2.18.72-3.45.47-1.26 1.05-2.28 1.73-3.05l6.66 6.69zm6.75-6.77c-1.34-1.65-1.65-3.45-.93-5.39.62.16 1.33.46 2.13.92.79.45 1.44.9 1.94 1.33zm6.1 1.65c-.6.21-1.22.32-1.88.32-1.09 0-2.14-.32-3.14-.98l3.09-3.05c.88 1.1 1.52 2.33 1.93 3.71m-9.47 1.73L5.5 4.45c2.17-1.9 4.72-2.7 7.63-2.39q-.33.99-.33 2.16c0 .72.16 1.53.49 2.44.33.9.71 1.62 1.21 2.15z",
    "soccer": "m16.93 17.12-.8-1.36 1.46-4.37 1.41-.47 1 .75v.14c0 .07.03.13.03.19 0 1.97-.66 3.71-1.97 5.21zM9.75 15l-1.37-4.03L12 8.43l3.62 2.54L14.25 15zM12 20.03c-.88 0-1.71-.14-2.5-.42l-.69-1.51.66-1.1h5.11l.61 1.1-.69 1.51c-.79.28-1.62.42-2.5.42m-6.06-2.82c-.53-.62-.99-1.45-1.38-2.46-.39-1.02-.59-1.94-.59-2.75 0-.06.03-.12.03-.19v-.14l1-.75 1.41.47 1.46 4.37-.8 1.36zM11 5.29v1.4L7 9.46l-1.34-.42-.42-1.36C5.68 7 6.33 6.32 7.19 5.66s1.68-1.09 2.46-1.31zm3.35-.94c.78.22 1.6.65 2.46 1.31S18.32 7 18.76 7.68l-.42 1.36-1.34.43-4-2.77V5.29zm-9.42.58C3 6.89 2 9.25 2 12s1 5.11 2.93 7.07S9.25 22 12 22s5.11-1 7.07-2.93S22 14.75 22 12s-1-5.11-2.93-7.07S14.75 2 12 2 6.89 3 4.93 4.93",
    "palette": "M17.5 12a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 17.5 9a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m-3-4A1.5 1.5 0 0 1 13 6.5 1.5 1.5 0 0 1 14.5 5 1.5 1.5 0 0 1 16 6.5 1.5 1.5 0 0 1 14.5 8m-5 0A1.5 1.5 0 0 1 8 6.5 1.5 1.5 0 0 1 9.5 5 1.5 1.5 0 0 1 11 6.5 1.5 1.5 0 0 1 9.5 8m-3 4A1.5 1.5 0 0 1 5 10.5 1.5 1.5 0 0 1 6.5 9 1.5 1.5 0 0 1 8 10.5 1.5 1.5 0 0 1 6.5 12M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 1.5 1.5 0 0 0 1.5-1.5c0-.39-.15-.74-.39-1-.23-.27-.38-.62-.38-1a1.5 1.5 0 0 1 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8",
    "baby-bottle": "m11.28 2.8-.5.5a5.5 5.5 0 0 0-4.37-.43l-.08-.07A2.5 2.5 0 0 0 2.8 6.33l.07.08a5.5 5.5 0 0 0 .43 4.37l-.5.5a1.5 1.5 0 0 0 0 2.12l1.41 1.42a1.5 1.5 0 0 0 2.12 0l.35-.36 7.08 7.07a1.5 1.5 0 0 0 2.12 0l5.65-5.65a1.5 1.5 0 0 0 0-2.12l-7.07-7.08.36-.35a1.5 1.5 0 0 0 0-2.12L13.4 2.8a1.5 1.5 0 0 0-2.12 0m2.48 2.47-8.49 8.49-1.41-1.42 8.48-8.48m2.48 7.77-3.19 3.19-1.06-1.06 3.19-3.19m3.18 3.19-3.18 3.18-1.07-1.06 3.19-3.19Z",
    "tooth": "M7 2C4 2 2 5 2 8c0 2.11 1 5 2 6s2 8 4 8c4.54 0 2-7 4-7s-.54 7 4 7c2 0 3-7 4-8s2-3.89 2-6c0-3-2-6-5-6s-3 1-5 1-2-1-5-1",
    "pill": "m4.22 11.29 7.07-7.07a6.01 6.01 0 0 1 8.49 0c2.34 2.34 2.34 6.14 0 8.49l-7.07 7.07c-2.35 2.34-6.15 2.34-8.49 0a6.01 6.01 0 0 1 0-8.49m1.42 1.42a3.98 3.98 0 0 0-1.04 3.86l5.99-5.98 4.24 4.24 3.53-3.54a3.98 3.98 0 0 0 0-5.65 3.98 3.98 0 0 0-5.65 0z",
    "laptop": "M4 6h16v10H4m16 2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4c-1.11 0-2 .89-2 2v10a2 2 0 0 0 2 2H0v2h24v-2z",
    "phone": "M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z",
  };
  const ICON_KEYS = Object.keys(ICONS);
  const iconSVG = (key) =>
    ICONS[key] ? `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[key]}"/></svg>` : "";

  const CSS = `
    :host { display: block; }
    * { box-sizing: border-box; }
    ha-card {
      position: relative; overflow: hidden; padding: 16px;
      --soft: color-mix(in srgb, var(--primary-text-color, #000) 6%, transparent);
      --soft2: color-mix(in srgb, var(--primary-text-color, #000) 11%, transparent);
    }
    button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    h2, h3, h4 { margin: 0; }
    .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .top h2 { font-size: 1.3rem; font-weight: 700; letter-spacing: -.01em; }
    .iconbtn {
      width: 38px; height: 38px; border-radius: 50%; border: none; background: var(--soft);
      display: grid; place-items: center; transition: background .15s, transform .15s;
    }
    .iconbtn:hover { background: var(--soft2); }
    .iconbtn:active { transform: scale(.92); }
    .iconbtn ha-icon { --mdc-icon-size: 20px; }
    .topbtns { display: flex; gap: 8px; }

    .pchips, .tabs { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 2px 2px 10px; }
    .pchips::-webkit-scrollbar, .tabs::-webkit-scrollbar { display: none; }
    .pchip {
      flex: none; position: relative; display: flex; align-items: center; gap: 8px;
      padding: 5px 12px 5px 5px; border-radius: 999px; border: 2px solid transparent; background: var(--soft);
      transition: background .15s, border-color .15s, transform .15s;
    }
    .pchip.all { padding: 5px 14px; }
    .pchip:active { transform: scale(.96); }
    .pchip.sel { border-color: var(--c, var(--primary-color)); background: color-mix(in srgb, var(--c, var(--primary-color)) 15%, transparent); }
    .pn { font-weight: 600; }
    .pst { font-weight: 700; font-size: .85rem; color: #d99100; }
    .crown { position: absolute; top: -9px; right: 4px; font-size: 15px; transform: rotate(12deg); }
    .av {
      width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; flex: none;
      background: var(--c, var(--primary-color)); color: #fff; font-size: 17px; font-weight: 700;
      box-shadow: 0 2px 6px color-mix(in srgb, var(--c, #000) 35%, transparent);
    }
    .av.sm { width: 24px; height: 24px; font-size: 13px; box-shadow: none; }

    .tabs { padding-bottom: 6px; border-bottom: 1px solid var(--divider-color); margin-bottom: 4px; }
    .tab {
      flex: none; padding: 8px 14px; border-radius: 12px; border: none; background: transparent;
      color: var(--secondary-text-color); font-weight: 600; transition: all .15s;
    }
    .tab.sel { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .cnt {
      display: inline-block; min-width: 20px; padding: 0 6px; margin-left: 4px; border-radius: 999px;
      background: var(--soft2); font-size: .75rem; text-align: center; line-height: 20px;
    }
    .tab.sel .cnt { background: rgba(255,255,255,.28); }

    .sec {
      display: flex; align-items: center; gap: 8px; margin: 16px 2px 8px;
      font-size: .75rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
      color: var(--secondary-text-color); background: none; border: none; padding: 0; width: auto;
    }
    .sec.bad { color: #ef476f; }
    .sec ha-icon { --mdc-icon-size: 18px; transition: transform .2s; }
    .sec.open ha-icon { transform: rotate(180deg); }

    .task {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px; margin-bottom: 8px;
      border-radius: 18px; background: var(--soft); border-left: 5px solid var(--c, var(--primary-color));
      transition: background .15s, transform .15s, opacity .2s; touch-action: pan-y; user-select: none;
    }
    .task.done { opacity: .62; border-left-color: transparent; }
    .task.done .title { text-decoration: line-through; }
    .check {
      width: 30px; height: 30px; border-radius: 50%; flex: none; display: grid; place-items: center;
      border: 2.5px solid var(--c, var(--primary-color)); background: transparent; padding: 0;
      transition: background .15s, transform .15s;
    }
    .check::after { content: "✓"; color: #fff; font-weight: 800; font-size: 15px; opacity: 0; transition: opacity .15s; }
    .check:hover { background: var(--c, var(--primary-color)); }
    .check:hover::after { opacity: 1; }
    .check:active { transform: scale(.85); }
    .tick { width: 30px; text-align: center; color: #06a67b; font-weight: 800; flex: none; }
    .body { flex: 1; min-width: 0; text-align: left; background: none; border: none; padding: 0; }
    .title { font-weight: 600; word-break: break-word; }
    .meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
    .mchip {
      display: inline-flex; align-items: center; gap: 3px; padding: 1px 8px; border-radius: 999px;
      font-size: .74rem; background: var(--soft); color: var(--secondary-text-color);
    }
    .mchip ha-icon { --mdc-icon-size: 13px; }
    .mchip.bad { background: rgba(239,71,111,.15); color: #ef476f; font-weight: 600; }
    .mchip.today { background: rgba(6,214,160,.17); color: #059c75; font-weight: 600; }
    .star {
      display: inline-flex; align-items: center; gap: 3px; padding: 3px 10px; border-radius: 999px; flex: none;
      background: linear-gradient(135deg, #ffd166, #ffb703); color: #5c3b00; font-weight: 800; font-size: .85rem;
      box-shadow: 0 1px 3px rgba(255,183,3,.4);
    }
    .star.neg { background: linear-gradient(135deg, #cfd8dc, #b0bec5); color: #263238; box-shadow: none; }

    .add {
      width: 100%; margin-top: 8px; padding: 13px; border-radius: 18px; border: 2px dashed var(--divider-color);
      background: transparent; color: var(--primary-color); font-weight: 700; transition: background .15s;
    }
    .add:hover { background: var(--soft); }
    .empty { text-align: center; padding: 30px 12px; color: var(--secondary-text-color); }
    .empty .big { font-size: 2.8rem; margin-bottom: 6px; }
    .empty b { display: block; color: var(--primary-text-color); font-size: 1.05rem; margin-bottom: 2px; }
    .empty .btn { margin-top: 14px; }

    .btn {
      padding: 11px 18px; border-radius: 14px; border: none; font-weight: 700; background: var(--soft);
      transition: transform .12s, filter .15s;
    }
    .btn:active { transform: scale(.96); }
    .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .btn:disabled { opacity: .45; cursor: default; }
    .ico { width: 1em; height: 1em; fill: currentColor; display: block; }
    .tbadge {
      width: 36px; height: 36px; flex: none; border-radius: 12px; display: grid; place-items: center; font-size: 22px;
      color: var(--c, var(--primary-color)); background: color-mix(in srgb, var(--c, var(--primary-color)) 16%, transparent);
    }
    .tbadge.sm { width: 30px; height: 30px; font-size: 18px; border-radius: 10px; }
    .icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 6px; margin-top: 10px; }
    .ic {
      height: 44px; border-radius: 12px; border: 2px solid transparent; background: var(--soft); padding: 0;
      display: grid; place-items: center; font-size: 24px; color: var(--primary-text-color);
    }
    .ic:hover { background: var(--soft2); }
    .ic.sel { border-color: var(--primary-color); color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .chip .ico { font-size: 20px; }
    .gbtn {
      width: 34px; height: 34px; flex: none; border-radius: 50%; border: none; background: transparent; padding: 0;
      display: grid; place-items: center; opacity: .6; transition: background .15s, opacity .15s;
    }
    .gbtn:hover { opacity: 1; background: var(--soft2); }
    .gbtn ha-icon { --mdc-icon-size: 20px; }
    .pick button.sel { border-color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); }
    .btn.danger { background: rgba(239,71,111,.14); color: #ef476f; }
    .btn.ghost { background: transparent; }

    .burst { position: absolute; width: 0; height: 0; pointer-events: none; z-index: 10; }
    .burst .plus {
      position: absolute; transform: translate(-50%, -50%); white-space: nowrap; font-weight: 800; font-size: 1.35rem;
      color: #ffb703; text-shadow: 0 1px 5px rgba(0,0,0,.3); animation: rise 1s ease-out forwards;
    }
    .burst i {
      position: absolute; width: 8px; height: 8px; border-radius: 2px; background: var(--c); opacity: 0;
      animation: fly .85s ease-out var(--d) forwards;
    }
    @keyframes rise {
      0% { opacity: 0; transform: translate(-50%, -30%) scale(.6); }
      20% { opacity: 1; transform: translate(-50%, -90%) scale(1.15); }
      100% { opacity: 0; transform: translate(-50%, -280%) scale(1); }
    }
    @keyframes fly {
      0% { opacity: 1; transform: translate(0, 0) rotate(0); }
      100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(260deg); }
    }
    .toast {
      position: absolute; left: 16px; right: 16px; bottom: 16px; z-index: 20; padding: 12px 16px; border-radius: 14px;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-weight: 600;
      animation: fade .2s;
    }

    /* Dialoge */
    .overlay {
      position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,.5); display: flex;
      align-items: flex-end; justify-content: center; animation: fade .15s;
    }
    .sheet {
      --soft: color-mix(in srgb, var(--primary-text-color, #000) 6%, transparent);
      --soft2: color-mix(in srgb, var(--primary-text-color, #000) 11%, transparent);
      width: min(540px, 100%); max-height: 92vh; overflow: auto; padding: 20px 20px 24px;
      border-radius: 26px 26px 0 0; background: var(--card-background-color, #fff); color: var(--primary-text-color, #222);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif); animation: up .22s ease-out;
    }
    @media (min-width: 600px) { .overlay { align-items: center; } .sheet { border-radius: 26px; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes up { from { transform: translateY(30px); opacity: .4; } to { transform: none; opacity: 1; } }
    .sheet h3 { font-size: 1.2rem; margin-bottom: 14px; }
    .sheet h4 { margin: 20px 0 8px; font-size: .78rem; letter-spacing: .07em; text-transform: uppercase; color: var(--secondary-text-color); }
    .shead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .shead h3 { margin: 0; }
    .field { margin-bottom: 16px; }
    .field > label { display: block; margin-bottom: 6px; font-size: .8rem; font-weight: 700; color: var(--secondary-text-color); }
    .inp {
      width: 100%; padding: 12px 14px; border-radius: 14px; border: 1.5px solid transparent; background: var(--soft);
      color: inherit; font: inherit; outline: none;
    }
    .inp:focus { border-color: var(--primary-color); }
    select.inp { appearance: none; }
    .row { display: flex; align-items: center; gap: 10px; }
    .row > * { min-width: 0; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      padding: 7px 13px; border-radius: 999px; border: 2px solid transparent; background: var(--soft); font-weight: 600;
      display: inline-flex; align-items: center; gap: 6px; transition: all .12s;
    }
    .chip.sel { border-color: var(--c, var(--primary-color)); background: color-mix(in srgb, var(--c, var(--primary-color)) 16%, transparent); }
    .chip.sq { padding: 7px 0; width: 42px; justify-content: center; }
    .stepper { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .stepper .iconbtn { width: 44px; height: 44px; font-size: 1.4rem; font-weight: 700; }
    .bigstar { font-size: 1.7rem; font-weight: 800; min-width: 80px; text-align: center; color: #d99100; }
    .swatches { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .sw { width: 38px; height: 38px; border-radius: 12px; border: 2.5px solid transparent; background: var(--soft); font-size: 20px; padding: 0; }
    .sw.col { border-radius: 50%; }
    .sw.sel { border-color: var(--primary-text-color); }
    .foot { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }
    .foot .grow { margin-right: auto; }
    .li {
      display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 14px; background: var(--soft); margin-bottom: 6px;
    }
    .li .grow { flex: 1; min-width: 0; font-weight: 600; }
    .li small { display: block; font-weight: 400; color: var(--secondary-text-color); }
    .li .iconbtn { width: 34px; height: 34px; background: transparent; }
    .hint { color: var(--secondary-text-color); font-size: .85rem; margin-top: 6px; }
    .pick { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
    .pick button { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: 18px; border: 2px solid transparent; background: var(--soft); font-weight: 700; }
    .pick button:hover { border-color: var(--c); }
    .pick .av { width: 44px; height: 44px; font-size: 24px; }
  `;

  class AufgabenplanerCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._state = null;
      this._error = null;
      this._view = "today";
      this._showDone = false;
      this._lang = "de";
      this._unsub = null;
      this._subscribing = false;
      this._failed = false;
      this._built = false;
      this._modal = null;
      this._config = {};
      this._activeId = null;
      this._users = undefined;
      this._idle = null;
      try {
        const v = localStorage.getItem(LS_UP);
        this._hideUpcoming = v === null ? null : v === "1";
      } catch (e) {
        this._hideUpcoming = null;
      }
    }

    _upcomingHidden() {
      return this._hideUpcoming !== null ? this._hideUpcoming : !!this._config.hide_upcoming;
    }

    /* ---------- Lebenszyklus ---------- */
    setConfig(config) {
      this._config = { ...config };
      if (this._built) this._render();
    }
    getCardSize() { return 6; }
    getGridOptions() { return { columns: 12, min_columns: 6 }; }
    static getStubConfig() { return {}; }

    set hass(hass) {
      this._hass = hass;
      const lang = (hass.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
      if (lang !== this._lang) {
        this._lang = lang;
        if (this._built) this._render();
      }
      if (!this._built) this._build();
      if (!this._unsub && !this._subscribing && !this._failed) this._subscribe();
    }

    connectedCallback() {
      if (this._hass && !this._unsub && !this._subscribing && !this._failed) this._subscribe();
    }

    disconnectedCallback() {
      if (this._unsub) {
        try { this._unsub(); } catch (e) { /* ignore */ }
        this._unsub = null;
      }
      this._modalClose();
      clearTimeout(this._idle);
    }

    t(key, vars) {
      let s = (L[this._lang] || L.de)[key] ?? L.de[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
      return s;
    }

    // Wegwischen: Aufgabe löschen; bei Wiederholungen entfällt nur dieser Termin (kein Sterne-Eintrag).
    _initSwipe() {
      const root = this.shadowRoot;
      let s = null;
      root.addEventListener("pointerdown", (ev) => {
        const el = ev.target.closest && ev.target.closest(".task:not(.done)");
        if (!el || ev.button > 0) return;
        s = { el, x: ev.clientX, y: ev.clientY, dx: 0, lock: false, id: ev.pointerId };
      });
      root.addEventListener("pointermove", (ev) => {
        if (!s || ev.pointerId !== s.id) return;
        const dx = ev.clientX - s.x, dy = ev.clientY - s.y;
        if (!s.lock) {
          if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { s = null; return; }
          if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
            s.lock = true;
            try { s.el.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
            s.el.style.transition = "none";
          } else return;
        }
        s.dx = dx;
        s.el.style.transform = `translateX(${dx}px)`;
        s.el.style.opacity = String(Math.max(0.25, 1 - Math.abs(dx) / (s.el.offsetWidth * 0.9)));
      });
      const end = async () => {
        if (!s) return;
        const { el, dx, lock } = s;
        s = null;
        if (!lock) return;
        this._swiped = true;
        setTimeout(() => { this._swiped = false; }, 50);
        el.style.transition = "";
        if (Math.abs(dx) < Math.max(90, el.offsetWidth * 0.35)) {
          el.style.transform = ""; el.style.opacity = "";
          return;
        }
        el.style.transform = `translateX(${dx > 0 ? 110 : -110}%)`;
        el.style.opacity = "0";
        const btn = el.querySelector("[data-id]");
        const task = btn && (this._state.tasks || []).find((t) => t.id === btn.dataset.id);
        if (!task) return;
        const r = await this._call(task.recurrence ? "aufgabenplaner/task_skip" : "aufgabenplaner/task_delete", { task_id: task.id });
        if (r === undefined || r === null || r === false) { el.style.transform = ""; el.style.opacity = ""; }
        else this._toast(this.t(task.recurrence ? "skipped" : "removed", { n: task.title }));
      };
      root.addEventListener("pointerup", end);
      root.addEventListener("pointercancel", end);
    }

    _build() {
      this._built = true;
      this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="main"></div></ha-card>`;
      this.shadowRoot.addEventListener("click", (ev) => {
        if (this._swiped) { this._swiped = false; return; }
        this._onClick(ev);
      });
      this._initSwipe();
      this._render();
    }

    _subscribe() {
      this._subscribing = true;
      this._hass.connection
        .subscribeMessage(
          (state) => {
            this._error = null;
            this._state = state;
            this._initActive();
            this._render();
          },
          { type: "aufgabenplaner/subscribe" }
        )
        .then((unsub) => {
          this._subscribing = false;
          if (this.isConnected) this._unsub = unsub;
          else unsub();
        })
        .catch((err) => {
          this._subscribing = false;
          this._failed = true;
          this._error = err && err.code === "not_loaded" ? this.t("notSetUp") : (err && err.message) || String(err);
          this._render();
        });
    }

    /* Die mit dem eingeloggten Home-Assistant-Benutzer verknüpfte Person (oder null). */
    _me() {
      const uid = this._hass && this._hass.user && this._hass.user.id;
      if (!uid || !this._state) return null;
      return this._state.persons.find((p) => p.user_id && p.user_id === uid) || null;
    }

    /* Gemeinsame Ansicht (z. B. Tablet): Benutzer ist keiner Person zugeordnet oder `shared: true`. */
    _isShared() {
      return this._config.shared === true || !this._me();
    }

    _initActive() {
      const persons = this._state.persons;
      if (this._activeId && !persons.find((p) => p.id === this._activeId)) this._activeId = null;
      if (!this._guessed && persons.length) {
        this._guessed = true;
        if (!this._isShared()) this._activeId = this._me().id;
      }
    }

    /* In der gemeinsamen Ansicht springt die Auswahl nach einer Minute ohne Bedienung auf „Alle“ zurück. */
    _bumpIdle() {
      clearTimeout(this._idle);
      if (this._state && this._activeId && this._isShared()) {
        this._idle = setTimeout(() => {
          this._activeId = null;
          this._render();
        }, 60000);
      }
    }

    _setActive(id) {
      this._activeId = id || null;
      this._bumpIdle();
      this._render();
    }

    async _loadUsers() {
      try {
        this._users = await this._hass.callWS({ type: "aufgabenplaner/users" });
      } catch (e) {
        this._users = null; // kein Administrator: Feld wird ausgeblendet
      }
    }

    /* ---------- Hilfsfunktionen ---------- */
    _person(id) { return this._state.persons.find((p) => p.id === id); }
    _list(id) { return this._state.lists.find((l) => l.id === id); }
    _task(id) { return this._state.tasks.find((t) => t.id === id); }
    _active() { return this._activeId; }

    _taskPersonId(task) {
      if (task.assignee) return task.assignee;
      const l = this._list(task.list_id);
      return l && l.owner ? l.owner : null;
    }

    _visibleToActive(task) {
      const a = this._active();
      if (!a) return true;
      const l = this._list(task.list_id);
      if (l && l.owner) return l.owner === a;
      return !task.assignee || task.assignee === a;
    }

    _visibleLists() {
      const a = this._active();
      return this._state.lists.filter((l) => !a || !l.owner || l.owner === a);
    }

    _avatar(p, small) {
      if (!p) return `<span class="av ${small ? "sm" : ""}" style="--c:#999">?</span>`;
      const face = p.emoji ? esc(p.emoji) : esc((p.name || "?").charAt(0).toUpperCase());
      return `<span class="av ${small ? "sm" : ""}" style="--c:${esc(p.color)}">${face}</span>`;
    }

    _wd(i, style) {
      return new Date(2024, 0, 1 + i).toLocaleDateString(this._lang, { weekday: style });
    }

    _dayDiff(iso, todayIso) {
      const a = new Date(iso + "T00:00:00");
      const b = new Date(todayIso + "T00:00:00");
      return Math.round((a - b) / 86400000);
    }

    _fmtDate(iso) {
      return new Date(iso + "T00:00:00").toLocaleDateString(this._lang, { weekday: "short", day: "numeric", month: "short" });
    }

    _dueChip(task) {
      if (!task.due) return "";
      const d = this._dayDiff(task.due, this._state.today);
      let cls = "", text;
      if (d < 0) { cls = "bad"; text = this._fmtDate(task.due); }
      else if (d === 0) { cls = "today"; text = this.t("todayLbl"); }
      else if (d === 1) text = this.t("tomorrow");
      else text = this._fmtDate(task.due);
      return `<span class="mchip ${cls}"><ha-icon icon="mdi:calendar"></ha-icon>${esc(text)}</span>`;
    }

    _recLabel(rec) {
      if (!rec) return "";
      const n = rec.interval || 1;
      if (rec.type === "daily") return n > 1 ? this.t("everyNDays", { n }) : this.t("daily");
      if (rec.type === "weekly") {
        const days = rec.days || [];
        if (n === 1 && days.length === 1) return this.t("everyWd", { d: this._wd(days[0], "long") });
        const short = days.map((d) => this._wd(d, "short")).join(", ");
        return (n > 1 ? this.t("everyNWeeks", { n }) : this.t("weekly")) + ": " + short;
      }
      if (rec.type === "monthly") {
        return n > 1 ? this.t("everyNMonths", { n }) : this.t("monthlyOn", { d: rec.day });
      }
      return "";
    }

    async _call(type, payload = {}) {
      try {
        return await this._hass.callWS({ type, ...payload });
      } catch (err) {
        this._toast((err && (err.message || err.code)) || "Error");
        return null;
      }
    }

    _toast(msg) {
      const card = this.shadowRoot.querySelector("ha-card");
      if (!card) return;
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = msg;
      card.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    }

    /* ---------- Rendering ---------- */
    _render() {
      if (!this._built) return;
      const main = this.shadowRoot.querySelector(".main");
      if (this._error) {
        main.innerHTML = `<div class="empty"><div class="big">🔌</div>${esc(this._error)}</div>`;
        return;
      }
      if (!this._state) {
        main.innerHTML = `<div class="empty"><div class="big">⏳</div></div>`;
        return;
      }
      const hasPersons = this._state.persons.length > 0;
      main.innerHTML = this._headerHTML() + (hasPersons ? this._bodyHTML() : this._onboardHTML());
    }

    _onboardHTML() {
      return `<div class="empty"><div class="big">⭐</div><b>${this.t("welcome")}</b>${this.t("welcomeSub")}
        <div><button class="btn primary" data-act="newperson">${this.t("addPerson")}</button></div></div>`;
    }

    _headerHTML() {
      const s = this._state;
      const a = this._active();
      const title = this._config.title || "Aufgabenplaner";
      const top = [...s.persons].sort((x, y) => y.stars - x.stars)[0];
      const crown = top && top.stars > 0 && s.persons.filter((p) => p.stars === top.stars).length === 1 ? top.id : null;
      let chips = "";
      if (s.persons.length) {
        chips =
          `<div class="pchips"><button class="pchip all ${!a ? "sel" : ""}" data-act="person" data-id=""><span class="pn">👥 ${this.t("everyone")}</span></button>` +
          s.persons
            .map(
              (p) => `<button class="pchip ${a === p.id ? "sel" : ""}" data-act="person" data-id="${esc(p.id)}" style="--c:${esc(p.color)}">
                ${crown === p.id ? '<span class="crown">👑</span>' : ""}${this._avatar(p)}
                <span class="pn">${esc(p.name)}</span><span class="pst">★ ${fmtStars(p.stars, this._lang)}</span></button>`
            )
            .join("") +
          `</div>`;
      }
      return `<div class="top"><h2>${esc(title)}</h2>
        <div class="topbtns">
          <button class="iconbtn" data-act="templates" title="${this.t("templates")}"><ha-icon icon="mdi:format-list-checks"></ha-icon></button>
          <button class="iconbtn" data-act="settings" title="${this.t("settings")}"><ha-icon icon="mdi:cog"></ha-icon></button>
        </div></div>${chips}`;
    }

    _bodyHTML() {
      const s = this._state;
      const today = s.today;
      const lists = this._visibleLists();
      if (this._view !== "today" && !lists.find((l) => l.id === this._view)) this._view = "today";
      const isToday = this._view === "today";

      const open = s.tasks.filter((t) => !t.done && this._visibleToActive(t));
      const cmp = (x, y) => (x.due || "9999").localeCompare(y.due || "9999") || x.title.localeCompare(y.title);
      const inView = (isToday ? open.filter((t) => t.due && t.due <= today) : open.filter((t) => t.list_id === this._view)).sort(cmp);

      // Tabs
      const todayCount = open.filter((t) => t.due && t.due <= today).length;
      let tabs = `<div class="tabs"><button class="tab ${isToday ? "sel" : ""}" data-act="view" data-id="today">☀️ ${this.t("today")}${
        todayCount ? `<span class="cnt">${todayCount}</span>` : ""
      }</button>`;
      for (const l of lists) {
        const n = open.filter((t) => t.list_id === l.id).length;
        tabs += `<button class="tab ${this._view === l.id ? "sel" : ""}" data-act="view" data-id="${esc(l.id)}">${esc(l.icon)} ${esc(l.name)}${
          n ? `<span class="cnt">${n}</span>` : ""
        }</button>`;
      }
      tabs += `</div>`;

      // Gruppen
      const groups = isToday
        ? [["overdue", inView.filter((t) => t.due < today)], ["today", inView.filter((t) => t.due === today)]]
        : [
            ["overdue", inView.filter((t) => t.due && t.due < today)],
            ["today", inView.filter((t) => t.due === today)],
            ["upcoming", inView.filter((t) => t.due && t.due > today)],
            ["nodate", inView.filter((t) => !t.due)],
          ];
      let html = "";
      for (const [key, items] of groups) {
        if (!items.length) continue;
        const label = key === "today" ? this.t("today") : this.t(key);
        if (key === "upcoming") {
          const hidden = this._upcomingHidden();
          html += `<button class="sec ${hidden ? "" : "open"}" data-act="toggleupcoming">${esc(label)} (${items.length})<ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
          if (!hidden) html += items.map((t) => this._taskHTML(t, isToday)).join("");
          continue;
        }
        html += `<div class="sec ${key === "overdue" ? "bad" : ""}">${esc(label)}</div>`;
        html += items.map((t) => this._taskHTML(t, isToday)).join("");
      }
      if (!inView.length) {
        html += isToday
          ? `<div class="empty"><div class="big">🎉</div><b>${this.t("allDone")}</b>${this.t("allDoneSub")}</div>`
          : `<div class="empty"><div class="big">📝</div><b>${this.t("nothing")}</b>${this.t("nothingSub")}</div>`;
      }

      // Erledigt (aus dem Sternekonto-Protokoll)
      const a = this._active();
      const entries = s.ledger.filter(
        (e) =>
          (!a || e.person === a) &&
          (isToday ? e.at.slice(0, 10) === today : e.list === this._view)
      );
      if (entries.length) {
        html += `<button class="sec ${this._showDone ? "open" : ""}" data-act="toggledone">${this.t("done")} (${entries.length})<ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
        if (this._showDone) html += entries.map((e) => this._entryHTML(e)).join("");
      }

      html += `<button class="add" data-act="add">＋ ${this.t("addTask")}</button>`;
      return tabs + html;
    }

    _taskHTML(task, showList) {
      const pid = this._taskPersonId(task);
      const p = pid ? this._person(pid) : null;
      const color = p ? p.color : "var(--primary-color)";
      const lst = this._list(task.list_id);
      const rec = task.recurrence
        ? `<span class="mchip"><ha-icon icon="mdi:repeat"></ha-icon>${esc(this._recLabel(task.recurrence))}</span>`
        : "";
      const listChip = showList && lst ? `<span class="mchip">${esc(lst.icon)} ${esc(lst.name)}</span>` : "";
      return `<div class="task" style="--c:${esc(color)}">
        <button class="check" data-act="complete" data-id="${esc(task.id)}" aria-label="OK"></button>
        ${task.icon && ICONS[task.icon] ? `<span class="tbadge">${iconSVG(task.icon)}</span>` : ""}
        <button class="body" data-act="edit" data-id="${esc(task.id)}">
          <div class="title">${esc(task.title)}</div>
          <div class="meta">${this._dueChip(task)}${rec}${listChip}</div>
        </button>
        ${
          this._state.persons.length > 1
            ? `<button class="gbtn" data-act="together" data-id="${esc(task.id)}" title="${this.t("together")}"><ha-icon icon="mdi:account-multiple-plus"></ha-icon></button>`
            : ""
        }
        ${p ? this._avatar(p, true) : ""}
        ${task.stars > 0 ? `<span class="star">★ ${task.stars}</span>` : ""}
      </div>`;
    }

    _entryHTML(e) {
      const p = this._person(e.person);
      const neg = e.stars < 0;
      const title = e.title || (e.adjust ? this.t("adjustment") : "");
      return `<div class="task done"><span class="tick">${e.adjust ? "★" : "✓"}</span>
        <div class="body"><div class="title">${esc(title)}</div>${
          e.split > 1 ? `<div class="meta"><span class="mchip">👥 ${this.t("sharedBy", { n: e.split })}</span></div>` : ""
        }</div>
        ${p ? this._avatar(p, true) : ""}
        <span class="star ${neg ? "neg" : ""}">${neg ? "−" : "+"}${fmtStars(Math.abs(e.stars), this._lang)} ★</span>
        <button class="iconbtn" data-act="undo" data-id="${esc(e.id)}" title="${this.t("undo")}"><ha-icon icon="mdi:undo"></ha-icon></button></div>`;
    }

    /* ---------- Klicks ---------- */
    _onClick(ev) {
      const el = ev.target.closest("[data-act]");
      if (!el || !this._state) return;
      this._bumpIdle();
      const id = el.dataset.id;
      switch (el.dataset.act) {
        case "person": this._setActive(id); break;
        case "view": this._view = id; this._render(); break;
        case "complete": this._complete(id, el); break;
        case "together": this._together(id, el); break;
        case "edit": this._openTaskForm(this._task(id)); break;
        case "add": this._openTaskForm(null); break;
        case "undo": this._call("aufgabenplaner/entry_undo", { entry_id: id }); break;
        case "toggledone": this._showDone = !this._showDone; this._render(); break;
        case "toggleupcoming":
          this._hideUpcoming = !this._upcomingHidden();
          try { localStorage.setItem(LS_UP, this._hideUpcoming ? "1" : "0"); } catch (e) { /* ignore */ }
          this._render();
          break;
        case "settings": this._openSettings(); break;
        case "templates": this._openTemplates(); break;
        case "newperson": this._openPersonForm(null, false); break;
      }
    }

    _complete(taskId, el) {
      const task = this._task(taskId);
      if (!task) return;
      const rect = el.getBoundingClientRect();
      const pid = this._taskPersonId(task) || this._active();
      if (!pid) {
        this._pickPeople(task, rect);
        return;
      }
      this._doComplete(task, [pid], rect);
    }

    /* Gemeinsam erledigt: mehrere Personen wählen, die Sterne werden geteilt. */
    _together(taskId, el) {
      const task = this._task(taskId);
      if (!task) return;
      const first = this._taskPersonId(task) || this._active();
      this._pickPeople(task, el.getBoundingClientRect(), { multi: true, selected: first ? [first] : [] });
    }

    async _doComplete(task, personIds, rect) {
      const p = this._person(personIds[0]);
      this._burst(rect, splitStars(task.stars, personIds.length), p ? p.color : "#ffb703");
      await this._call("aufgabenplaner/task_complete", { task_id: task.id, person_ids: personIds });
    }

    _burst(rect, stars, color) {
      const card = this.shadowRoot.querySelector("ha-card");
      if (!card) return;
      const cr = card.getBoundingClientRect();
      const x = rect.left - cr.left + rect.width / 2;
      const y = rect.top - cr.top + rect.height / 2;
      const b = document.createElement("div");
      b.className = "burst";
      b.style.left = x + "px";
      b.style.top = y + "px";
      let h = `<span class="plus">${stars > 0 ? "+" + fmtStars(stars, this._lang) + " ★" : "✓"}</span>`;
      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const dist = 38 + Math.random() * 34;
        h += `<i style="--dx:${(Math.cos(ang) * dist).toFixed(0)}px;--dy:${(Math.sin(ang) * dist).toFixed(0)}px;--d:${i * 15}ms;--c:${COLORS[i % COLORS.length]}"></i>`;
      }
      b.innerHTML = h;
      card.appendChild(b);
      setTimeout(() => b.remove(), 1300);
    }

    /* ---------- Dialog-Grundgerüst ---------- */
    _modalOpen() {
      this._modalClose();
      const host = document.createElement("div");
      const sr = host.attachShadow({ mode: "open" });
      sr.innerHTML = `<style>${CSS}</style><div class="overlay"><div class="sheet"></div></div>`;
      document.body.appendChild(host);
      const overlay = sr.querySelector(".overlay");
      overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) this._modalClose();
      });
      this._modal = { host, sr, sheet: sr.querySelector(".sheet") };
      return this._modal;
    }

    _modalClose() {
      if (this._modal) {
        this._modal.host.remove();
        this._modal = null;
      }
    }

    /* Einzelwahl: ein Tipp auf den Namen erledigt die Aufgabe. Mehrfachwahl: Namen antippen, dann bestätigen. */
    _pickPeople(task, rect, opts = {}) {
      const persons = this._state.persons;
      let multi = !!opts.multi;
      const sel = new Set(opts.selected || []);
      const m = this._modalOpen();
      const draw = () => {
        const n = sel.size;
        const each = splitStars(task.stars, Math.max(1, n));
        m.sheet.innerHTML = `<h3>${this.t("who")}</h3>
          ${multi ? `<div class="hint" style="margin:-6px 0 12px">${this.t("togetherHint")}</div>` : ""}
          <div class="pick">${persons
            .map(
              (p) => `<button class="${multi && sel.has(p.id) ? "sel" : ""}" data-m="pick" data-id="${esc(p.id)}" style="--c:${esc(p.color)}">${this._avatar(p)}${esc(p.name)}</button>`
            )
            .join("")}</div>
          ${
            multi
              ? `<div class="hint" style="margin-top:14px;text-align:center;min-height:1.3em">${
                  n > 1 && task.stars > 0
                    ? this.t("splitInfo", { total: fmtStars(task.stars, this._lang), n, each: fmtStars(each, this._lang) })
                    : ""
                }</div>
                <div class="foot"><button class="btn ghost" data-m="cancel">${this.t("cancel")}</button>
                  <button class="btn primary" data-m="ok" ${n ? "" : "disabled"}>${this.t("done")}</button></div>`
              : `<div class="foot" style="justify-content:space-between"><button class="btn ghost" data-m="cancel">${this.t("cancel")}</button>
                  <button class="btn" data-m="multi">👥 ${this.t("severalPeople")}</button></div>`
          }`;
      };
      m.sheet.onclick = (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        switch (b.dataset.m) {
          case "pick":
            if (multi) {
              if (sel.has(b.dataset.id)) sel.delete(b.dataset.id);
              else sel.add(b.dataset.id);
              draw();
            } else {
              this._modalClose();
              this._doComplete(task, [b.dataset.id], rect);
            }
            break;
          case "multi": multi = true; draw(); break;
          case "cancel": this._modalClose(); break;
          case "ok":
            if (sel.size) {
              const ids = [...sel];
              this._modalClose();
              this._doComplete(task, ids, rect);
            }
            break;
        }
      };
      draw();
    }

    /* ---------- Wiederholung (gemeinsam für Aufgaben und Vorlagen) ---------- */
    _recFields(rec) {
      return {
        rtype: rec ? rec.type : "none",
        interval: rec ? rec.interval || 1 : 1,
        days: rec && rec.days ? [...rec.days] : [],
        day: rec && rec.day ? rec.day : "",
      };
    }

    _recHTML(f) {
      const unit = { daily: "unitDays", weekly: "unitWeeks", monthly: "unitMonths" }[f.rtype];
      return `<div class="field"><label>${this.t("repeat")}</label>
        <select class="inp" data-f="rtype">
          ${[["none", "repNone"], ["daily", "repDaily"], ["weekly", "repWeekly"], ["monthly", "repMonthly"]]
            .map(([v, k]) => `<option value="${v}" ${f.rtype === v ? "selected" : ""}>${this.t(k)}</option>`)
            .join("")}</select>
        ${
          f.rtype !== "none"
            ? `<div class="row" style="margin-top:10px"><span>${this.t("every")}</span>
                <input class="inp" style="width:80px" type="number" min="1" max="52" data-f="interval" value="${esc(f.interval)}">
                <span>${this.t(unit)}</span>
                ${f.rtype === "monthly" ? `<span>${this.t("onDay")}</span><input class="inp" style="width:80px" type="number" min="1" max="31" data-f="day" value="${esc(f.day)}" placeholder="${f.due ? Number(f.due.slice(8, 10)) : ""}">` : ""}
              </div>`
            : ""
        }
        ${
          f.rtype === "weekly"
            ? `<div class="chips" style="margin-top:10px">${[0, 1, 2, 3, 4, 5, 6]
                .map((i) => `<button class="chip sq ${f.days.includes(i) ? "sel" : ""}" data-m="wd" data-v="${i}">${esc(this._wd(i, "short"))}</button>`)
                .join("")}</div>`
            : ""
        }
      </div>`;
    }

    /* Gibt { recurrence } oder { error } zurück. */
    _recPayload(f) {
      const interval = Math.max(1, Math.min(52, parseInt(f.interval, 10) || 1));
      if (f.rtype === "daily") return { recurrence: { type: "daily", interval } };
      if (f.rtype === "weekly") {
        if (!f.days.length) return { error: this.t("pickWeekday") };
        return { recurrence: { type: "weekly", interval, days: f.days } };
      }
      if (f.rtype === "monthly") {
        const day = parseInt(f.day, 10) || (f.due ? Number(f.due.slice(8, 10)) : new Date().getDate());
        return { recurrence: { type: "monthly", interval, day: Math.max(1, Math.min(31, day)) } };
      }
      return { recurrence: null };
    }

    /* Beim Wechsel auf „Wöchentlich“ den passenden Wochentag vorwählen. */
    _onRtypeChange(f) {
      if (f.rtype === "weekly" && !f.days.length) {
        const d = new Date((f.due || this._state.today) + "T00:00:00").getDay();
        f.days = [d === 0 ? 6 : d - 1];
      }
    }

    /* Symbol-Auswahl (gemeinsam für Aufgaben und Vorlagen): zugeklappt ein Knopf, aufgeklappt ein Raster. */
    _iconFieldHTML(f) {
      const has = f.icon && ICONS[f.icon];
      return `<div class="field"><label>${this.t("symbol")}</label>
        <button class="chip" data-m="icon-toggle">${has ? iconSVG(f.icon) : ""}${has ? this.t("changeSymbol") : "＋ " + this.t("pickSymbol")}</button>
        ${
          f.iconOpen
            ? `<div class="icons">${ICON_KEYS.map(
                (k) => `<button class="ic ${f.icon === k ? "sel" : ""}" data-m="icon" data-v="${k}" title="${k}">${iconSVG(k)}</button>`
              ).join("")}<button class="ic ${!f.icon ? "sel" : ""}" data-m="icon" data-v="" title="${this.t("noSymbol")}">✕</button></div>`
            : ""
        }
      </div>`;
    }

    /* ---------- Aufgaben-Formular ---------- */
    /* prefill: optional eine Vorlage { title, stars, recurrence } */
    _openTaskForm(task, prefill) {
      const s = this._state;
      const visible = this._visibleLists();
      const shared = s.lists.find((l) => !l.owner) || s.lists[0];
      let defaultList = shared.id;
      if (!task && this._view !== "today" && this._list(this._view)) defaultList = this._view;
      const src = task || prefill || null;
      const f = {
        id: task ? task.id : null,
        title: src ? src.title : "",
        icon: src ? src.icon || "" : "",
        iconOpen: false,
        list_id: task ? task.list_id : defaultList,
        stars: src ? src.stars : 1,
        assignee: task ? task.assignee || null : null,
        due: task && task.due ? task.due : "",
        ...this._recFields(src && src.recurrence),
      };
      const listChoices = task ? s.lists : visible.length ? visible : s.lists;
      const m = this._modalOpen();

      const draw = () => {
        const lst = this._list(f.list_id);
        const owner = lst && lst.owner ? this._person(lst.owner) : null;
        m.sheet.innerHTML = `
          <h3>${task ? this.t("editTask") : this.t("newTask")}</h3>
          <div class="field"><input class="inp" data-f="title" value="${esc(f.title)}" placeholder="${this.t("taskTitle")}" maxlength="120"></div>
          ${this._iconFieldHTML(f)}
          <div class="field"><label>${this.t("list")}</label>
            <select class="inp" data-f="list_id">${listChoices
              .map((l) => `<option value="${esc(l.id)}" ${l.id === f.list_id ? "selected" : ""}>${esc(l.icon)} ${esc(l.name)}</option>`)
              .join("")}</select></div>
          <div class="field"><label>${this.t("stars")}</label>
            <div class="stepper"><button class="iconbtn" data-m="stars-">−</button>
              <div class="bigstar">★ ${f.stars}</div><button class="iconbtn" data-m="stars+">+</button></div>
            <div class="chips">${STAR_PRESETS.map((n) => `<button class="chip sq ${f.stars === n ? "sel" : ""}" data-m="stars" data-v="${n}">${n}</button>`).join("")}</div></div>
          ${
            owner
              ? `<div class="field"><label>${this.t("assignee")}</label><div class="hint" style="margin:0">${this.t("personalList")} ${this._avatar(owner, true)} <b>${esc(owner.name)}</b></div></div>`
              : `<div class="field"><label>${this.t("assignee")}</label><div class="chips">
                  <button class="chip ${!f.assignee ? "sel" : ""}" data-m="assign" data-id="">👥 ${this.t("anyone")}</button>
                  ${s.persons.map((p) => `<button class="chip ${f.assignee === p.id ? "sel" : ""}" data-m="assign" data-id="${esc(p.id)}" style="--c:${esc(p.color)}">${this._avatar(p, true)}${esc(p.name)}</button>`).join("")}
                </div></div>`
          }
          <div class="field"><label>${this.t("due")}</label>
            <div class="row" style="flex-wrap:wrap"><input class="inp" style="flex:1;min-width:150px" type="date" data-f="due" value="${esc(f.due)}">
              <button class="chip" data-m="due" data-v="today">${this.t("todayBtn")}</button>
              <button class="chip" data-m="due" data-v="tomorrow">${this.t("tomorrowBtn")}</button>
              <button class="chip" data-m="due" data-v="">✕</button></div></div>
          ${this._recHTML(f)}
          <div class="foot">
            ${task ? `<button class="btn danger grow" data-m="delete">${this.t("delete")}</button>` : ""}
            <button class="btn ghost" data-m="cancel">${this.t("cancel")}</button>
            <button class="btn primary" data-m="save">${this.t("save")}</button>
          </div>`;
      };

      const readDue = (v) => {
        if (v === "") return "";
        const d = new Date(this._state.today + "T00:00:00");
        if (v === "tomorrow") d.setDate(d.getDate() + 1);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };

      m.sheet.oninput = (ev) => {
        const k = ev.target.dataset && ev.target.dataset.f;
        if (!k) return;
        f[k] = ev.target.value;
      };
      m.sheet.onchange = (ev) => {
        const k = ev.target.dataset && ev.target.dataset.f;
        if (!k) return;
        f[k] = ev.target.value;
        if (k === "list_id") {
          const l = this._list(f.list_id);
          f.assignee = l && l.owner ? l.owner : null;
          draw();
        } else if (k === "rtype") {
          this._onRtypeChange(f);
          draw();
        }
      };
      m.sheet.onclick = async (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        const v = b.dataset.v;
        switch (b.dataset.m) {
          case "stars-": f.stars = Math.max(0, f.stars - 1); draw(); break;
          case "stars+": f.stars = Math.min(20, f.stars + 1); draw(); break;
          case "stars": f.stars = Number(v); draw(); break;
          case "assign": f.assignee = b.dataset.id || null; draw(); break;
          case "icon-toggle": f.iconOpen = !f.iconOpen; draw(); break;
          case "icon": f.icon = b.dataset.v; f.iconOpen = false; draw(); break;
          case "due": f.due = readDue(v); draw(); break;
          case "wd": {
            const i = Number(v);
            f.days = f.days.includes(i) ? f.days.filter((d) => d !== i) : [...f.days, i];
            draw();
            break;
          }
          case "cancel": this._modalClose(); break;
          case "delete":
            if (confirm(this.t("confirmDelete", { n: task.title }))) {
              const r = await this._call("aufgabenplaner/task_delete", { task_id: task.id });
              if (r) this._modalClose();
            }
            break;
          case "save": {
            const title = (f.title || "").trim();
            if (!title) { this._toast(this.t("titleRequired")); return; }
            const rp = this._recPayload(f);
            if (rp.error) { this._toast(rp.error); return; }
            const payload = {
              title,
              list_id: f.list_id,
              stars: f.stars,
              icon: f.icon || null,
              assignee: f.assignee,
              due: f.due || null,
              recurrence: rp.recurrence,
            };
            if (f.id) payload.task_id = f.id;
            const r = await this._call("aufgabenplaner/task_save", payload);
            if (r) this._modalClose();
            break;
          }
        }
      };
      draw();
      const input = m.sheet.querySelector("[data-f='title']");
      if (input && !task) setTimeout(() => input.focus(), 50);
    }

    /* ---------- Vorlagen (häufige Aufgaben mit gespeicherten Sternen) ---------- */
    _openTemplates() {
      const s = this._state;
      const m = this._modal || this._modalOpen();
      const items = [...(s.templates || [])].sort((a, b) => a.title.localeCompare(b.title, this._lang));
      const rows = items.length
        ? items
            .map(
              (tp) => `<div class="li">
                ${tp.icon && ICONS[tp.icon] ? `<span class="tbadge sm">${iconSVG(tp.icon)}</span>` : ""}
                <button class="body grow" data-m="use" data-id="${esc(tp.id)}">
                  <div class="title">${esc(tp.title)}</div>
                  <small>${tp.stars > 0 ? "★ " + tp.stars : "–"}${tp.recurrence ? " · " + esc(this._recLabel(tp.recurrence)) : ""}</small>
                </button>
                <button class="iconbtn" data-m="use" data-id="${esc(tp.id)}" title="${this.t("useTemplate")}"><ha-icon icon="mdi:plus-circle"></ha-icon></button>
                <button class="iconbtn" data-m="edit" data-id="${esc(tp.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button>
                <button class="iconbtn" data-m="del" data-id="${esc(tp.id)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>`
            )
            .join("")
        : `<div class="empty" style="padding:20px 8px"><div class="big">📋</div><b>${this.t("noTemplates")}</b>${this.t("noTemplatesSub")}</div>`;
      m.sheet.innerHTML = `
        <div class="shead"><h3>${this.t("templates")}</h3>
          <button class="iconbtn" data-m="close"><ha-icon icon="mdi:close"></ha-icon></button></div>
        ${items.length ? `<div class="hint" style="margin:0 0 12px">${this.t("templatesHint")}</div>` : ""}
        ${rows}
        <button class="add" data-m="new">＋ ${this.t("addTemplate")}</button>`;
      m.sheet.oninput = null;
      m.sheet.onchange = null;
      m.sheet.onclick = async (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        const tp = (s.templates || []).find((x) => x.id === b.dataset.id);
        switch (b.dataset.m) {
          case "close": this._modalClose(); break;
          case "new": this._openTemplateForm(null); break;
          case "use": if (tp) this._openTaskForm(null, tp); break;
          case "edit": if (tp) this._openTemplateForm(tp); break;
          case "del":
            if (tp && confirm(this.t("confirmDelete", { n: tp.title }))) {
              await this._call("aufgabenplaner/template_delete", { template_id: tp.id });
              this._openTemplates();
            }
            break;
        }
      };
    }

    _openTemplateForm(tpl) {
      const f = {
        id: tpl ? tpl.id : null,
        title: tpl ? tpl.title : "",
        icon: tpl ? tpl.icon || "" : "",
        iconOpen: false,
        stars: tpl ? tpl.stars : 1,
        ...this._recFields(tpl && tpl.recurrence),
      };
      const m = this._modal || this._modalOpen();
      const draw = () => {
        m.sheet.innerHTML = `
          <h3>${tpl ? this.t("editTemplate") : this.t("newTemplate")}</h3>
          <div class="field"><input class="inp" data-f="title" value="${esc(f.title)}" placeholder="${this.t("taskTitle")}" maxlength="120"></div>
          ${this._iconFieldHTML(f)}
          <div class="field"><label>${this.t("stars")}</label>
            <div class="stepper"><button class="iconbtn" data-m="stars-">−</button>
              <div class="bigstar">★ ${f.stars}</div><button class="iconbtn" data-m="stars+">+</button></div>
            <div class="chips">${STAR_PRESETS.map((n) => `<button class="chip sq ${f.stars === n ? "sel" : ""}" data-m="stars" data-v="${n}">${n}</button>`).join("")}</div></div>
          ${this._recHTML(f)}
          <div class="foot"><button class="btn ghost" data-m="cancel">${this.t("cancel")}</button>
            <button class="btn primary" data-m="save">${this.t("save")}</button></div>`;
      };
      m.sheet.oninput = (ev) => {
        const k = ev.target.dataset && ev.target.dataset.f;
        if (k) f[k] = ev.target.value;
      };
      m.sheet.onchange = (ev) => {
        const k = ev.target.dataset && ev.target.dataset.f;
        if (!k) return;
        f[k] = ev.target.value;
        if (k === "rtype") {
          this._onRtypeChange(f);
          draw();
        }
      };
      m.sheet.onclick = async (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        switch (b.dataset.m) {
          case "stars-": f.stars = Math.max(0, f.stars - 1); draw(); break;
          case "stars+": f.stars = Math.min(20, f.stars + 1); draw(); break;
          case "stars": f.stars = Number(b.dataset.v); draw(); break;
          case "icon-toggle": f.iconOpen = !f.iconOpen; draw(); break;
          case "icon": f.icon = b.dataset.v; f.iconOpen = false; draw(); break;
          case "wd": {
            const i = Number(b.dataset.v);
            f.days = f.days.includes(i) ? f.days.filter((d) => d !== i) : [...f.days, i];
            draw();
            break;
          }
          case "cancel": this._openTemplates(); break;
          case "save": {
            const title = (f.title || "").trim();
            if (!title) { this._toast(this.t("titleRequired")); return; }
            const rp = this._recPayload(f);
            if (rp.error) { this._toast(rp.error); return; }
            const payload = { title, stars: f.stars, icon: f.icon || null, recurrence: rp.recurrence };
            if (f.id) payload.template_id = f.id;
            const r = await this._call("aufgabenplaner/template_save", payload);
            if (r) this._openTemplates();
            break;
          }
        }
      };
      draw();
      const input = m.sheet.querySelector("[data-f='title']");
      if (input && !tpl) setTimeout(() => input.focus(), 50);
    }

    /* ---------- Einstellungen ---------- */
    _openSettings() {
      const s = this._state;
      const m = this._modal || this._modalOpen();
      const personRows = s.persons.length
        ? s.persons
            .map(
              (p) => `<div class="li">${this._avatar(p)}<div class="grow">${esc(p.name)}<small>★ ${fmtStars(p.stars, this._lang)}${p.user_id ? " · 🔗 " + this.t("linked") : ""}</small></div>
                <button class="iconbtn" data-m="editperson" data-id="${esc(p.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button>
                <button class="iconbtn" data-m="delperson" data-id="${esc(p.id)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>`
            )
            .join("")
        : `<div class="hint">${this.t("noPersonsHint")}</div>`;
      const listRows = s.lists
        .map((l) => {
          const o = l.owner ? this._person(l.owner) : null;
          return `<div class="li"><span style="font-size:22px;width:32px;text-align:center">${esc(l.icon)}</span>
            <div class="grow">${esc(l.name)}<small>${o ? esc(this.t("ownerOf")) + " " + esc(o.name) : this.t("shared")}</small></div>
            <button class="iconbtn" data-m="editlist" data-id="${esc(l.id)}"><ha-icon icon="mdi:pencil"></ha-icon></button>
            <button class="iconbtn" data-m="dellist" data-id="${esc(l.id)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button></div>`;
        })
        .join("");
      m.sheet.innerHTML = `
        <div class="shead"><h3>${this.t("settings")}</h3>
          <button class="iconbtn" data-m="close"><ha-icon icon="mdi:close"></ha-icon></button></div>
        <h4>${this.t("persons")}</h4>${personRows}
        <button class="add" data-m="newperson">＋ ${this.t("addPerson")}</button>
        <h4>${this.t("lists")}</h4>${listRows}
        <button class="add" data-m="newlist">＋ ${this.t("addList")}</button>
        ${
          s.persons.length
            ? `<h4>${this.t("adjust")}</h4>
          <div class="field"><select class="inp" data-a="person">${s.persons.map((p) => `<option value="${esc(p.id)}">${esc(p.emoji || "")} ${esc(p.name)}</option>`).join("")}</select></div>
          <div class="row" style="margin-bottom:8px"><input class="inp" style="width:130px;flex:none" type="number" data-a="amount" placeholder="${this.t("amount")}">
            <input class="inp" data-a="reason" placeholder="${this.t("reason")}" maxlength="80"></div>
          <div class="hint" style="margin:0 0 10px">${this.t("adjustHint")}</div>
          <button class="btn primary" data-m="adjust">${this.t("apply")}</button>`
            : ""
        }
        <h4>${this.t("backup")}</h4>
        <div class="hint" style="margin:0 0 10px">${this.t("backupHint")}</div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <button class="btn" data-m="export">⬇️ ${this.t("exportBtn")}</button>
          <button class="btn" data-m="import">⬆️ ${this.t("importBtn")}</button></div>`;
      m.sheet.oninput = null;
      m.sheet.onchange = null;
      m.sheet.onclick = async (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        const id = b.dataset.id;
        switch (b.dataset.m) {
          case "close": this._modalClose(); break;
          case "export": {
            const backup = await this._call("aufgabenplaner/export");
            if (!backup) break;
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `aufgabenplaner-backup-${(this._state.today || "").slice(0, 10) || "export"}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            this._toast(this.t("exported"));
            break;
          }
          case "import": {
            const inp = document.createElement("input");
            inp.type = "file";
            inp.accept = ".json,application/json";
            inp.onchange = async () => {
              const file = inp.files && inp.files[0];
              if (!file) return;
              let backup;
              try { backup = JSON.parse(await file.text()); } catch (e) { this._toast(this.t("importFailed")); return; }
              if (!backup || typeof backup !== "object" || backup.app !== "aufgabenplaner") { this._toast(this.t("importFailed")); return; }
              if (!confirm(this.t("confirmImport"))) return;
              const r = await this._call("aufgabenplaner/import", { backup });
              if (r) { this._toast(this.t("importDone")); this._openSettings(); }
            };
            inp.click();
            break;
          }
          case "newperson": this._openPersonForm(null, true); break;
          case "editperson": this._openPersonForm(this._person(id), true); break;
          case "delperson": {
            const p = this._person(id);
            if (p && confirm(this.t("confirmDeletePerson", { n: p.name }))) {
              await this._call("aufgabenplaner/person_delete", { person_id: id });
              this._openSettings();
            }
            break;
          }
          case "newlist": this._openListForm(null); break;
          case "editlist": this._openListForm(this._list(id)); break;
          case "dellist": {
            const l = this._list(id);
            if (l && confirm(this.t("confirmDelete", { n: l.name }))) {
              await this._call("aufgabenplaner/list_delete", { list_id: id });
              this._openSettings();
            }
            break;
          }
          case "adjust": {
            const q = (k) => m.sheet.querySelector(`[data-a='${k}']`);
            const amount = parseInt(q("amount").value, 10);
            if (!amount) return;
            const r = await this._call("aufgabenplaner/stars_adjust", {
              person_id: q("person").value,
              amount,
              reason: q("reason").value || "",
            });
            if (r) this._openSettings();
            break;
          }
        }
      };
    }

    _openPersonForm(person, fromSettings) {
      const s = this._state;
      const f = {
        id: person ? person.id : null,
        name: person ? person.name : "",
        emoji: person ? person.emoji || "" : "",
        color: person ? person.color : COLORS[s.persons.length % COLORS.length],
        user_id: person ? person.user_id || "" : "",
      };
      const m = this._modal || this._modalOpen();
      const back = () => (fromSettings ? this._openSettings() : this._modalClose());
      const draw = () => {
        m.sheet.innerHTML = `
          <h3>${person ? this.t("editPerson") : this.t("newPerson")}</h3>
          <div class="field"><label>${this.t("name")}</label><input class="inp" data-f="name" value="${esc(f.name)}" maxlength="40"></div>
          <div class="field"><label>${this.t("emoji")}</label>
            <input class="inp" data-f="emoji" value="${esc(f.emoji)}" maxlength="8" placeholder="🦊">
            <div class="swatches">${EMOJIS.map((e) => `<button class="sw ${f.emoji === e ? "sel" : ""}" data-m="emoji" data-v="${e}">${e}</button>`).join("")}</div></div>
          ${
            this._users
              ? `<div class="field"><label>${this.t("haUser")}</label>
            <select class="inp" data-f="user_id"><option value="">${this.t("noUser")}</option>${this._users
              .map((u) => `<option value="${esc(u.id)}" ${f.user_id === u.id ? "selected" : ""}>${esc(u.name)}</option>`)
              .join("")}</select>
            <div class="hint">${this.t("userHint")}</div></div>`
              : ""
          }
          <div class="field"><label>${this.t("color")}</label>
            <div class="swatches">${COLORS.map((c) => `<button class="sw col ${f.color === c ? "sel" : ""}" data-m="color" data-v="${c}" style="background:${c}"></button>`).join("")}</div></div>
          <div class="foot"><button class="btn ghost" data-m="cancel">${this.t("cancel")}</button>
            <button class="btn primary" data-m="save">${this.t("save")}</button></div>`;
      };
      m.sheet.onchange = null;
      m.sheet.oninput = (ev) => {
        const k = ev.target.dataset && ev.target.dataset.f;
        if (k) f[k] = ev.target.value;
      };
      m.sheet.onclick = async (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        switch (b.dataset.m) {
          case "emoji": f.emoji = b.dataset.v; draw(); break;
          case "color": f.color = b.dataset.v; draw(); break;
          case "cancel": back(); break;
          case "save": {
            if (!f.name.trim()) { this._toast(this.t("nameRequired")); return; }
            const payload = { name: f.name.trim(), emoji: f.emoji.trim(), color: f.color };
            if (this._users) payload.user_id = f.user_id || null;
            if (f.id) payload.person_id = f.id;
            const r = await this._call("aufgabenplaner/person_save", payload);
            if (r) back();
            break;
          }
        }
      };
      draw();
      if (this._users === undefined) this._loadUsers().then(() => { if (this._modal === m) draw(); });
    }

    _openListForm(list) {
      const s = this._state;
      const f = {
        id: list ? list.id : null,
        name: list ? list.name : "",
        icon: list ? list.icon || "" : "",
        owner: list ? list.owner || "" : "",
      };
      const m = this._modal || this._modalOpen();
      const draw = () => {
        m.sheet.innerHTML = `
          <h3>${list ? this.t("editList") : this.t("newList")}</h3>
          <div class="field"><label>${this.t("name")}</label><input class="inp" data-f="name" value="${esc(f.name)}" maxlength="40"></div>
          <div class="field"><label>${this.t("emoji")}</label>
            <input class="inp" data-f="icon" value="${esc(f.icon)}" maxlength="8" placeholder="🏠">
            <div class="swatches">${LIST_ICONS.map((e) => `<button class="sw ${f.icon === e ? "sel" : ""}" data-m="icon" data-v="${e}">${e}</button>`).join("")}</div></div>
          <div class="field"><label>${this.t("owner")}</label>
            <div class="chips"><button class="chip ${!f.owner ? "sel" : ""}" data-m="owner" data-id="">👥 ${this.t("shared")}</button>
              ${s.persons.map((p) => `<button class="chip ${f.owner === p.id ? "sel" : ""}" data-m="owner" data-id="${esc(p.id)}" style="--c:${esc(p.color)}">${this._avatar(p, true)}${esc(p.name)}</button>`).join("")}</div></div>
          <div class="foot"><button class="btn ghost" data-m="cancel">${this.t("cancel")}</button>
            <button class="btn primary" data-m="save">${this.t("save")}</button></div>`;
      };
      m.sheet.onchange = null;
      m.sheet.oninput = (ev) => {
        const k = ev.target.dataset && ev.target.dataset.f;
        if (k) f[k] = ev.target.value;
      };
      m.sheet.onclick = async (ev) => {
        const b = ev.target.closest("[data-m]");
        if (!b) return;
        switch (b.dataset.m) {
          case "icon": f.icon = b.dataset.v; draw(); break;
          case "owner": f.owner = b.dataset.id || ""; draw(); break;
          case "cancel": this._openSettings(); break;
          case "save": {
            if (!f.name.trim()) { this._toast(this.t("nameRequired")); return; }
            const payload = { name: f.name.trim(), icon: f.icon.trim(), owner: f.owner || null };
            if (f.id) payload.list_id = f.id;
            const r = await this._call("aufgabenplaner/list_save", payload);
            if (r) this._openSettings();
            break;
          }
        }
      };
      draw();
    }
  }

  /* =====================================================================
     Übersichtskarte: nur Namen, Sterne und die heute fälligen Aufgaben
     ===================================================================== */
  const LO = {
    de: {
      general: "Allgemein", openToday: "Offen heute", stars: "Sterne",
      noPersons: "Lege zuerst in der Aufgabenplaner-Karte Personen an.", notSetUp: L.de.notSetUp,
    },
    en: {
      general: "General", openToday: "Open today", stars: "Stars",
      noPersons: "Add people in the Aufgabenplaner card first.", notSetUp: L.en.notSetUp,
    },
  };

  const OV_CSS = `
    :host { display: block; }
    * { box-sizing: border-box; }
    ha-card {
      padding: 14px; color: var(--primary-text-color, #212121);
      --soft: color-mix(in srgb, var(--primary-text-color, #000) 6%, transparent);
    }
    h2 { margin: 0 0 12px; font-size: 1.3rem; font-weight: 700; letter-spacing: -.01em; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .tile {
      position: relative; padding: 12px; border-radius: 18px; background: var(--soft);
      border-top: 4px solid var(--c, var(--primary-color)); display: flex; flex-direction: column; gap: 10px;
    }
    .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .av {
      width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; flex: none;
      background: var(--c, var(--primary-color)); color: #fff; font-size: 18px; font-weight: 700;
      box-shadow: 0 2px 6px color-mix(in srgb, var(--c, #000) 35%, transparent);
    }
    .nm { flex: 1; min-width: 0; font-weight: 700; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .crown { position: absolute; top: -12px; left: 26px; font-size: 17px; transform: rotate(-12deg); }
    .nums { display: flex; gap: 8px; }
    .num { flex: 1; min-width: 0; text-align: center; padding: 6px 4px 5px; border-radius: 12px; background: var(--card-background-color, #fff); }
    .num b { display: block; font-size: 1.7rem; line-height: 1.1; font-weight: 800; }
    .num span { display: block; font-size: .66rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--secondary-text-color); }
    .num.ok b { color: #059c75; }
    .num.bad b { color: #ef476f; }
    .num.stars b { color: #d99100; }
    .empty { text-align: center; padding: 30px 12px; color: var(--secondary-text-color); }
    .empty .big { font-size: 2.8rem; margin-bottom: 6px; }
  `;

  class AufgabenplanerOverviewCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._state = null;
      this._error = null;
      this._lang = "de";
      this._unsub = null;
      this._subscribing = false;
      this._failed = false;
      this._built = false;
      this._config = {};
    }

    setConfig(config) {
      this._config = { ...config };
      if (this._built) this._render();
    }
    getCardSize() { return 4; }
    getGridOptions() { return { columns: 12, min_columns: 6 }; }
    static getStubConfig() { return {}; }

    set hass(hass) {
      this._hass = hass;
      const lang = (hass.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
      if (lang !== this._lang) {
        this._lang = lang;
        if (this._built) this._render();
      }
      if (!this._built) {
        this._built = true;
        this.shadowRoot.innerHTML = `<style>${OV_CSS}</style><ha-card><div class="main"></div></ha-card>`;
        this._render();
      }
      if (!this._unsub && !this._subscribing && !this._failed) this._subscribe();
    }

    connectedCallback() {
      if (this._hass && !this._unsub && !this._subscribing && !this._failed) this._subscribe();
    }

    disconnectedCallback() {
      if (this._unsub) {
        try { this._unsub(); } catch (e) { /* ignore */ }
        this._unsub = null;
      }
    }

    t(key, vars) {
      let s = (LO[this._lang] || LO.de)[key] ?? LO.de[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
      return s;
    }

    _subscribe() {
      this._subscribing = true;
      this._hass.connection
        .subscribeMessage(
          (state) => {
            this._error = null;
            this._state = state;
            this._render();
          },
          { type: "aufgabenplaner/subscribe" }
        )
        .then((unsub) => {
          this._subscribing = false;
          if (this.isConnected) this._unsub = unsub;
          else unsub();
        })
        .catch((err) => {
          this._subscribing = false;
          this._failed = true;
          this._error = err && err.code === "not_loaded" ? this.t("notSetUp") : (err && err.message) || String(err);
          this._render();
        });
    }

    _render() {
      if (!this._built) return;
      const main = this.shadowRoot.querySelector(".main");
      if (this._error) {
        main.innerHTML = `<div class="empty"><div class="big">🔌</div>${esc(this._error)}</div>`;
        return;
      }
      if (!this._state) {
        main.innerHTML = `<div class="empty"><div class="big">⏳</div></div>`;
        return;
      }
      const s = this._state;
      const title = this._config.title ? `<h2>${esc(this._config.title)}</h2>` : "";
      if (!s.persons.length) {
        main.innerHTML = `${title}<div class="empty"><div class="big">⭐</div>${this.t("noPersons")}</div>`;
        return;
      }

      const today = s.today;
      const personOf = (task) => {
        if (task.assignee) return task.assignee;
        const l = s.lists.find((x) => x.id === task.list_id);
        return l && l.owner ? l.owner : null;
      };
      // Offen heute = heute fällig oder überfällig; bei Überfälligem wird die Zahl rot.
      const open = {};
      const late = {};
      let general = 0;
      let generalLate = 0;
      for (const task of s.tasks) {
        if (task.done || !task.due || task.due > today) continue;
        const pid = personOf(task);
        const over = task.due < today;
        if (pid) {
          open[pid] = (open[pid] || 0) + 1;
          if (over) late[pid] = (late[pid] || 0) + 1;
        } else {
          general++;
          if (over) generalLate++;
        }
      }
      const num = (value, cls, label) => `<div class="num ${cls}"><b>${value}</b><span>${label}</span></div>`;
      const openNum = (n, overdue) => num(n, n === 0 ? "ok" : overdue ? "bad" : "", this.t("openToday"));

      const top = [...s.persons].sort((a, b) => b.stars - a.stars)[0];
      const crown = top && top.stars > 0 && s.persons.filter((p) => p.stars === top.stars).length === 1 ? top.id : null;

      let tiles = s.persons
        .map((p) => {
          const face = p.emoji ? esc(p.emoji) : esc((p.name || "?").charAt(0).toUpperCase());
          return `<div class="tile" style="--c:${esc(p.color)}">
            ${crown === p.id ? '<span class="crown">👑</span>' : ""}
            <div class="head"><span class="av">${face}</span><span class="nm">${esc(p.name)}</span></div>
            <div class="nums">${openNum(open[p.id] || 0, late[p.id])}${num(fmtStars(p.stars, this._lang), "stars", "★ " + this.t("stars"))}</div>
          </div>`;
        })
        .join("");

      if (this._config.show_general !== false) {
        tiles += `<div class="tile" style="--c:var(--primary-color)">
          <div class="head"><span class="av" style="--c:var(--primary-color)">🏠</span><span class="nm">${this.t("general")}</span></div>
          <div class="nums">${openNum(general, generalLate)}</div>
        </div>`;
      }
      main.innerHTML = `${title}<div class="grid">${tiles}</div>`;
    }
  }

  customElements.define("aufgabenplaner-card", AufgabenplanerCard);
  customElements.define("aufgabenplaner-overview-card", AufgabenplanerOverviewCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "aufgabenplaner-overview-card",
    name: "Aufgabenplaner Übersicht",
    description: "Nur Namen, Sterne und die heute fälligen Aufgaben je Person plus allgemeine Aufgaben.",
    preview: false,
  });
  window.customCards.push({
    type: "aufgabenplaner-card",
    name: "Aufgabenplaner",
    description: "Aufgaben mit Sternen, Wiederholungen und mehreren Listen für die ganze Familie.",
    preview: false,
  });
  console.info(`%c AUFGABENPLANER %c v${CARD_VERSION} `, "background:#ffb703;color:#000;font-weight:700", "background:#222;color:#fff");
})();
