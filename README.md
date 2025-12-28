# Bitbucket CLI (`bb`)

A command-line interface for Bitbucket Cloud, inspired by GitHub's `gh` CLI.

## Installation

```bash
# Using bun
bun install -g bitbucket-cli

# Using npm
npm install -g bitbucket-cli
```

## Quick Start

```bash
# Authenticate with Bitbucket
bb auth login

# Clone a repository
bb repo clone myworkspace/myrepo

# List pull requests
bb pr list

# Create a pull request
bb pr create --title "My PR" --source feature-branch --destination main
```

## Commands

### Authentication
- `bb auth login` - Authenticate with Bitbucket
- `bb auth logout` - Log out of Bitbucket
- `bb auth status` - Show authentication status
- `bb auth token` - Print the current access token

### Repositories
- `bb repo clone <repo>` - Clone a repository
- `bb repo create <name>` - Create a new repository
- `bb repo list` - List repositories
- `bb repo view [repo]` - View repository details
- `bb repo delete <repo>` - Delete a repository

### Pull Requests
- `bb pr create` - Create a pull request
- `bb pr list` - List pull requests
- `bb pr view <id>` - View pull request details
- `bb pr merge <id>` - Merge a pull request
- `bb pr approve <id>` - Approve a pull request
- `bb pr decline <id>` - Decline a pull request
- `bb pr checkout <id>` - Checkout a pull request locally

### Configuration
- `bb config get <key>` - Get a config value
- `bb config set <key> <value>` - Set a config value
- `bb config list` - List all config values

### Shell Completion
- `bb completion install` - Install shell completions
- `bb completion uninstall` - Uninstall shell completions

## Shell Completion

Enable tab completion for bash, zsh, or fish:

```bash
# Install completions (auto-detects your shell)
bb completion install

# Restart your shell or source your profile
source ~/.bashrc  # or ~/.zshrc, ~/.config/fish/config.fish
```

After installation, press `Tab` to autocomplete commands:

```bash
bb re<Tab>     # completes to "bb repo"
bb repo cl<Tab> # completes to "bb repo clone"
```

## Global Options

- `--json` - Output as JSON
- `-w, --workspace <workspace>` - Specify workspace
- `-r, --repo <repo>` - Specify repository
- `-h, --help` - Show help
- `-v, --version` - Show version

## Authentication

The CLI uses Bitbucket App Passwords for authentication. To create one:

1. Go to [Bitbucket App Passwords](https://bitbucket.org/account/settings/app-passwords/)
2. Click "Create app password"
3. Give it a name and select the required permissions
4. Copy the generated password
5. Run `bb auth login` and enter your username and app password

## Configuration

Configuration is stored in:
- **Linux/macOS**: `~/.config/bb/config.json`
- **Windows**: `%APPDATA%\bb\config.json`

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build
bun run build

# Run tests
bun test

# Generate API client from OpenAPI spec
bun run generate:api

# Run docs site locally
bun run docs:dev
```

## Documentation

Full documentation is available at the [docs site](./docs).

## License

MIT
