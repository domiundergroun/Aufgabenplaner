"""Verbindet die Planner-Logik mit Home Assistant (Speicher, Signale, Registry)."""
from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CAL_ALL,
    CAL_PREFIX,
    DOMAIN,
    EVENT_TASK_COMPLETED,
    HUB_ID,
    SAVE_DELAY,
    SIGNAL_UPDATED,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .planner import Planner


class PlannerManager:
    """Hält den Planner, speichert ihn und meldet Änderungen."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self.hass = hass
        self.entry_id = entry_id
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.planner = self._new_planner(None)

    @staticmethod
    def _new_planner(data: dict[str, Any] | None) -> Planner:
        return Planner(data, today_fn=lambda: dt_util.now().date(), now_fn=dt_util.now)

    async def async_load(self) -> None:
        self.planner = self._new_planner(await self._store.async_load())

    async def async_flush(self) -> None:
        await self._store.async_save(self.planner.as_dict())

    @callback
    def changed(self) -> None:
        """Nach jeder Änderung: speichern, Registry abgleichen, Oberfläche informieren."""
        self._store.async_delay_save(self.planner.as_dict, SAVE_DELAY)
        self._sync_registry()
        async_dispatcher_send(self.hass, SIGNAL_UPDATED)

    def mutate(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        result = func(*args, **kwargs)
        self.changed()
        return result

    def complete(
        self, task_id: str, person_ids: str | list[str] | None = None
    ) -> list[dict[str, Any]]:
        """Aufgabe erledigen; je beteiligter Person wird ein Ereignis ausgelöst."""
        entries, task = self.planner.complete_task(task_id, person_ids)
        lst = self.planner.get_list(task["list_id"]) or {}
        for entry in entries:
            person = self.planner.get_person(entry["person"]) or {}
            self.hass.bus.async_fire(
                EVENT_TASK_COMPLETED,
                {
                    "task": task["title"],
                    "list": lst.get("name"),
                    "person": person.get("name"),
                    "stars": entry["stars"],
                    "total_stars": person.get("stars", 0),
                    "shared_with": len(entries),
                },
            )
        self.changed()
        return entries

    @callback
    def async_midnight(self, _now: datetime) -> None:
        self.planner.midnight_cleanup()
        self.changed()

    @callback
    def _sync_registry(self) -> None:
        """Gerätenamen an Personen anpassen, Geräte gelöschter Personen entfernen."""
        registry = dr.async_get(self.hass)
        names = {p["id"]: p["name"] for p in self.planner.persons}
        for device in dr.async_entries_for_config_entry(registry, self.entry_id):
            for domain, ident in device.identifiers:
                if domain != DOMAIN or ident == HUB_ID:
                    continue
                if ident not in names:
                    registry.async_remove_device(device.id)
                elif device.name != names[ident] and not device.name_by_user:
                    registry.async_update_device(device.id, name=names[ident])
                break

        # Kalender gelöschter Listen entfernen.
        list_ids = {lst["id"] for lst in self.planner.lists}
        ent_reg = er.async_get(self.hass)
        for entity in er.async_entries_for_config_entry(ent_reg, self.entry_id):
            uid = entity.unique_id or ""
            if uid.startswith(CAL_PREFIX):
                list_id = uid[len(CAL_PREFIX) :]
                if list_id != CAL_ALL and list_id not in list_ids:
                    ent_reg.async_remove(entity.entity_id)
