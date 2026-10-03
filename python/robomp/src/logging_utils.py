"""Helpers for preserving one-record-per-line logging."""

from __future__ import annotations


def log_field(value: object) -> str:
    """Render an untrusted structured-log field without record delimiters."""
    return str(value).replace("\r", "\\r").replace("\n", "\\n")
