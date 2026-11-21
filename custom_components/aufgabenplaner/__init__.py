"""Aufgabenplaner: Aufgaben, Sterne und Wiederholungen für die ganze Familie."""
from __future__ import annotations

from pathlib import Path

import voluptuous as vol

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.typing import ConfigType

from . import api
from .const import CARD_FILE, DOMAIN, URL_BASE, VERSION, WEEKDAYS
from .manager import PlannerManager
from .planner import PlannerError

PLATFORMS = [Platform.SENSOR, Platform.CALENDAR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

ADD_TASK_SCHEMA = vol.Schema(
    {
        vol.Required("title"): cv.string,
        vol.Optional("list"): cv.string,
        vol.Optional("stars", default=1): vol.All(vol.Coerce(int), vol.Range(min=0, max=20)),
        vol.Optional("assignee"): cv.string,
        vol.Optional("icon"): cv.string,
        vol.Optional("due"): cv.date,
        vol.Optional("repeat", default="none"): vol.In(["none", "daily", "weekly", "monthly"]),
        vol.Optional("weekdays", default=[]): vol.All(cv.ensure_list, [vol.In(WEEKDAYS)]),
        vol.Optional("interval", default=1): vol.All(vol.Coerce(int), vol.Range(min=1, max=52)),
    }
)
COMPLETE_TASK_SCHEMA = vol.Schema(
    {
        vol.Required("task"): cv.string,
        vol.Optional("list"): cv.string,
        # Eine oder mehrere Personen; bei mehreren werden die Sterne geteilt.
        vol.Optional("person"): vol.All(cv.ensure_list, [cv.string]),
    }
)
ADJUST_STARS_SCHEMA = vol.Schema(
    {
        vol.Required("person"): cv.string,
        vol.Required("amount"): vol.All(vol.Coerce(int), vol.Range(min=-1000, max=1000)),
        vol.Optional("reason", default=""): cv.string,
    }
)


def _manager(hass: HomeAssistant) -> PlannerManager:
    manager = hass.data.get(DOMAIN, {}).get("manager")
    if manager is None:
        raise ServiceValidationError("Der Aufgabenplaner ist nicht eingerichtet.")
    return manager


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Dienste registrieren (stehen damit immer zur Verfügung)."""
    hass.data.setdefault(DOMAIN, {})

    async def add_task(call: ServiceCall) -> None:
        manager = _manager(hass)
        planner = manager.planner
        try:
            if call.data.get("list"):
                lst = planner.find_list(call.data["list"])
                if lst is None:
                    raise PlannerError("list_not_found", f"Liste „{call.data['list']}“ nicht gefunden")
            else:
                lst = next((l for l in planner.lists if not l.get("owner")), planner.lists[0])

            assignee = None
            if call.data.get("assignee"):
                person = planner.find_person(call.data["assignee"])
                if person is None:
                    raise PlannerError(
                        "person_not_found", f"Person „{call.data['assignee']}“ nicht gefunden"
                    )
                assignee = person["id"]

            due = call.data.get("due")
            repeat = call.data["repeat"]
            interval = call.data["interval"]
            recurrence = None
            if repeat == "daily":
                recurrence = {"type": "daily", "interval": interval}
            elif repeat == "weekly":
                recurrence = {
                    "type": "weekly",
                    "interval": interval,
                    "days": [WEEKDAYS.index(d) for d in call.data["weekdays"]],
                }
            elif repeat == "monthly":
                recurrence = {
                    "type": "monthly",
                    "interval": interval,
                    "day": (due or planner.today()).day,
                }

            manager.mutate(
                planner.save_task,
                {
                    "title": call.data["title"],
                    "list_id": lst["id"],
                    "stars": call.data["stars"],
                    "icon": call.data.get("icon"),
                    "assignee": assignee,
                    "due": due.isoformat() if due else None,
                    "recurrence": recurrence,
                },
            )
        except PlannerError as err:
            raise ServiceValidationError(str(err)) from err

    async def complete_task(call: ServiceCall) -> None:
        manager = _manager(hass)
        planner = manager.planner
        try:
            list_id = None
            if call.data.get("list"):
                lst = planner.find_list(call.data["list"])
                if lst is None:
                    raise PlannerError("list_not_found", f"Liste „{call.data['list']}“ nicht gefunden")
                list_id = lst["id"]
            task = planner.find_task(call.data["task"], list_id)
            if task is None:
                raise PlannerError("task_not_found", f"Aufgabe „{call.data['task']}“ nicht gefunden")
            person_ids = []
            for name in call.data.get("person", []):
                person = planner.find_person(name)
                if person is None:
                    raise PlannerError("person_not_found", f"Person „{name}“ nicht gefunden")
                person_ids.append(person["id"])
            manager.complete(task["id"], person_ids)
        except PlannerError as err:
            raise ServiceValidationError(str(err)) from err

    async def adjust_stars(call: ServiceCall) -> None:
        manager = _manager(hass)
        planner = manager.planner
        try:
            person = planner.find_person(call.data["person"])
            if person is None:
                raise PlannerError("person_not_found", f"Person „{call.data['person']}“ nicht gefunden")
            manager.mutate(
                planner.adjust_stars, person["id"], call.data["amount"], call.data["reason"]
            )
        except PlannerError as err:
            raise ServiceValidationError(str(err)) from err

    hass.services.async_register(DOMAIN, "add_task", add_task, schema=ADD_TASK_SCHEMA)
    hass.services.async_register(DOMAIN, "complete_task", complete_task, schema=COMPLETE_TASK_SCHEMA)
    hass.services.async_register(DOMAIN, "adjust_stars", adjust_stars, schema=ADJUST_STARS_SCHEMA)
    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Dashboard-Karte als statische Datei bereitstellen und automatisch laden."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("frontend"):
        return
    card_path = Path(__file__).parent / "www" / CARD_FILE
    url = f"{URL_BASE}/{CARD_FILE}"
    await hass.http.async_register_static_paths([StaticPathConfig(url, str(card_path), False)])
    add_extra_js_url(hass, f"{url}?v={VERSION}")
    domain_data["frontend"] = True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    manager = PlannerManager(hass, entry.entry_id)
    await manager.async_load()

    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data["manager"] = manager

    await _async_register_frontend(hass)
    if not domain_data.get("websocket"):
        api.async_register(hass)
        domain_data["websocket"] = True

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Nachts aufräumen und Oberfläche/Sensoren auffrischen (neuer Tag).
    entry.async_on_unload(
        async_track_time_change(hass, manager.async_midnight, hour=0, minute=0, second=10)
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        manager = hass.data[DOMAIN].pop("manager", None)
        if manager is not None:
            await manager.async_flush()
    return unloaded
