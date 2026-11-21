"""Sensoren: Sternestand je Person und offene Aufgaben für heute."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, HUB_ID, SIGNAL_UPDATED
from .manager import PlannerManager


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager: PlannerManager = hass.data[DOMAIN]["manager"]
    known: set[str] = set()

    @callback
    def _add_new_persons() -> None:
        new = []
        for person in manager.planner.persons:
            if person["id"] not in known:
                known.add(person["id"])
                new.append(PersonStarsSensor(manager, person["id"]))
        if new:
            async_add_entities(new)

    async_add_entities([TodayOpenSensor(manager)])
    _add_new_persons()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_UPDATED, _add_new_persons))


class _PlannerSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, manager: PlannerManager) -> None:
        self._manager = manager

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_UPDATED, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()


class PersonStarsSensor(_PlannerSensor):
    """Gesammelte Sterne einer Person."""

    _attr_translation_key = "stars"
    _attr_icon = "mdi:star"
    _attr_native_unit_of_measurement = "★"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, manager: PlannerManager, person_id: str) -> None:
        super().__init__(manager)
        self._person_id = person_id
        person = manager.planner.get_person(person_id) or {}
        self._attr_unique_id = f"{person_id}_stars"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, person_id)},
            name=person.get("name", person_id),
            manufacturer="Aufgabenplaner",
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def available(self) -> bool:
        return self._manager.planner.get_person(self._person_id) is not None

    @property
    def native_value(self) -> int | None:
        person = self._manager.planner.get_person(self._person_id)
        return person.get("stars", 0) if person else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.available:
            return {}
        return self._manager.planner.person_stats(self._person_id)


class TodayOpenSensor(_PlannerSensor):
    """Anzahl der heute fälligen (und überfälligen) Aufgaben."""

    _attr_translation_key = "today_open"
    _attr_icon = "mdi:checkbox-marked-circle-outline"
    _attr_native_unit_of_measurement = "Aufgaben"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, manager: PlannerManager) -> None:
        super().__init__(manager)
        self._attr_unique_id = f"{HUB_ID}_today_open"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, HUB_ID)},
            name="Aufgabenplaner",
            manufacturer="Aufgabenplaner",
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def native_value(self) -> int:
        return len(self._manager.planner.open_today())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"tasks": self._manager.planner.open_today()[:30]}
