# Stronux plugins (Claude and ChatGPT)

This repo holds the Stronux plugin for Claude Code and Claude Desktop, and the package for the ChatGPT plugin. Both share one `skills/` folder and connect to the same Stronux MCP server.

## Stronux for Claude

A plugin for Claude Code and Claude Desktop that turns the files you already have into offers in your Stronux academy: courses, guides, services, bundles and space links.

- Claude reads your folder, shows you a plan and asks only what it cannot deduce.
- Everything is created as a draft. **Claude never deletes anything** and **only publishes when you say yes**.
- Claude does not generate content or images with AI: it organises and uploads what you already have.

## Install

```
/plugin marketplace add stronux-ai/stronux-plugins
/plugin install stronux@stronux
```

Or from a terminal, which installs directly:

```
claude plugin marketplace add stronux-ai/stronux-plugins
claude plugin install stronux@stronux
```

Full steps for Claude Code and Claude Desktop: [INSTALL.md](INSTALL.md).

The repo used to be called `stronux-ai/stronux-claude`; GitHub redirects the old name, but use `stronux-ai/stronux-plugins` in new commands. The install name `stronux@stronux` does not change.

### For the team: test against another environment

The plugin only ships the production connection. To try another environment, use the URL the team gives you (it is not stored in this repo) and add it by hand, without the plugin:

```
claude mcp add --transport http <name> <url> --scope user
```

Use a `<name>` other than `stronux` so it does not clash with the plugin's server, then `/mcp` -> Authenticate. If that environment asks for its own OAuth client, add `--client-id <client id the team gives you>`. Claude Code can expand `${VAR:-default}` in the `url` of a `.mcp.json`, but its docs do not list `oauth.clientId`, so the plugin does not use an env override.

## New in 1.4.0

- **Connects to stronux.com.** The plugin now points to production (`https://stronux.com/api/mcp`). After updating, run `/mcp` -> Authenticate again.
- **Several academies on one connection.** Claude starts by checking which academies you connected. If you have more than one, it asks in which to work (by name or handle, never by id) and does not mix them up. If one is not connected, it tells you how to add it.
- **"What is new" in the community.** Reading never marks anything. When Claude finishes reviewing everything new it can mark it as seen, so next time starts from there; the app may ask you to allow it.
- **Permission prompts.** When Claude changes something, the app may ask you to allow it first; the skills tell you once.
- The MCP now has 45 tools.

## Before, in 1.3.0

- `members` skill: invite people to your courses and to the team. Tools: `preview_member_invites`, `invite_members`, `describe_staff_roles`, `invite_staff`. Invitations send real emails, so Claude shows the list and asks for the yes first.
- `community` skill: see what is new in your communities, read a thread, and post or reply in the name of the owner. Tools: `list_community_activity`, `get_community_post`, `create_community_post`, `reply_in_community`. Posting and replying need your yes on the exact text.
- The MCP now has 44 tools and the plugin 9 skills. Claude still never deletes, hides or moderates anything.


## Stronux for ChatGPT

The same plugin for ChatGPT lives next to the Claude one in `plugins/stronux/`, with files ChatGPT reads and Claude ignores:

- `plugin.json` and `mcp.json` at the plugin root: the listing (name, descriptions, default prompts, review test cases) and the connection (OAuth with a client ID metadata document, no secrets).
- `assets/logo.png`: the logo.
- `skills/`: the same folder Claude uses, written without naming any client. `skills/files-from-folder` is **Claude only** (it reads local folders and uploads files with `curl`) and is listed in `chatgpt-exclude.txt`, so it is not in the ChatGPT ZIP. In ChatGPT the person uploads files in Stronux.

Claude reads `.claude-plugin/plugin.json` and `.mcp.json`; ChatGPT reads `plugin.json` and `mcp.json`. The names do not clash, and `claude plugin validate --strict` accepts both side by side.

### Build the ChatGPT ZIP

No dependencies, Node 22 or later:

```
node scripts/build-chatgpt-zip.mjs
```

This validates the package and writes `dist/stronux-chatgpt.zip` (`dist/` is git-ignored) with only `plugin.json`, `mcp.json`, `assets/` and `skills/` minus `chatgpt-exclude.txt`. It fails if a JSON file does not parse, a limit is exceeded (display name and short description 30 characters, long description 4000, default prompts 3 of 128, exactly 5 positive and 3 negative test cases), a test case names a tool the MCP does not have, a forbidden key appears (`clientSecret`, `test_credentials`, `reviewer_instructions`, non-empty `headers`, `apps`, hooks) or `review.demo_recording_url` is still `TODO`. While the demo recording does not exist, `--allow-draft` builds anyway (CI uses it); never upload that ZIP. The owner uploads the ZIP in OpenAI's **Upload plugin** screen. Each change to the metadata or the skills is a new ZIP with a new `version` in `plugin.json`.

## What is inside

| Path | What |
|---|---|
| `.claude-plugin/marketplace.json` | The `stronux` marketplace |
| `plugins/stronux/.mcp.json` | Connection to the Stronux MCP server (Claude) |
| `plugins/stronux/plugin.json`, `mcp.json`, `assets/` | The ChatGPT listing, connection and logo |
| `plugins/stronux/chatgpt-exclude.txt` | Skills left out of the ChatGPT ZIP |
| `plugins/stronux/skills/` | `get-started`, `setup-offers`, `course`, `guide`, `service`, `bundle`, `space-link`, `stats`, `members`, `community` (shared) and `files-from-folder` (Claude only) |
| `scripts/build-chatgpt-zip.mjs` | Validates and builds `dist/stronux-chatgpt.zip` |
| `tests/` | Checks run in CI with `claude plugin validate --strict` |

## Legal

[Privacy policy](https://stronux.com/privacy-policy) · [Terms of service](https://stronux.com/terms-of-service) · MIT, see [LICENSE](LICENSE).
