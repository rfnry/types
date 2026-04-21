import rfnry_chat_protocol


def test_top_level_module_exports_expected_symbols() -> None:
    required = {
        "Event",
        "EventDraft",
        "Identity",
        "Run",
        "RunError",
        "RunStatus",
        "Thread",
        "ThreadMember",
        "ThreadPatch",
        "TenantScope",
        "StreamStartFrame",
        "StreamDeltaFrame",
        "StreamEndFrame",
        "parse_event",
        "parse_identity",
        "parse_content_part",
        "matches",
    }
    missing = required - set(dir(rfnry_chat_protocol))
    assert not missing, f"missing exports: {sorted(missing)}"
