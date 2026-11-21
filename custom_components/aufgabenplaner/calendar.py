"""Kalender: offene Aufgaben mit Fälligkeit, je Liste und gesamt."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Any

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import CAL_ALL, CAL_PREFIX, DOMAIN, HUB_ID, SIGNAL_UPDATED
from .manager import PlannerManager

LOOKAHEAD_DAYS = 90


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager: PlannerManager = hass.data[DOMAIN]["manager"]
    known: set[str] = set()

    @callback
    def _add_new() -> None:
        new: list[PlannerCalendar] = []
        if CAL_ALL not in known:
            known.add(CAL_ALL)
            new.append(PlannerCalendar(manager, None))
        for lst in manager.planner.lists:
            if lst["id"] not in known:
                known.add(lst["id"])
                new.append(PlannerCalendar(manager, lst["id"]))
        if new:
            async_add_entities(new)

    _add_new()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_UPDATED, _add_new))


class PlannerCalendar(CalendarEntity):
    """Kalender mit den Fälligkeiten einer Liste (oder aller Listen)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:format-list-checks"

    def __init__(self, manager: PlannerManager, list_id: str | None) -> None:
        self._manager = manager
        self._list_id = list_id
        self._attr_unique_id = f"{CAL_PREFIX}{list_id or CAL_ALL}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, HUB_ID)},
            name="Aufgabenplaner",
            manufacturer="Aufgabenplaner",
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_UPDATED, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()

    @property
    def name(self) -> str:
        if self._list_id is None:
            return "Alle Aufgaben"
        lst = self._manager.planner.get_list(self._list_id)
        return lst["name"] if lst else self._list_id

    @property
    def available(self) -> bool:
        return self._list_id is None or self._manager.planner.get_list(self._list_id) is not None

    def _events(self, start: date, end: date) -> list[CalendarEvent]:
        events: list[CalendarEvent] = []
        for occ in self._manager.planner.calendar_occurrences(start, end, self._list_id):
            day: date = occ["date"]
            summary = occ["title"] + (f" ({occ['person']})" if occ["person"] else "")
            parts: list[str] = []
            if occ["stars"]:
                parts.append(f"★ {occ['stars']}")
            if occ["list"]:
                parts.append(f"Liste: {occ['list']}")
            if occ["person"]:
                parts.append(f"Zuständig: {occ['person']}")
            events.append(
                CalendarEvent(
                    start=day,
                    end=day + timedelta(days=1),
                    summary=summary,
                    description=" · ".join(parts) or None,
                    uid=f"{occ['task']}-{day.isoformat()}",
                )
            )
        return events

    @property
    def event(self) -> CalendarEvent | None:
        """Nächster anstehender Termin (heute oder später)."""
        today = self._manager.planner.today()
        events = self._events(today, today + timedelta(days=LOOKAHEAD_DAYS))
        return events[0] if events else None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        start = dt_util.as_local(start_date).date()
        end_local = dt_util.as_local(end_date)
        end = end_local.date()
        if end_local.time() != time(0):
            end += timedelta(days=1)
        return self._events(start, end)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"list_id": self._list_id}
