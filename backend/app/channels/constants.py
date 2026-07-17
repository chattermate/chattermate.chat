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

Channel constants that describe the platforms rather than how we talk to them.

Separate from meta_base because these are shared by layers that have no
business knowing about a transport — request schemas state one as a field
default. (It buys no import weight: app/channels/__init__ loads the registry
regardless. It is about where the value belongs, not what it drags in.)
"""

# The language assumed when a caller doesn't name one. Meta has no default —
# name and language together identify a template, so `order_update` in five
# languages is five templates — which makes this our choice, and one worth
# keeping in a single place: four copies of the literal would silently disagree
# the day it changes.
#
# The frontend's DEFAULT_LANGUAGE (utils/whatsappLanguages.ts) is the
# unavoidable second copy, on the other side of the wire. Keep the two equal.
DEFAULT_TEMPLATE_LANGUAGE = "en_US"
