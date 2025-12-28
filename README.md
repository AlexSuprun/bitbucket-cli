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
  <a href="https://www.npmjs.com/package/bitbucket-cli"><img src="https://img.shields.io/npm/v/bitbucket-cli.svg?style=flat-square&color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/bitbucket-cli"><img src="https://img.shields.io/npm/dm/bitbucket-cli.svg?style=flat-square&color=blue" alt="npm downloads"></a>
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

`bb` brings the power of command-line workflows to Bitbucket Cloud, letting you:

- **Stay in your terminal** — No more context-switching to the browser
- **Automate your workflow** — Script common operations with ease
- **Work faster** — Clone repos, create PRs, and manage code reviews in seconds
- **Maintain consistency** — Use familiar patterns if you work across GitHub and Bitbucket

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
  - [Authentication](#authentication)
  - [Repositories](#repositories)
  - [Pull Requests](#pull-requests)
  - [Configuration](#configuration)
  - [Shell Completion](#shell-completion)
- [Global Options](#global-options)
- [Authentication Setup](#authentication-setup)
- [Configuration](#configuration-1)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

### Using npm (Recommended)

```bash
npm install -g bitbucket-cli
```

### Using Bun

```bash
bun install -g bitbucket-cli
```

### Using Yarn

```bash
yarn global add bitbucket-cli
```

### Verify Installation

```bash
bb --version
```

> **Requirements:** Node.js 20 or higher

---

## Quick Start

Get up and running in under a minute:

```bash
# 1. Authenticate with Bitbucket
bb auth login

# 2. Clone a repository
bb repo clone myworkspace/myrepo

# 3. Create a feature branch and make changes
cd myrepo
git checkout -b feature/awesome-feature

# 4. Create a pull request
bb pr create --title "Add awesome feature" --source feature/awesome-feature --destination main

# 5. List open pull requests
bb pr list
```

---

## Commands

### Authentication

Manage your Bitbucket authentication securely.

| Command | Description |
|---------|-------------|
| `bb auth login` | Authenticate with Bitbucket using an App Password |
| `bb auth logout` | Log out and remove stored credentials |
| `bb auth status` | Check your current authentication status |
| `bb auth token` | Print your current access token |

### Repositories

Clone, create, and manage your Bitbucket repositories.

| Command | Description |
|---------|-------------|
| `bb repo clone <repo>` | Clone a repository to your local machine |
| `bb repo create <name>` | Create a new repository |
| `bb repo list` | List repositories in a workspace |
| `bb repo view [repo]` | View repository details and metadata |
| `bb repo delete <repo>` | Delete a repository (use with caution!) |

### Pull Requests

Full pull request workflow management from your terminal.

| Command | Description |
|---------|-------------|
| `bb pr create` | Create a new pull request |
| `bb pr list` | List pull requests with filtering options |
| `bb pr view <id>` | View pull request details, diff, and comments |
| `bb pr merge <id>` | Merge a pull request |
| `bb pr approve <id>` | Approve a pull request |
| `bb pr decline <id>` | Decline a pull request |
| `bb pr checkout <id>` | Checkout a pull request branch locally |

### Configuration

Customize your CLI experience.

| Command | Description |
|---------|-------------|
| `bb config get <key>` | Get a configuration value |
| `bb config set <key> <value>` | Set a configuration value |
| `bb config list` | List all configuration values |

### Shell Completion

Enable intelligent tab completion for faster command entry.

| Command | Description |
|---------|-------------|
| `bb completion install` | Install shell completions (auto-detects shell) |
| `bb completion uninstall` | Remove shell completions |

**Setup:**

```bash
# Install completions
bb completion install

# Restart your shell or source your profile
source ~/.bashrc    # Bash
source ~/.zshrc     # Zsh
source ~/.config/fish/config.fish  # Fish
```

**Usage:**

```bash
bb re<Tab>        # → bb repo
bb repo cl<Tab>   # → bb repo clone
bb pr l<Tab>      # → bb pr list
```

---

## Global Options

These options work with any command:

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON for scripting |
| `-w, --workspace <workspace>` | Specify the workspace (overrides default) |
| `-r, --repo <repo>` | Specify the repository (overrides default) |
| `-h, --help` | Show help information |
| `-v, --version` | Show version number |

---

## Authentication Setup

The CLI uses **Bitbucket App Passwords** for secure authentication. Here's how to set it up:

### Step 1: Create an App Password

1. Go to [Bitbucket App Passwords](https://bitbucket.org/account/settings/app-passwords/)
2. Click **"Create app password"**
3. Enter a descriptive label (e.g., "bb CLI")
4. Select the required permissions:
   - **Account:** Read
   - **Repositories:** Read, Write, Admin (as needed)
   - **Pull requests:** Read, Write
5. Click **"Create"**
6. **Copy the generated password** (you won't see it again!)

### Step 2: Authenticate

```bash
bb auth login
```

Enter your Bitbucket username and the App Password when prompted.

### Step 3: Verify

```bash
bb auth status
```

---

## Configuration

Configuration files are stored in platform-specific locations:

| Platform | Location |
|----------|----------|
| **macOS / Linux** | `~/.config/bb/config.json` |
| **Windows** | `%APPDATA%\bb\config.json` |

### Available Settings

```bash
# Set your default workspace
bb config set workspace myworkspace

# Set your default repository
bb config set repo myrepo

# View all settings
bb config list
```

---

## Examples

### Daily Workflow

```bash
# Start your day: check open PRs assigned to you
bb pr list --state OPEN

# Review a specific PR
bb pr view 42

# Approve and merge
bb pr approve 42
bb pr merge 42
```

### Creating a Pull Request

```bash
# From your feature branch
bb pr create \
  --title "feat: Add user notifications" \
  --description "Implements real-time notifications using WebSockets" \
  --source feature/notifications \
  --destination main
```

### Scripting with JSON Output

```bash
# Get all open PRs as JSON for processing
bb pr list --state OPEN --json | jq '.[] | .title'

# List repos and filter by name
bb repo list --json | jq '.[] | select(.name | contains("api"))'
```

### Quick Repository Setup

```bash
# Create and clone a new repo in one flow
bb repo create my-new-project
bb repo clone myworkspace/my-new-project
cd my-new-project
```

---

## Development

Want to contribute or run locally? Here's how:

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

# Generate API client from OpenAPI spec
bun run generate:api
```

### Project Structure

```
bitbucket-cli/
├── src/
│   ├── commands/      # Command implementations
│   ├── core/          # Core utilities and base classes
│   └── index.ts       # Entry point
├── tests/             # Test files
├── docs/              # Documentation site (Astro)
└── specs/             # OpenAPI specifications
```

---

## Contributing

We welcome contributions from the community! Whether it's:

- Reporting bugs
- Suggesting new features
- Improving documentation
- Submitting pull requests

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun test`)
5. Commit with a descriptive message
6. Push and open a Pull Request

---

## Acknowledgments

- Inspired by [GitHub CLI (`gh`)](https://cli.github.com/) — the gold standard for repository CLIs
- Built with [Commander.js](https://github.com/tj/commander.js) for robust command parsing
- Uses the [Bitbucket Cloud REST API](https://developer.atlassian.com/cloud/bitbucket/rest/)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>
    Made with care by the community<br>
    <a href="https://github.com/0pilatos0/bitbucket-cli/issues">Report a Bug</a> ·
    <a href="https://github.com/0pilatos0/bitbucket-cli/issues">Request a Feature</a>
  </sub>
</p>
