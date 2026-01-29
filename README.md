<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Bitbucket-blue-logomark-only.svg" alt="Bitbucket Logo" width="80" height="80">
</p>

<h1 align="center">Bitbucket CLI</h1>

<p align="center">
  <strong>A powerful command-line interface for Bitbucket Cloud</strong>
</p>

<p align="center">
  <em>Inspired by GitHub's <code>gh</code> CLI — bringing the same great experience to Bitbucket</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pilatos/bitbucket-cli"><img src="https://img.shields.io/npm/v/@pilatos/bitbucket-cli.svg?style=flat-square&color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@pilatos/bitbucket-cli"><img src="https://img.shields.io/npm/dm/@pilatos/bitbucket-cli.svg?style=flat-square&color=blue" alt="npm downloads"></a>
  <a href="https://github.com/0pilatos0/bitbucket-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
  <a href="https://github.com/0pilatos0/bitbucket-cli/issues"><img src="https://img.shields.io/github/issues/0pilatos0/bitbucket-cli.svg?style=flat-square" alt="GitHub issues"></a>
</p>

<p align="center">
  <sub>
    <strong>Note:</strong> This is an <strong>unofficial</strong>, community-maintained CLI tool.<br>
    It is not affiliated with or endorsed by Atlassian or Bitbucket.
  </sub>
</p>

---

## Why Bitbucket CLI?

If you've used GitHub's `gh` CLI and loved it, you've probably wished for something similar for Bitbucket. **Now you have it.**

- **Stay in your terminal** — No more context-switching to the browser
- **Automate your workflow** — Script common operations with JSON output
- **Work faster** — Clone repos, create PRs, and manage code reviews in seconds
- **Smart context detection** — Automatically detects workspace/repo from git directory

---

## Installation

```bash
npm install -g @pilatos/bitbucket-cli
```

Verify installation:

```bash
bb --version
```

> **Requirements:** [Bun](https://bun.sh) runtime 1.0 or higher (Node.js is not supported)

---

## Quick Start

```bash
# 1. Authenticate with Bitbucket
bb auth login

# 2. Clone a repository
bb repo clone myworkspace/myrepo
cd myrepo

# 3. Create a feature branch and make changes
git checkout -b feature/awesome-feature

# 4. Create a pull request
bb pr create --title "Add awesome feature"

# 5. List open pull requests
bb pr list
```

---

## Features

| Category | Commands |
|----------|----------|
| **Authentication** | `login`, `logout`, `status`, `token` |
| **Repositories** | `clone`, `create`, `list`, `view`, `delete` |
| **Pull Requests** | `create`, `list`, `view`, `edit`, `merge`, `approve`, `decline`, `ready`, `checkout`, `diff`, `comment`, `comments`, `reviewers` |
| **Configuration** | `get`, `set`, `list` |
| **Shell Completion** | `install`, `uninstall` |

**Global Options:**
- `--json` — Output results as JSON for scripting
- `-w, --workspace` — Specify workspace
- `-r, --repo` — Specify repository

---

## Documentation

Full documentation is available at **[bitbucket-cli.paulvanderlei.com](https://bitbucket-cli.paulvanderlei.com)**

- [Quick Start Guide](https://bitbucket-cli.paulvanderlei.com/getting-started/quickstart/)
- [Command Reference](https://bitbucket-cli.paulvanderlei.com/commands/auth/)
- [Scripting & Automation](https://bitbucket-cli.paulvanderlei.com/guides/scripting/)
- [CI/CD Integration](https://bitbucket-cli.paulvanderlei.com/guides/cicd/)
- [Troubleshooting](https://bitbucket-cli.paulvanderlei.com/help/troubleshooting/)
- [FAQ](https://bitbucket-cli.paulvanderlei.com/help/faq/)

---

## Authentication

The CLI uses **Bitbucket API Tokens** for secure authentication.

> **Note**: As of September 9, 2025, Bitbucket app passwords are deprecated. Use API tokens instead.

### Create an API Token

1. Go to [Bitbucket API Tokens](https://bitbucket.org/account/settings/api-tokens/)
2. Click **"Create API token"**
3. Select required scopes (Account, Repositories, Pull requests)
4. Copy the token

### Authenticate

```bash
bb auth login
```

---

## Examples

### Daily Workflow

```bash
# Check open PRs
bb pr list

# Review and merge
bb pr view 42
bb pr activity 42
bb pr approve 42
bb pr merge 42

# Manage reviewers
bb pr reviewers list 42
bb pr reviewers add 42 teammate
```

### Draft Pull Requests

```bash
# Create a draft PR for early feedback
bb pr create --title "WIP: Add new feature" --draft

# Mark it ready for review when done
bb pr ready 123
```

### Managing PR Reviewers

```bash
# List current reviewers on a PR
bb pr reviewers list 42

# Add reviewers to a PR
bb pr reviewers add 42 johndoe
bb pr reviewers add 42 janedoe

# Remove a reviewer from a PR
bb pr reviewers remove 42 johndoe

# Get reviewers as JSON for scripting
bb pr reviewers list 42 --json | jq '.[].display_name'
```

### Scripting with JSON

```bash
# Get all open PR titles
bb pr list --json | jq '.[].title'

# Filter repos by name
bb repo list --json | jq '.[] | select(.name | contains("api"))'
```

### CI/CD Usage

```bash
export BB_USERNAME=myuser
export BB_API_TOKEN=my-token
bb auth login
bb pr list -w workspace -r repo --json
```

---

## Development

```bash
# Clone the repository
git clone https://github.com/0pilatos0/bitbucket-cli.git
cd bitbucket-cli

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`bun test`)
5. Submit a Pull Request

---

## Acknowledgments

- Inspired by [GitHub CLI (`gh`)](https://cli.github.com/)
- Built with [Commander.js](https://github.com/tj/commander.js)
- Uses the [Bitbucket Cloud REST API](https://developer.atlassian.com/cloud/bitbucket/rest/)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>
    Made with care by the community<br>
    <a href="https://github.com/0pilatos0/bitbucket-cli/issues">Report a Bug</a> ·
    <a href="https://github.com/0pilatos0/bitbucket-cli/issues">Request a Feature</a>
  </sub>
</p>
