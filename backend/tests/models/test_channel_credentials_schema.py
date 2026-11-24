"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import pytest
from pydantic import ValidationError

from app.models.schemas.channel import (
    InstagramConnectRequest,
    LineConnectRequest,
    SmsConnectRequest,
    MessengerConnectRequest,
    WhatsAppConnectRequest,
)

# A curly apostrophe, a zero-width space and an ellipsis: what a copy from a
# chat app, a doc or a truncated console field drags along with a token
BAD_PASTES = ["EAAG’abc", "EAAG​abc", "EAAGabc…"]


def _error(exc: ValidationError) -> str:
    return exc.errors()[0]["msg"]


@pytest.mark.parametrize("token", BAD_PASTES)
def test_whatsapp_token_with_a_stray_character_is_refused_by_name(token):
    with pytest.raises(ValidationError) as exc:
        WhatsAppConnectRequest(phone_number_id="1", access_token=token)

    assert "access token contains a character" in _error(exc.value)


def test_whatsapp_token_and_secret_are_trimmed():
    request = WhatsAppConnectRequest(
        phone_number_id="1", access_token="  EAAGabc\n", app_secret=" s3cret ")

    assert request.access_token == "EAAGabc"
    assert request.app_secret == "s3cret"


def test_blank_app_secret_still_means_not_given():
    assert WhatsAppConnectRequest(
        phone_number_id="1", access_token="t", app_secret="  ").app_secret is None


def test_app_secret_with_a_stray_character_is_refused():
    with pytest.raises(ValidationError) as exc:
        MessengerConnectRequest(page_id="1", page_access_token="t", app_secret="ab’c")

    assert "app secret" in _error(exc.value)


@pytest.mark.parametrize("model", [MessengerConnectRequest, InstagramConnectRequest])
def test_page_token_with_a_stray_character_is_refused(model):
    ids = {"page_id": "1"} if model is MessengerConnectRequest else {"ig_id": "1"}
    with pytest.raises(ValidationError) as exc:
        model(page_access_token="EAAG’abc", **ids)

    assert "Page access token" in _error(exc.value)


def test_line_credentials_are_checked():
    with pytest.raises(ValidationError) as exc:
        LineConnectRequest(channel_secret="abc", channel_access_token="tok​")

    assert "channel access token" in _error(exc.value)
    assert LineConnectRequest(
        channel_secret=" abc ", channel_access_token="tok").channel_secret == "abc"


def test_whitespace_only_token_is_refused_as_missing():
    with pytest.raises(ValidationError) as exc:
        WhatsAppConnectRequest(phone_number_id="1", access_token="   ")

    assert "access token is required" in _error(exc.value)


def test_sms_credentials_are_trimmed_and_checked():
    request = SmsConnectRequest(provider="twilio", phone_number="+1",
                                credentials={"account_sid": " AC1 ", "auth_token": "", "port": 5})
    assert request.credentials == {"account_sid": "AC1", "auth_token": "", "port": 5}

    with pytest.raises(ValidationError) as exc:
        SmsConnectRequest(provider="twilio", phone_number="+1",
                          credentials={"auth_token": "abc\u2019"})
    assert "auth token contains a character" in _error(exc.value)
