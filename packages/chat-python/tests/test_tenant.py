from rfnry_chat_protocol.tenant import matches


def test_matches_empty_thread_tenant_always_true() -> None:
    assert matches({}, {"org": "x"}) is True


def test_matches_requires_all_thread_keys() -> None:
    assert matches({"org": "x"}, {"org": "x", "ws": "y"}) is True
    assert matches({"org": "x", "ws": "y"}, {"org": "x"}) is False


def test_matches_rejects_mismatched_values() -> None:
    assert matches({"org": "x"}, {"org": "y"}) is False
