# Contributing to ChatterMate

Thanks for your interest in contributing! This document explains how to get
your changes accepted.

## License

The ChatterMate open-source core is licensed under the
[Apache License 2.0](LICENSE). By contributing, you agree that your
contributions will be licensed under Apache-2.0.

## Developer Certificate of Origin (DCO)

We use the [Developer Certificate of Origin](DCO) (DCO 1.1) instead of a CLA.
It is a lightweight way for you to certify that you wrote, or otherwise have
the right to submit, the code you are contributing.

**Every commit must be signed off.** Add a `Signed-off-by` trailer to each
commit message with:

```bash
git commit -s -m "your message"
```

This appends a line like:

```
Signed-off-by: Your Name <your.email@example.com>
```

The name and email must match your `git config user.name` and
`user.email`, and must be your real identity (no anonymous or pseudonymous
contributions).

The [DCO app](https://github.com/apps/dco) runs on every pull request and
verifies that all commits are signed off. PRs with unsigned commits will fail
the check.

### Fixing commits that are not signed off

- **Last commit:** `git commit --amend -s --no-edit`
- **A whole branch:** `git rebase --signoff main`

Then force-push your branch (`git push --force-with-lease`).

### Tip: never forget `-s`

You can make sign-off the default for this repo with a git hook:

```bash
cat > .git/hooks/prepare-commit-msg <<'EOF'
#!/bin/sh
NAME=$(git config user.name)
EMAIL=$(git config user.email)
grep -qs "^Signed-off-by:" "$1" || printf "\nSigned-off-by: %s <%s>\n" "$NAME" "$EMAIL" >> "$1"
EOF
chmod +x .git/hooks/prepare-commit-msg
```

## Development workflow

1. Fork the repository and create a feature branch:
   `git checkout -b feature/amazing-feature`
2. Make your changes. Follow the existing code style
   (PEP 8 for Python, type hints where practical; the project conventions for
   Vue/TypeScript on the frontend).
3. Add or update tests for your change and make sure the suite passes.
4. Commit with sign-off (`git commit -s`).
5. Push and open a Pull Request, filling out the PR template.

## License headers

New source files should carry the standard Apache-2.0 header. You can apply or
refresh headers across the codebase by running:

```bash
python relicense_headers.py
```

This is idempotent — it only changes files whose header is missing or outdated.

## Enterprise features

Advanced/enterprise capabilities live in separate, proprietary modules and are
**not** covered by the Apache-2.0 license. Contributions in this repository
apply to the open-source core only.
