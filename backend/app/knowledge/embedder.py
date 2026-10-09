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

The local embedding model, loaded once per process.

agno's ``FastEmbedEmbedder`` builds a new ``TextEmbedding`` (an ONNX session)
inside every ``get_embedding`` call — about 1.5 s of model loading around a
7 ms embedding. One row per page hid that; one row per chunk would not.
"""

import threading
from dataclasses import dataclass
from typing import Dict, List

import numpy as np
from agno.embedder.fastembed import FastEmbedEmbedder
from fastembed import TextEmbedding

from app.core.config import settings

_models: Dict[str, TextEmbedding] = {}
_lock = threading.Lock()


def _model(model_id: str) -> TextEmbedding:
    model = _models.get(model_id)
    if model is None:
        with _lock:
            model = _models.get(model_id)
            if model is None:
                model = _models[model_id] = TextEmbedding(model_name=model_id)
    return model


@dataclass
class CachedFastEmbedEmbedder(FastEmbedEmbedder):
    """``FastEmbedEmbedder`` that shares one loaded model per model id."""

    id: str = settings.FASTEMBED_MODEL

    def get_embedding(self, text: str) -> List[float]:
        embedding = list(_model(self.id).embed(text))[0]
        return embedding.tolist() if isinstance(embedding, np.ndarray) else list(embedding)


def get_embedder() -> CachedFastEmbedEmbedder:
    """The embedder every knowledge path should use for the configured model."""
    return CachedFastEmbedEmbedder()
