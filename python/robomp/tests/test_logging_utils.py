from robomp.logging_utils import log_field


def test_log_field_escapes_record_delimiters_without_losing_context() -> None:
    assert log_field("delivery\r\nforged") == "delivery\\r\\nforged"
    assert log_field(42) == "42"
