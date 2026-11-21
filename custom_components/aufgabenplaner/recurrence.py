"""Berechnung wiederkehrender Termine (ohne Home-Assistant-Abhängigkeiten).

Eine Wiederholung ist ein Dict:
  {"type": "daily",   "interval": n}
  {"type": "weekly",  "interval": n, "days": [0..6]}   # 0 = Montag ... 6 = Sonntag
  {"type": "monthly", "interval": n, "day": 1..31}
"""
from __future__ import annotations

import calendar
from datetime import date, timedelta
from typing import Any


def _clamp_day(year: int, month: int, day: int) -> date:
    """Tag im Monat begrenzen (31. im April -> 30.)."""
    return date(year, month, min(day, calendar.monthrange(year, month)[1]))


def _add_months(year: int, month: int, n: int) -> tuple[int, int]:
    idx = year * 12 + (month - 1) + n
    return idx // 12, idx % 12 + 1


def normalize_recurrence(rec: dict[str, Any] | None) -> dict[str, Any] | None:
    """Wiederholung prüfen und in eine saubere Form bringen."""
    if not rec:
        return None
    kind = rec.get("type")
    interval = max(1, min(52, int(rec.get("interval") or 1)))
    if kind == "daily":
        return {"type": "daily", "interval": interval}
    if kind == "weekly":
        days = sorted({int(d) for d in rec.get("days", []) if 0 <= int(d) <= 6})
        if not days:
            raise ValueError("weekdays_required")
        return {"type": "weekly", "interval": interval, "days": days}
    if kind == "monthly":
        day = int(rec.get("day") or 0)
        if not 1 <= day <= 31:
            raise ValueError("day_required")
        return {"type": "monthly", "interval": interval, "day": day}
    raise ValueError("invalid_recurrence")


def next_due(rec: dict[str, Any], after: date, first: bool = False) -> date:
    """Nächster Termin, der strikt nach `after` liegt.

    Mit first=True wird das Intervall ignoriert (für den allerersten Termin).
    """
    interval = 1 if first else max(1, int(rec.get("interval", 1)))
    kind = rec["type"]

    if kind == "daily":
        return after + timedelta(days=interval)

    if kind == "weekly":
        days = sorted(set(rec["days"]))
        weekday = after.weekday()
        week_start = after - timedelta(days=weekday)
        for d in days:
            if d > weekday:
                return week_start + timedelta(days=d)
        return week_start + timedelta(days=7 * interval + days[0])

    if kind == "monthly":
        day = int(rec["day"])
        candidate = _clamp_day(after.year, after.month, day)
        if candidate > after:
            return candidate
        year, month = _add_months(after.year, after.month, interval)
        return _clamp_day(year, month, day)

    raise ValueError("invalid_recurrence")


def first_due(rec: dict[str, Any], today: date) -> date:
    """Erster Termin an oder nach `today`."""
    return next_due(rec, today - timedelta(days=1), first=True)
