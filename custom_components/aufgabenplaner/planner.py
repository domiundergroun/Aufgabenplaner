"""Reine Python-Logik des Aufgabenplaners (ohne Home-Assistant-Abhängigkeiten)."""
from __future__ import annotations

import math
import re
import uuid
from collections.abc import Callable
from datetime import date, datetime, timedelta
from typing import Any

from .recurrence import first_due, next_due, normalize_recurrence

COLORS = [
    "#ef476f",
    "#f78c6b",
    "#ffb703",
    "#06d6a0",
    "#118ab2",
    "#7b5ea7",
    "#ec6ca8",
    "#4cc9f0",
]
MAX_STARS = 20
LEDGER_KEEP_DAYS = 90
DONE_KEEP_DAYS = 14


class PlannerError(Exception):
    """Fehler mit maschinenlesbarem Code."""

    def __init__(self, code: str, message: str | None = None) -> None:
        super().__init__(message or code)
        self.code = code


def _new_id() -> str:
    return uuid.uuid4().hex[:8]


_ICON_RE = re.compile(r"[a-z0-9-]{1,40}")


def _clean_icon(value: Any) -> str:
    """Symbol-Schlüssel (z. B. "watering-can"); leer = kein Symbol."""
    icon = str(value or "").strip()
    if icon and not _ICON_RE.fullmatch(icon):
        raise PlannerError("invalid_icon")
    return icon


def _num(value: float) -> int | float:
    """Sterne in 0,5er-Schritten; ganze Zahlen als int (1 statt 1.0)."""
    value = round(float(value) * 2) / 2
    return int(value) if value == int(value) else value


def split_stars(total: int | float, people: int) -> int | float:
    """Sterne gleichmäßig auf `people` Personen teilen, auf 0,5 gerundet (ab .25 aufgerundet).

    2 Sterne / 2 = 1, 3 / 2 = 1,5, 1 / 2 = 0,5, 1 / 3 = 0,5.
    """
    if people <= 1:
        return _num(total)
    return _num(math.floor(total / people * 2 + 0.5) / 2)


class Planner:
    """Personen, Listen, Aufgaben und Sternekonto."""

    def __init__(
        self,
        data: dict[str, Any] | None = None,
        today_fn: Callable[[], date] | None = None,
        now_fn: Callable[[], datetime] | None = None,
    ) -> None:
        data = data or {}
        self.persons: list[dict[str, Any]] = data.get("persons", [])
        self.lists: list[dict[str, Any]] = data.get("lists") or [
            {"id": "allgemein", "name": "Allgemein", "icon": "🏠", "owner": None}
        ]
        self.tasks: list[dict[str, Any]] = data.get("tasks", [])
        self.templates: list[dict[str, Any]] = data.get("templates", [])
        self.ledger: list[dict[str, Any]] = data.get("ledger", [])
        self._today_fn = today_fn or date.today
        self._now_fn = now_fn or datetime.now

    # ------------------------------------------------------------------ Basis
    def as_dict(self) -> dict[str, Any]:
        return {
            "persons": self.persons,
            "lists": self.lists,
            "tasks": self.tasks,
            "templates": self.templates,
            "ledger": self.ledger,
        }

    def today(self) -> date:
        return self._today_fn()

    # ------------------------------------------------------------ Datensicherung
    BACKUP_APP = "aufgabenplaner"
    BACKUP_FORMAT = 1

    def export_data(self) -> dict[str, Any]:
        """Alle Daten als Sicherung (JSON-tauglich)."""
        import copy

        return {
            "app": self.BACKUP_APP,
            "format": self.BACKUP_FORMAT,
            "exported_at": self.now_iso(),
            "data": copy.deepcopy(self.as_dict()),
        }

    def import_data(self, backup: Any) -> dict[str, int]:
        """Sicherung einspielen und dabei ALLE bisherigen Daten ersetzen. Prüft die Struktur vorher."""
        import copy

        def bad(msg: str) -> PlannerError:
            return PlannerError("invalid_backup", msg)

        if not isinstance(backup, dict) or backup.get("app") != self.BACKUP_APP:
            raise bad("Das ist keine Aufgabenplaner-Sicherung")
        if not isinstance(backup.get("format"), int) or backup["format"] > self.BACKUP_FORMAT:
            raise bad("Unbekanntes oder zu neues Sicherungsformat")
        data = backup.get("data")
        if not isinstance(data, dict):
            raise bad("Sicherung enthält keine Daten")

        def rows(key: str, required: tuple[str, ...]) -> list[dict[str, Any]]:
            items = data.get(key, [])
            if not isinstance(items, list):
                raise bad(f"„{key}“ ist ungültig")
            out = []
            for item in items:
                if not isinstance(item, dict) or any(
                    not isinstance(item.get(r), str) or not item.get(r) for r in required
                ):
                    raise bad(f"Ungültiger Eintrag in „{key}“")
                out.append(copy.deepcopy(item))
            return out

        persons = rows("persons", ("id", "name"))
        lists = rows("lists", ("id", "name")) or [
            {"id": "allgemein", "name": "Allgemein", "icon": "🏠", "owner": None}
        ]
        tasks = rows("tasks", ("id", "title", "list_id"))
        templates = rows("templates", ("id", "title"))
        ledger = rows("ledger", ("id", "person", "at"))

        person_ids = {p["id"] for p in persons}
        list_ids = {l["id"] for l in lists}
        for l in lists:
            if l.get("owner") not in person_ids:
                l["owner"] = None
        tasks = [t for t in tasks if t["list_id"] in list_ids]
        for t in tasks:
            if t.get("assignee") not in person_ids:
                t["assignee"] = None
            t["icon"] = _clean_icon(t.get("icon"))
        for t in templates:
            t["icon"] = _clean_icon(t.get("icon"))
        ledger = [e for e in ledger if e["person"] in person_ids]

        self.persons[:] = persons
        self.lists[:] = lists
        self.tasks[:] = tasks
        self.templates[:] = templates
        self.ledger[:] = ledger
        return {
            "persons": len(persons),
            "lists": len(lists),
            "tasks": len(tasks),
            "templates": len(templates),
        }

    def now_iso(self) -> str:
        return self._now_fn().isoformat(timespec="seconds")

    def get_person(self, pid: str | None) -> dict[str, Any] | None:
        return next((p for p in self.persons if p["id"] == pid), None)

    def get_list(self, lid: str | None) -> dict[str, Any] | None:
        return next((l for l in self.lists if l["id"] == lid), None)

    def get_task(self, tid: str | None) -> dict[str, Any] | None:
        return next((t for t in self.tasks if t["id"] == tid), None)

    def _require_person(self, pid: str | None) -> dict[str, Any]:
        person = self.get_person(pid)
        if person is None:
            raise PlannerError("person_not_found")
        return person

    # Suche per Name (für Dienste/Automationen)
    def find_person(self, name: str) -> dict[str, Any] | None:
        key = name.strip().casefold()
        return next((p for p in self.persons if p["name"].casefold() == key), None)

    def find_list(self, name: str) -> dict[str, Any] | None:
        key = name.strip().casefold()
        return next((l for l in self.lists if l["name"].casefold() == key), None)

    def find_task(self, title: str, list_id: str | None = None) -> dict[str, Any] | None:
        key = title.strip().casefold()
        return next(
            (
                t
                for t in self.tasks
                if not t.get("done")
                and t["title"].casefold() == key
                and (list_id is None or t["list_id"] == list_id)
            ),
            None,
        )

    # --------------------------------------------------------------- Personen
    def save_person(self, data: dict[str, Any]) -> dict[str, Any]:
        name = str(data.get("name", "")).strip()
        if not name:
            raise PlannerError("name_required")
        emoji = str(data.get("emoji") or "").strip()
        color = data.get("color")
        user_id = data.get("user_id") or None
        if user_id and any(
            p.get("user_id") == user_id and p["id"] != data.get("id") for p in self.persons
        ):
            raise PlannerError(
                "user_already_linked",
                "Dieser Benutzer ist schon mit einer anderen Person verknüpft.",
            )

        if data.get("id"):
            person = self._require_person(data["id"])
            old_name = person["name"]
            person["name"] = name
            person["emoji"] = emoji
            if "user_id" in data:  # ohne Angabe bleibt die Verknüpfung unverändert
                person["user_id"] = user_id
            if color:
                person["color"] = color
            for lst in self.lists:
                if lst.get("owner") == person["id"] and lst.get("auto") and lst["name"] == old_name:
                    lst["name"] = name
                    lst["icon"] = emoji or "👤"
            return person

        person = {
            "id": _new_id(),
            "name": name,
            "emoji": emoji,
            "color": color or COLORS[len(self.persons) % len(COLORS)],
            "stars": 0,
            "user_id": user_id,
        }
        self.persons.append(person)
        # Jede Person bekommt automatisch eine persönliche Liste.
        self.lists.append(
            {
                "id": _new_id(),
                "name": name,
                "icon": emoji or "👤",
                "owner": person["id"],
                "auto": True,
            }
        )
        return person

    def delete_person(self, pid: str) -> None:
        person = self._require_person(pid)
        own_lists = {l["id"] for l in self.lists if l.get("owner") == pid}
        self.lists = [l for l in self.lists if l["id"] not in own_lists]
        self.tasks = [t for t in self.tasks if t["list_id"] not in own_lists]
        for task in self.tasks:
            if task.get("assignee") == pid:
                task["assignee"] = None
        self.ledger = [e for e in self.ledger if e["person"] != pid]
        self.persons.remove(person)
        if not self.lists:
            self.lists.append({"id": _new_id(), "name": "Allgemein", "icon": "🏠", "owner": None})

    # ----------------------------------------------------------------- Listen
    def save_list(self, data: dict[str, Any]) -> dict[str, Any]:
        name = str(data.get("name", "")).strip()
        if not name:
            raise PlannerError("name_required")
        icon = str(data.get("icon") or "").strip() or "📝"
        owner = data.get("owner") or None
        if owner:
            self._require_person(owner)

        if data.get("id"):
            lst = self.get_list(data["id"])
            if lst is None:
                raise PlannerError("list_not_found")
            lst.update(name=name, icon=icon, owner=owner)
            lst.pop("auto", None)
            if owner:
                for task in self.tasks:
                    if task["list_id"] == lst["id"]:
                        task["assignee"] = owner
            return lst

        lst = {"id": _new_id(), "name": name, "icon": icon, "owner": owner}
        self.lists.append(lst)
        return lst

    def delete_list(self, lid: str) -> None:
        lst = self.get_list(lid)
        if lst is None:
            raise PlannerError("list_not_found")
        if len(self.lists) <= 1:
            raise PlannerError("last_list")
        self.lists.remove(lst)
        self.tasks = [t for t in self.tasks if t["list_id"] != lid]

    # --------------------------------------------------------------- Aufgaben
    def save_task(self, data: dict[str, Any]) -> dict[str, Any]:
        title = str(data.get("title", "")).strip()
        if not title:
            raise PlannerError("title_required")
        lst = self.get_list(data.get("list_id"))
        if lst is None:
            raise PlannerError("list_not_found")
        stars = int(data.get("stars", 1))
        if not 0 <= stars <= MAX_STARS:
            raise PlannerError("invalid_stars")
        icon = _clean_icon(data.get("icon"))

        assignee = lst.get("owner") or data.get("assignee") or None
        if assignee:
            self._require_person(assignee)

        due = data.get("due") or None
        if due:
            try:
                date.fromisoformat(due)
            except ValueError as err:
                raise PlannerError("invalid_date") from err

        try:
            recurrence = normalize_recurrence(data.get("recurrence"))
        except ValueError as err:
            raise PlannerError(str(err)) from err
        if recurrence and not due:
            due = first_due(recurrence, self.today()).isoformat()

        if data.get("id"):
            task = self.get_task(data["id"])
            if task is None:
                raise PlannerError("task_not_found")
            task.update(
                title=title,
                list_id=lst["id"],
                stars=stars,
                icon=icon,
                assignee=assignee,
                due=due,
                recurrence=recurrence,
            )
            return task

        task = {
            "id": _new_id(),
            "title": title,
            "list_id": lst["id"],
            "stars": stars,
            "icon": icon,
            "assignee": assignee,
            "due": due,
            "recurrence": recurrence,
            "done": False,
            "created": self.now_iso(),
        }
        self.tasks.append(task)
        return task

    def delete_task(self, tid: str) -> None:
        task = self.get_task(tid)
        if task is None:
            raise PlannerError("task_not_found")
        self.tasks.remove(task)

    def skip_task(self, tid: str) -> dict[str, Any]:
        """Wiederkehrende Aufgabe nur für dieses Mal entfernen: ohne Sterne zum nächsten Termin springen."""
        task = self.get_task(tid)
        if task is None:
            raise PlannerError("task_not_found")
        recurrence = task.get("recurrence")
        if not recurrence:
            raise PlannerError("not_recurring")
        prev_due = task.get("due")
        base = max(date.fromisoformat(prev_due), self.today()) if prev_due else self.today()
        task["due"] = next_due(recurrence, base).isoformat()
        task.pop("last_completion", None)
        return task

    def complete_task(
        self, task_id: str, person_ids: str | list[str] | None = None
    ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        """Aufgabe erledigen und die Sterne gutschreiben.

        Erledigen mehrere Personen sie gemeinsam, wird der Sternewert gleichmäßig geteilt
        (in 0,5er-Schritten). Gibt (Einträge, Aufgabe) zurück, ein Eintrag je Person.
        """
        task = self.get_task(task_id)
        if task is None:
            raise PlannerError("task_not_found")
        if task.get("done"):
            raise PlannerError("already_done")

        if isinstance(person_ids, str):
            person_ids = [person_ids]
        ids = list(dict.fromkeys(p for p in (person_ids or []) if p))
        if not ids:
            lst = self.get_list(task["list_id"]) or {}
            fallback = task.get("assignee") or lst.get("owner")
            ids = [fallback] if fallback else []
        if not ids:
            raise PlannerError("person_required")
        people = [self._require_person(pid) for pid in ids]

        today = self.today()
        share = split_stars(int(task.get("stars", 0)), len(people))
        group = _new_id()
        at = self.now_iso()
        entries: list[dict[str, Any]] = []
        for person in people:
            entry = {
                "id": _new_id(),
                "group": group,
                "split": len(people),
                "person": person["id"],
                "stars": share,
                "title": task["title"],
                "task": task["id"],
                "list": task["list_id"],
                "at": at,
            }
            self.ledger.append(entry)
            entries.append(entry)
            person["stars"] = _num(float(person.get("stars", 0)) + share)

        prev_due = task.get("due")
        recurrence = task.get("recurrence")
        if recurrence:
            # Basis: später von (Fälligkeit, heute) -> keine Aufholjagd bei Überfälligem,
            # und vorzeitiges Erledigen springt trotzdem zum nächsten echten Termin.
            base = max(date.fromisoformat(prev_due), today) if prev_due else today
            task["due"] = next_due(recurrence, base).isoformat()
        else:
            task["done"] = True
            task["done_at"] = at
            task["done_by"] = ids[0]
        task["last_completion"] = {"group": group, "prev_due": prev_due}
        return entries, task

    def undo_entry(self, entry_id: str) -> None:
        """Erledigung (bei gemeinsamer Erledigung für alle Beteiligten) oder Sternanpassung zurücknehmen."""
        entry = next((e for e in self.ledger if e["id"] == entry_id), None)
        if entry is None:
            raise PlannerError("entry_not_found")
        group = entry.get("group") or entry["id"]
        for item in [e for e in self.ledger if (e.get("group") or e["id"]) == group]:
            self.ledger.remove(item)
            person = self.get_person(item["person"])
            if person:
                person["stars"] = _num(max(0.0, float(person.get("stars", 0)) - float(item["stars"])))

        task = self.get_task(entry.get("task")) if entry.get("task") else None
        last_done = task.get("last_completion") if task else None
        # Ältere Daten kennen nur "entry" statt "group".
        if task and last_done and (last_done.get("group") or last_done.get("entry")) == group:
            last = task.pop("last_completion")
            if task.get("recurrence"):
                task["due"] = last.get("prev_due")
            else:
                task["done"] = False
                task.pop("done_at", None)
                task.pop("done_by", None)

    def adjust_stars(self, person_id: str, amount: int, reason: str = "") -> dict[str, Any]:
        person = self._require_person(person_id)
        if not amount:
            raise PlannerError("amount_required")
        old = float(person.get("stars", 0))
        new = max(0.0, old + int(amount))
        actual = _num(new - old)
        person["stars"] = _num(new)
        entry = {
            "id": _new_id(),
            "person": person_id,
            "stars": actual,
            "title": reason.strip(),
            "task": None,
            "list": None,
            "adjust": True,
            "at": self.now_iso(),
        }
        self.ledger.append(entry)
        return entry

    # -------------------------------------------------------------- Aufräumen
    def midnight_cleanup(self) -> None:
        today = self.today()
        done_cutoff = (today - timedelta(days=DONE_KEEP_DAYS)).isoformat()
        ledger_cutoff = (today - timedelta(days=LEDGER_KEEP_DAYS)).isoformat()
        self.tasks = [
            t
            for t in self.tasks
            if not (t.get("done") and not t.get("recurrence") and t.get("done_at", "9999")[:10] < done_cutoff)
        ]
        self.ledger = [e for e in self.ledger if e["at"][:10] >= ledger_cutoff]

    # ------------------------------------------------------------- Auswertung
    # --------------------------------------------------------------- Vorlagen
    def save_template(self, data: dict[str, Any]) -> dict[str, Any]:
        """Vorlage für häufige Aufgaben (Titel, Sterne, optional Wiederholung)."""
        title = str(data.get("title", "")).strip()
        if not title:
            raise PlannerError("title_required")
        stars = int(data.get("stars", 1))
        if not 0 <= stars <= MAX_STARS:
            raise PlannerError("invalid_stars")
        icon = _clean_icon(data.get("icon"))
        try:
            recurrence = normalize_recurrence(data.get("recurrence"))
        except ValueError as err:
            raise PlannerError(str(err)) from err

        if data.get("id"):
            tpl = next((t for t in self.templates if t["id"] == data["id"]), None)
            if tpl is None:
                raise PlannerError("template_not_found")
            tpl.update(title=title, stars=stars, icon=icon, recurrence=recurrence)
            return tpl

        tpl = {"id": _new_id(), "title": title, "stars": stars, "icon": icon, "recurrence": recurrence}
        self.templates.append(tpl)
        return tpl

    def delete_template(self, tid: str) -> None:
        tpl = next((t for t in self.templates if t["id"] == tid), None)
        if tpl is None:
            raise PlannerError("template_not_found")
        self.templates.remove(tpl)

    def person_for_user(self, user_id: str | None) -> dict[str, Any] | None:
        """Person, die mit diesem Home-Assistant-Benutzer verknüpft ist."""
        if not user_id:
            return None
        return next((p for p in self.persons if p.get("user_id") == user_id), None)

    def calendar_occurrences(
        self,
        start: date,
        end: date,
        list_id: str | None = None,
        max_steps: int = 800,
    ) -> list[dict[str, Any]]:
        """Alle Termine offener Aufgaben im Zeitraum [start, end) inkl. Wiederholungen."""
        result: list[dict[str, Any]] = []
        for task in self.tasks:
            if task.get("done") or not task.get("due"):
                continue
            if list_id and task["list_id"] != list_id:
                continue
            lst = self.get_list(task["list_id"]) or {}
            person = self.get_person(self._task_person(task))
            rec = task.get("recurrence")
            day = date.fromisoformat(task["due"])
            steps = 0
            while day < end and steps < max_steps:
                if day >= start:
                    result.append(
                        {
                            "date": day,
                            "title": task["title"],
                            "task": task["id"],
                            "list": lst.get("name"),
                            "person": person["name"] if person else None,
                            "stars": int(task.get("stars", 0)),
                        }
                    )
                if not rec:
                    break
                day = next_due(rec, day)
                steps += 1
        result.sort(key=lambda o: (o["date"], o["title"].casefold()))
        return result

    def snapshot(self) -> dict[str, Any]:
        today = self.today()
        since = (today - timedelta(days=7)).isoformat()
        recent = [e for e in reversed(self.ledger) if e["at"][:10] >= since][:80]
        return {
            "today": today.isoformat(),
            "persons": self.persons,
            "lists": self.lists,
            "tasks": self.tasks,
            "templates": self.templates,
            "ledger": recent,
        }

    def _task_person(self, task: dict[str, Any]) -> str | None:
        if task.get("assignee"):
            return task["assignee"]
        lst = self.get_list(task["list_id"])
        return lst.get("owner") if lst else None

    def person_stats(self, pid: str) -> dict[str, int]:
        today = self.today().isoformat()
        open_today = overdue = 0
        for task in self.tasks:
            if task.get("done") or not task.get("due") or self._task_person(task) != pid:
                continue
            if task["due"] < today:
                overdue += 1
            if task["due"] <= today:
                open_today += 1
        done_today = sum(
            1
            for e in self.ledger
            if e["person"] == pid and e.get("task") and e["at"][:10] == today
        )
        ranking = sorted(self.persons, key=lambda p: -float(p.get("stars", 0)))
        rank = next((i + 1 for i, p in enumerate(ranking) if p["id"] == pid), 0)
        return {
            "open_today": open_today,
            "overdue": overdue,
            "done_today": done_today,
            "rank": rank,
        }

    def open_today(self) -> list[dict[str, Any]]:
        today = self.today().isoformat()
        result = []
        for task in self.tasks:
            if task.get("done") or not task.get("due") or task["due"] > today:
                continue
            pid = self._task_person(task)
            person = self.get_person(pid)
            lst = self.get_list(task["list_id"])
            result.append(
                {
                    "title": task["title"],
                    "list": lst["name"] if lst else None,
                    "person": person["name"] if person else None,
                    "stars": task.get("stars", 0),
                    "due": task["due"],
                }
            )
        return result
