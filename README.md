# Aufgabenplaner für Home Assistant

Ein Familien-Aufgabenplaner mit Sternen, Wiederholungen und mehreren Listen, inklusive Dashboard-Karte.

## Funktionen

- **Mehrere Personen** mit Emoji und Farbe, jede bekommt automatisch eine persönliche Liste
- **Sterne** pro Aufgabe: Wer eine Aufgabe erledigt, bekommt die Sterne gutgeschrieben (mit kleiner Animation)
- **Wiederholungen**: täglich, wöchentlich (beliebige Wochentage, z. B. „jeden Sonntag gießen"), monatlich, jeweils auch „alle n …"
- **Mehrere Listen**: gemeinsame Listen und persönliche Listen
- **Ansicht „Heute"** über alle Listen, Überfälliges wird hervorgehoben
- **Rückgängig** für Erledigungen, **Sterne einlösen** über „Sterne anpassen"
- Sensoren je Person (`sensor.<name>_sterne`) und `sensor.aufgabenplaner_heute_offen`
- Ereignis `aufgabenplaner_task_completed` für Automationen

## Installation

1. Ordner `custom_components/aufgabenplaner` in dein Home-Assistant-Konfigurationsverzeichnis kopieren
   (dorthin, wo auch `configuration.yaml` liegt, also z. B. `/config/custom_components/aufgabenplaner`).
2. Home Assistant neu starten.
3. **Einstellungen → Geräte & Dienste → Integration hinzufügen → „Aufgabenplaner"**.
4. Dashboard bearbeiten → Karte hinzufügen → **„Aufgabenplaner"** wählen (oder per YAML):

```yaml
type: custom:aufgabenplaner-card
title: Aufgabenplaner   # optional
hide_upcoming: true     # optional: „Demnächst" standardmäßig eingeklappt
```

In der Listenansicht lässt sich der Bereich „Demnächst" per Tipp auf die Überschrift ein- und ausklappen.
Die Auswahl wird pro Browser gemerkt.

Die Karte wird von der Integration automatisch geladen, eine Ressource muss nicht extra eingetragen werden.
Nach einem Update ggf. den Browser-Cache leeren (Strg+F5).

Über das Zahnrad in der Karte legst du Personen und Listen an.

## Gemeinsam erledigen (Sterne teilen)

Haben mehrere Personen eine Aufgabe zusammen gemacht, tippst du an der Aufgabe auf das Symbol „Gemeinsam
erledigt" (Personen mit Plus, links neben dem Avatar). Dann wählst du alle Beteiligten aus und bestätigst.
Die Sterne der Aufgabe werden **gleichmäßig geteilt, in 0,5er-Schritten**:

| Aufgabe | Personen | Je Person |
| --- | --- | --- |
| 2 ★ | 2 | 1 |
| 3 ★ | 2 | 1,5 |
| 1 ★ | 2 | 0,5 |
| 1 ★ | 3 | 0,5 |

Gerundet wird auf den nächsten halben Stern (ab 0,25 nach oben). Der Sternestand kann dadurch halbe Werte
haben (z. B. 27,5). Im Protokoll steht bei geteilten Erledigungen „geteilt durch 2"; „Rückgängig" nimmt die
Erledigung für alle Beteiligten zurück. Ohne das Symbol, also mit einem Tipp auf den Kreis, funktioniert alles
wie bisher. Bei einer Aufgabe ohne Zuständigen kannst du im Namens-Dialog auch „Mehrere Personen" wählen.

Per Dienst: `aufgabenplaner.complete_task` akzeptiert bei `person` auch mehrere Namen.
Das Ereignis `aufgabenplaner_task_completed` wird je beteiligter Person ausgelöst und enthält zusätzlich
`shared_with` (Anzahl der Beteiligten).

## Übersichtskarte

Zusätzlich gibt es eine zweite, nur lesende Karte, z. B. für ein Wand-Tablet: Sie ist bewusst kompakt: je Person nur
der **Name**, die **Anzahl offener Aufgaben heute** (inkl. überfälliger; grün bei 0, rot wenn etwas überfällig ist)
und die **Sterne** – jeweils als Zahl, ohne einzelne Aufgaben. Eine Kachel „Allgemein" zeigt nur die Anzahl offener
Aufgaben ohne Zuständigen. Die Karte „Aufgabenplaner" bleibt unverändert.

```yaml
type: custom:aufgabenplaner-overview-card
title: Heute im Haus     # optional
show_general: true       # optional: false blendet die Kachel „Allgemein" aus
```

Im Karten-Dialog erscheint sie als „Aufgabenplaner Übersicht".

## Datensicherung

In den Einstellungen (Zahnrad) sind die Bereiche Personen, Listen, Sterne anpassen und Datensicherung standardmäßig eingeklappt und lassen sich per Tipp aufklappen. Dort gibt es den Abschnitt **Datensicherung**: „Sicherung exportieren" speichert alle
Daten (Personen, Listen, Aufgaben, Vorlagen, Sterne samt Verlauf) als JSON-Datei. „Sicherung importieren" spielt
eine solche Datei wieder ein und **ersetzt dabei alle aktuellen Daten** (nur Administratoren). Die Datei wird vor
dem Import geprüft; ist sie ungültig, bleibt alles unverändert. Verknüpfungen zu Home-Assistant-Benutzern bleiben
erhalten, sollten dort aber auf demselben System gültig sein.

## Aufgaben wegwischen

Eine offene Aufgabe lässt sich nach links oder rechts **wegwischen**. Einmalige Aufgaben werden dadurch gelöscht.
Bei wiederkehrenden Aufgaben entfällt nur der aktuelle Termin (ohne Sterne): Die Aufgabe springt zum nächsten
regulären Termin, alle künftigen Wiederholungen bleiben bestehen.

## Symbole für Aufgaben

Im Aufgaben- und im Vorlagen-Formular öffnet „Symbol wählen" eine Auswahl mit 56 kleinen Symbolen
(z. B. Gießkanne, Staubsauger, Müll, Geschirrspüler). Das Symbol erscheint als kleines Abzeichen vor der Aufgabe.
Per Dienst `aufgabenplaner.add_task` geht es mit `icon: watering-can` (Material-Design-Icon-Name).
Die Symbole stammen von Material Design Icons (Apache-2.0).

## Vorlagen für wiederkehrende Aufgaben

Das Listen-Symbol links neben dem Zahnrad öffnet die **Vorlagen**: Hier speicherst du Aufgaben, die immer wieder
vorkommen (z. B. Gießen, Staubsaugen), samt Sternen und optional einer Wiederholung. Vorlagen lassen sich
hinzufügen, bearbeiten und löschen. Tippst du auf eine Vorlage, öffnet sich das Aufgaben-Formular schon
ausgefüllt, du wählst nur noch Liste, Person und Datum.

## Icon

Das Icon (Ordner `brand/`) erscheint unter Einstellungen → Geräte & Dienste. Eigene Marken-Bilder in
Custom Integrations unterstützt Home Assistant ab Version 2026.3. Falls noch das alte Platzhalter-Bild zu sehen
ist, hilft ein harter Browser-Reload (Strg+F5).

## Benutzer erkennen (Handy) und gemeinsames Tablet

- **Persönlich:** Im Zahnrad → Person bearbeiten wählst du den **Home-Assistant-Benutzer** dieser Person
  (das Feld sehen nur Administratoren). Wer mit diesem Benutzer eingeloggt ist, wird erkannt: Die Karte
  startet mit seiner Ansicht, und abgehakte Aufgaben ohne feste Zuständigkeit gehen automatisch an ihn.
- **Gemeinsam (Tablet im Wohnzimmer):** Ein Benutzer, der **keiner** Person zugeordnet ist (z. B. ein eigener
  Benutzer „Wohnzimmer"), bekommt die allgemeine Ansicht mit allen Personen. Beim Abhaken einer Aufgabe ohne
  Zuständigen fragt die Karte „Wer hat es erledigt?". Wählt jemand oben seinen Namen, springt die Auswahl nach
  einer Minute ohne Bedienung wieder auf „Alle" zurück.
- `shared: true` in der Karten-YAML erzwingt die gemeinsame Ansicht auch für einen verknüpften Benutzer.

## Kalender

Die Integration legt Kalender an, die du im Home-Assistant-Kalender (Seitenleiste → Kalender) einblenden kannst:
`calendar.aufgabenplaner_alle_aufgaben` sowie je einen Kalender pro Liste. Aufgaben mit Fälligkeit erscheinen
als Ganztagstermine, Wiederholungen (z. B. jeden Sonntag) werden für den angezeigten Zeitraum aufgelöst.
Erledigte Einmal-Aufgaben verschwinden daraus.

## Dienste

| Dienst | Zweck |
| --- | --- |
| `aufgabenplaner.add_task` | Aufgabe anlegen (optional mit Wiederholung) |
| `aufgabenplaner.complete_task` | Aufgabe per Titel abhaken |
| `aufgabenplaner.adjust_stars` | Sterne zu- oder abbuchen |

Beispiel: jeden Sonntag gießen, 3 Sterne, egal wer.

```yaml
action: aufgabenplaner.add_task
data:
  title: Blumen gießen
  stars: 3
  repeat: weekly
  weekdays: [sun]
```

## Automation-Beispiel

```yaml
automation:
  - alias: Sterne feiern
    triggers:
      - trigger: event
        event_type: aufgabenplaner_task_completed
    actions:
      - action: notify.notify
        data:
          message: "{{ trigger.event.data.person }} hat „{{ trigger.event.data.task }}“ erledigt (+{{ trigger.event.data.stars }} ★, gesamt {{ trigger.event.data.total_stars }})"
```

## Hinweise

- Alle Daten liegen lokal in `.storage/aufgabenplaner.data`.
- Erledigte Einmal-Aufgaben werden nach 14 Tagen aufgeräumt, das Protokoll nach 90 Tagen.
- Wird eine wiederkehrende Aufgabe zu spät erledigt, springt sie zum nächsten regulären Termin (kein Aufholen).
