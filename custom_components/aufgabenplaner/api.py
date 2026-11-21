"""Websocket-API für die Dashboard-Karte.

Hinweis: "id" ist im Websocket-Protokoll die Nachrichten-ID und darf nicht als
Nutzdaten-Feld verwendet werden. Deshalb heißen die Felder person_id, list_id usw.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, SIGNAL_UPDATED
from .manager import PlannerManager
from .planner import MAX_STARS, PlannerError

COLOR = vol.Match(r"^#[0-9a-fA-F]{6}$")
RECURRENCE = vol.Any(
    None,
    vol.Schema(
        {
            vol.Required("type"): vol.In(["daily", "weekly", "monthly"]),
            vol.Optional("interval", default=1): vol.All(int, vol.Range(min=1, max=52)),
            vol.Optional("days"): [vol.All(int, vol.Range(min=0, max=6))],
            vol.Optional("day"): vol.All(int, vol.Range(min=1, max=31)),
        }
    ),
)


def _run(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    func: Callable[[PlannerManager], Any],
) -> None:
    manager: PlannerManager | None = hass.data.get(DOMAIN, {}).get("manager")
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Aufgabenplaner is not set up")
        return
    try:
        result = func(manager)
    except PlannerError as err:
        connection.send_error(msg["id"], err.code, str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get"})
@callback
def ws_get(hass, connection, msg):
    _run(hass, connection, msg, lambda m: m.planner.snapshot())


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    manager: PlannerManager | None = hass.data.get(DOMAIN, {}).get("manager")
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Aufgabenplaner is not set up")
        return

    @callback
    def forward() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], manager.planner.snapshot()))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_UPDATED, forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/person_save",
        vol.Optional("person_id"): str,
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
        vol.Optional("emoji"): vol.All(str, vol.Length(max=16)),
        vol.Optional("color"): COLOR,
        vol.Optional("user_id"): vol.Any(None, str),
    }
)
@callback
def ws_person_save(hass, connection, msg):
    data = {
        "id": msg.get("person_id"),
        "name": msg["name"],
        "emoji": msg.get("emoji"),
        "color": msg.get("color"),
    }
    if "user_id" in msg:
        data["user_id"] = msg["user_id"]
    _run(hass, connection, msg, lambda m: m.mutate(m.planner.save_person, data))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/person_delete", vol.Required("person_id"): str}
)
@callback
def ws_person_delete(hass, connection, msg):
    _run(
        hass,
        connection,
        msg,
        lambda m: m.mutate(m.planner.delete_person, msg["person_id"]) or {},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/list_save",
        vol.Optional("list_id"): str,
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=40)),
        vol.Optional("icon"): vol.All(str, vol.Length(max=16)),
        vol.Optional("owner"): vol.Any(None, str),
    }
)
@callback
def ws_list_save(hass, connection, msg):
    data = {
        "id": msg.get("list_id"),
        "name": msg["name"],
        "icon": msg.get("icon"),
        "owner": msg.get("owner"),
    }
    _run(hass, connection, msg, lambda m: m.mutate(m.planner.save_list, data))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/list_delete", vol.Required("list_id"): str}
)
@callback
def ws_list_delete(hass, connection, msg):
    _run(
        hass,
        connection,
        msg,
        lambda m: m.mutate(m.planner.delete_list, msg["list_id"]) or {},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/task_save",
        vol.Optional("task_id"): str,
        vol.Required("title"): vol.All(str, vol.Length(min=1, max=120)),
        vol.Required("list_id"): str,
        vol.Optional("stars", default=1): vol.All(int, vol.Range(min=0, max=MAX_STARS)),
        vol.Optional("assignee"): vol.Any(None, str),
        vol.Optional("due"): vol.Any(None, str),
        vol.Optional("icon"): vol.Any(None, vol.All(str, vol.Length(max=40))),
        vol.Optional("recurrence"): RECURRENCE,
    }
)
@callback
def ws_task_save(hass, connection, msg):
    data = {
        "id": msg.get("task_id"),
        "title": msg["title"],
        "list_id": msg["list_id"],
        "stars": msg["stars"],
        "assignee": msg.get("assignee"),
        "due": msg.get("due"),
        "icon": msg.get("icon"),
        "recurrence": msg.get("recurrence"),
    }
    _run(hass, connection, msg, lambda m: m.mutate(m.planner.save_task, data))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/task_delete", vol.Required("task_id"): str}
)
@callback
def ws_task_delete(hass, connection, msg):
    _run(
        hass,
        connection,
        msg,
        lambda m: m.mutate(m.planner.delete_task, msg["task_id"]) or {},
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/task_skip", vol.Required("task_id"): str}
)
@callback
def ws_task_skip(hass, connection, msg):
    _run(hass, connection, msg, lambda m: m.mutate(m.planner.skip_task, msg["task_id"]) or {})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/task_complete",
        vol.Required("task_id"): str,
        vol.Optional("person_id"): vol.Any(None, str),
        # Mehrere Personen: die Sterne werden geteilt (0,5er-Schritte).
        vol.Optional("person_ids"): [str],
    }
)
@callback
def ws_task_complete(hass, connection, msg):
    def complete(m: PlannerManager) -> Any:
        person_ids = list(msg.get("person_ids") or [])
        if not person_ids and msg.get("person_id"):
            person_ids = [msg["person_id"]]
        if not person_ids:
            # Niemand angegeben und niemand zuständig: der eingeloggte Benutzer bekommt die Sterne.
            task = m.planner.get_task(msg["task_id"])
            if task and not m.planner._task_person(task):
                linked = m.planner.person_for_user(connection.user.id)
                person_ids = [linked["id"]] if linked else []
        return m.complete(msg["task_id"], person_ids)

    _run(hass, connection, msg, complete)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/users"})
@websocket_api.async_response
async def ws_users(hass, connection, msg):
    """Home-Assistant-Benutzer zum Verknüpfen mit Personen (nur Administratoren)."""
    users = await hass.auth.async_get_users()
    result = [
        {"id": user.id, "name": user.name or user.id}
        for user in users
        if user.is_active and not user.system_generated
    ]
    result.sort(key=lambda u: u["name"].casefold())
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/entry_undo", vol.Required("entry_id"): str}
)
@callback
def ws_entry_undo(hass, connection, msg):
    _run(
        hass,
        connection,
        msg,
        lambda m: m.mutate(m.planner.undo_entry, msg["entry_id"]) or {},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/stars_adjust",
        vol.Required("person_id"): str,
        vol.Required("amount"): vol.All(int, vol.Range(min=-1000, max=1000)),
        vol.Optional("reason", default=""): vol.All(str, vol.Length(max=80)),
    }
)
@callback
def ws_stars_adjust(hass, connection, msg):
    _run(
        hass,
        connection,
        msg,
        lambda m: m.mutate(m.planner.adjust_stars, msg["person_id"], msg["amount"], msg["reason"]),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/template_save",
        vol.Optional("template_id"): str,
        vol.Required("title"): vol.All(str, vol.Length(min=1, max=120)),
        vol.Optional("stars", default=1): vol.All(int, vol.Range(min=0, max=MAX_STARS)),
        vol.Optional("icon"): vol.Any(None, vol.All(str, vol.Length(max=40))),
        vol.Optional("recurrence"): RECURRENCE,
    }
)
@callback
def ws_template_save(hass, connection, msg):
    data = {
        "id": msg.get("template_id"),
        "title": msg["title"],
        "stars": msg["stars"],
        "icon": msg.get("icon"),
        "recurrence": msg.get("recurrence"),
    }
    _run(hass, connection, msg, lambda m: m.mutate(m.planner.save_template, data))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/template_delete", vol.Required("template_id"): str}
)
@callback
def ws_template_delete(hass, connection, msg):
    _run(
        hass,
        connection,
        msg,
        lambda m: m.mutate(m.planner.delete_template, msg["template_id"]) or {},
    )


COMMANDS = (
    ws_get,
    ws_subscribe,
    ws_person_save,
    ws_person_delete,
    ws_list_save,
    ws_list_delete,
    ws_task_save,
    ws_task_delete,
    ws_task_skip,
    ws_task_complete,
    ws_users,
    ws_entry_undo,
    ws_stars_adjust,
    ws_template_save,
    ws_template_delete,
)


def async_register(hass: HomeAssistant) -> None:
    """Alle Websocket-Befehle registrieren."""
    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
