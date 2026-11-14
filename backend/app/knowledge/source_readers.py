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

Knowledge sources an installed extension knows how to read.

Websites, sitemaps and PDFs are read by the knowledge manager itself. Any
other queue source_type is looked up here: an extension registers a reader
for it from its hooks module (see app.channels.app_hooks.load_extensions).
Without one, the lookup finds nothing and the source type stays unsupported.

A reader is an async generator of pages: each yielded Document is one page,
stored (chunked, embedded, searchable) before the next is asked for. Code
after its last yield runs once every page is stored (not when the run stops
early). It raises SourceUnreadable, with the advice the user should see, when
the source has nothing it can read.

Every run yields the whole source, each page with an id under
page_id_prefix(source). A run read to the end removes that source's pages
under the prefix it didn't yield: the source no longer has them. Pages added
by hand have other ids and stay.
"""

from dataclasses import dataclass
from typing import Any, AsyncIterator, Callable, Dict, Optional

from agno.document import Document

from app.channels.app_hooks import load_extensions
from app.models.knowledge import SourceType

SourceReader = Callable[[Any], AsyncIterator[Document]]


@dataclass(frozen=True)
class RegisteredReader:
    read: SourceReader
    # The type the source is filed under once it has content
    knowledge_type: SourceType
    # What the user sees the source called in messages about it
    label: Callable[[str], str]


_readers: Dict[str, RegisteredReader] = {}


def register(
    source_type: str,
    read: SourceReader,
    knowledge_type: SourceType,
    label: Callable[[str], str],
) -> None:
    _readers[source_type] = RegisteredReader(read, knowledge_type, label)


def reader_for(source_type: str) -> Optional[RegisteredReader]:
    """The reader for a queue source_type, or None. Loads the installed
    extension first, so whichever process reads knowledge (the API, the
    knowledge worker) finds the same readers."""
    load_extensions()
    return _readers.get(source_type)


def page_id_prefix(source: str) -> str:
    """What a reader's page ids start with."""
    return f"{source}:"


def reset() -> None:
    """Forget every registration (tests)."""
    _readers.clear()
