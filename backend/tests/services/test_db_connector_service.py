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

DB-connector SSH tunnel key loading and reap-orphan ticket recovery.
"""

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, ed25519, rsa

from app.services.db_connector_service import _load_ssh_key


def _openssh_pem(private_key, passphrase=None) -> str:
    enc = (
        serialization.BestAvailableEncryption(passphrase.encode())
        if passphrase else serialization.NoEncryption()
    )
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.OpenSSH,
        encryption_algorithm=enc,
    ).decode()


class TestSSHKeyLoading:
    def test_rsa_key(self):
        pem = _openssh_pem(rsa.generate_private_key(public_exponent=65537, key_size=2048))
        assert _load_ssh_key(pem, None) is not None

    def test_ed25519_key(self):
        pem = _openssh_pem(ed25519.Ed25519PrivateKey.generate())
        assert _load_ssh_key(pem, None) is not None

    def test_ecdsa_key(self):
        pem = _openssh_pem(ec.generate_private_key(ec.SECP256R1()))
        assert _load_ssh_key(pem, None) is not None

    def test_passphrase_protected_key(self):
        pem = _openssh_pem(
            rsa.generate_private_key(public_exponent=65537, key_size=2048),
            passphrase="s3cret",
        )
        assert _load_ssh_key(pem, "s3cret") is not None

    def test_wrong_passphrase_raises(self):
        pem = _openssh_pem(
            rsa.generate_private_key(public_exponent=65537, key_size=2048),
            passphrase="s3cret",
        )
        with pytest.raises(ValueError):
            _load_ssh_key(pem, "wrong")

    def test_garbage_raises(self):
        with pytest.raises(ValueError):
            _load_ssh_key("not a key", None)
