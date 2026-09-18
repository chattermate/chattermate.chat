# ChatterMate Enhanced Website Knowledge Base

This module provides an enhanced website knowledge extraction system that significantly improves content extraction from web pages compared to the default implementation.

## Key Features

- **Multi-strategy content extraction**: Uses multiple strategies to extract the most relevant content from web pages.
- **Robust error handling**: Implements retries with exponential backoff for failed requests.
- **Text density analysis**: Can identify important content based on paragraph density when standard selectors fail.
- **Smart content cleaning**: Automatically removes boilerplate, navigation, ads, and other non-content elements.
- **Configurable parameters**: Allows customization of crawl depth, number of links, timeouts, etc.
- **High-performance parallel embedding**: Embeds documents in parallel during crawling to maximize throughput.
- **Optimized database insertion**: Preserves embeddings to avoid redundant work during vector database operations.

## Usage

### Basic Usage

```python
from app.knowledge.enhanced_website_kb import EnhancedWebsiteKnowledgeBase
from agno.vectordb.pgvector import PgVector

# Initialize vector database
vector_db = PgVector(
    table_name="your_table",
    db_url="your_db_url",
    schema="your_schema"
)

# Create knowledge base
kb = EnhancedWebsiteKnowledgeBase(
    urls=["https://example.com"],  # List of URLs to crawl
    max_depth=3,                   # How deep to crawl (default: 3)
    max_links=10,                  # Maximum number of links to follow (default: 10)
    min_content_length=100,        # Minimum content length to be considered valid
    timeout=30,                    # Request timeout in seconds
    max_retries=3,                 # Maximum retry attempts for failed requests
    vector_db=vector_db            # Vector database for storing extracted content
)

# Load knowledge base (crawl websites and store in vector DB)
kb.load(
    recreate=False,                # Whether to recreate the collection
    upsert=True,                   # Whether to update existing documents
    filters={"name": "example"}    # Additional filters for the documents
)
```

### High-Performance Configuration with Optimized Vector Database

For maximum performance, use the `OptimizedPgVector` class with increased parallelism settings:

```python
from app.knowledge.enhanced_website_kb import EnhancedWebsiteKnowledgeBase
from app.knowledge.optimized_pgvector import OptimizedPgVector

# Initialize optimized vector database
vector_db = OptimizedPgVector(
    table_name="your_table",
    db_url="your_db_url",
    schema="your_schema"
)

# Create knowledge base with increased parallelism
kb = EnhancedWebsiteKnowledgeBase(
    urls=["https://example.com"],
    max_depth=5,                   # Deeper crawling for more content
    max_links=25,                  # More links for comprehensive coverage
    min_content_length=100,
    timeout=30,
    max_retries=3,
    max_workers=32,                # High parallel processing for maximum throughput
    batch_size=100,                # Larger batch size for better database performance
    vector_db=vector_db
)

# Load knowledge base
kb.load(
    recreate=False,
    upsert=True,
    filters={"source": "website"}
)
```

## Performance Optimization

The system is designed to maximize performance at every stage:

1. **Parallel Crawling**: Multiple URLs are crawled simultaneously using ThreadPoolExecutor
2. **Parallel Embedding**: Documents from each URL are embedded in parallel batches
3. **Final Parallel Embedding**: Any remaining unembedded documents are processed with high parallelism
4. **Embedding Preservation**: The OptimizedPgVector class preserves embeddings during database operations
5. **Batched Database Operations**: Documents are inserted into the database in optimized batches
6. **Vector Database Indexing**: Automatic index optimization for faster vector searches

This approach dramatically reduces the total processing time, especially for large websites with many pages.

### Configuration Options

The `EnhancedWebsiteReader` and `EnhancedWebsiteKnowledgeBase` classes offer several configuration options:

- **max_depth**: How many levels deep to crawl from the starting URL (default: 5)
- **max_links**: Maximum number of links to follow (default: 25)
- **min_content_length**: Minimum text length to be considered valid content (default: 100)
- **timeout**: HTTP request timeout in seconds (default: 30)
- **max_retries**: Maximum number of retry attempts for failed requests (default: 3)
- **max_workers**: Number of parallel workers for crawling and embedding (default: 10)
- **crawl_scope**: How far link-following may wander from the starting URL (default: `host`)
  - `host` — pages on the starting URL's own host only (`www.` and the bare host count as one host)
  - `path` — that host, restricted to the starting URL's path prefix (e.g. only `/hc/…`)
  - `domain` — every host on the registrable domain, so a `help.example.com` crawl also
    walks `www.example.com`, `example.com/blog/…` and other subdomains
  Only `http`/`https` links are ever followed — `mailto:`, `tel:` and friends are not pages.

Content stored by earlier, wider crawls is cleaned up in two steps:

- Pages that were never pages (mangled `https://mailto:a@example.com/…` URLs) are deleted
  automatically by the `purge_mangled_crawl_pages_001` migration.
- Real pages that are simply outside the new scope (a marketing site pulled in from a
  help-center seed) are left alone; `scripts/prune_offsite_pages.py` reports them per
  source and deletes them only with `--apply`.
- **batch_size**: Size of document batches for database operations (default: 20)
- **blacklist_tags**: HTML tags to remove before content extraction (scripts, styles, etc.)
- **min_content_length**: Floor a page's extracted text must clear to count as readable (default: 100)

Candidate containers and the retention threshold live in `main_content.py`
(`CANDIDATE_TAGS`, `CONTENT_RETENTION`), shared with the help-center importer.

## Content Extraction Strategy

Selection happens in `main_content.select_main_node()`, shared with the help-center
article importer: it picks the **deepest container that still holds at least
`CONTENT_RETENTION` (90%) of the page's non-boilerplate text**, which resolves to
`<main>` or the content `<div>` where one exists and to `<body>` otherwise.
Navigation chrome (`nav`, `header`, `footer`, `aside`) is excluded when measuring,
so a page whose only text is a phone number and a login link reads as empty.

This replaced a walk that returned the *first* candidate clearing
`min_content_length`. That floor is not a quality bar — a hero banner clears it —
so a page whose first `<article>` was a 108-character search widget indexed the
widget and discarded 4,500 characters. Choosing by how much of the page a
container holds cannot make that mistake.

If the selected node yields less than `min_content_length`, the page is thin or
JavaScript-rendered and these fallbacks run in order:

1. **Density-based extraction**: Analyzes paragraph density to identify content-rich areas.
2. **Meaningful-element extraction**: Collects headings, paragraphs, lists and tables.
3. **Body fallback**: The cleaned body content.
4. **Last resort**: All text in the document.

Falling through to these is also what routes a JavaScript-rendered page to the
Crawl4AI browser fallback in `_process_url` — so boilerplate must never be
allowed to clear the floor on its own.

## Testing

The system includes comprehensive unit tests to ensure proper functionality:

```bash
# Activate the Python environment
conda activate python3128

# Run the tests
python -m pytest backend/tests/knowledge/test_enhanced_website_reader.py -v
python -m pytest backend/tests/knowledge/test_enhanced_website_kb.py -v
python -m pytest backend/tests/knowledge/test_optimized_pgvector.py -v
``` 