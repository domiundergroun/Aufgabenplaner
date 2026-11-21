"""Konstanten für den Aufgabenplaner."""
from __future__ import annotations

DOMAIN = "aufgabenplaner"
VERSION = "0.7.0"

STORAGE_KEY = f"{DOMAIN}.data"
STORAGE_VERSION = 1
SAVE_DELAY = 1

HUB_ID = "hub"
CAL_PREFIX = "cal_"
CAL_ALL = "all"

SIGNAL_UPDATED = f"{DOMAIN}_updated"
EVENT_TASK_COMPLETED = f"{DOMAIN}_task_completed"

URL_BASE = f"/{DOMAIN}_static"
CARD_FILE = "aufgabenplaner-card.js"

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
