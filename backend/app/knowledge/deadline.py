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

How long one source may take to read.

Reading runs on worker threads, which cannot be stopped from outside: a
timeout around the call would mark the source failed while the crawl and
its embedding carried on in the background. So the work checks the deadline
itself, between pages and between chunks, and stops.
"""

import time
from typing import Callable


class SourceTimedOut(Exception):
    """The source ran past its time limit. The message is for the user."""


class Deadline:
    def __init__(self, seconds: float, clock: Callable[[], float] = time.monotonic):
        self._clock = clock
        self._at = clock() + seconds
        self._cancelled = False

    def cancel(self) -> None:
        """Stop the work now, as if the time had run out: the source it was
        reading has gone."""
        self._cancelled = True

    @property
    def expired(self) -> bool:
        return self._cancelled or self._clock() >= self._at
