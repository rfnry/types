import pytest
from pydantic import ValidationError

from rfnry_chat_protocol.content import (
    AudioPart,
    DocumentPart,
    FormPart,
    ImagePart,
    TextPart,
    parse_content_part,
)


def test_text_part_minimal() -> None:
    part = TextPart(text="hello")
    assert part.type == "text"
    assert part.text == "hello"


def test_image_part_requires_url_and_mime() -> None:
    with pytest.raises(ValidationError):
        ImagePart.model_validate({"type": "image", "url": "", "mime": "image/png"})
    with pytest.raises(ValidationError):
        ImagePart.model_validate({"type": "image", "url": "https://x", "mime": ""})


def test_audio_part_optional_duration() -> None:
    audio = AudioPart(url="https://x", mime="audio/mp3", duration_ms=1500)
    assert audio.duration_ms == 1500


def test_document_part_minimal() -> None:
    doc = DocumentPart(url="https://x", mime="application/pdf")
    assert doc.name is None


def test_form_part_uses_schema_alias() -> None:
    form = FormPart.model_validate(
        {
            "type": "form",
            "form_id": "f_1",
            "schema": {"type": "object"},
            "status": "pending",
        }
    )
    assert form.json_schema == {"type": "object"}
    dumped = form.model_dump(mode="json", by_alias=True)
    assert "schema" in dumped
    assert "json_schema" not in dumped


def test_parse_content_part_dispatches_by_type() -> None:
    text = parse_content_part({"type": "text", "text": "hi"})
    assert isinstance(text, TextPart)
    image = parse_content_part(
        {
            "type": "image",
            "url": "https://x",
            "mime": "image/png",
        }
    )
    assert isinstance(image, ImagePart)


def test_parse_content_part_rejects_unknown_type() -> None:
    with pytest.raises(ValidationError):
        parse_content_part({"type": "video", "url": "https://x"})
