# Stronux for Claude

This plugin lets Claude set up your Stronux academy from the files you already have. Tell Claude what you want, in your own words, and it builds courses, guides, services, bundles and space links for you. Everything it creates starts as a draft. Claude never deletes anything, and it only publishes when you say yes.

## What is inside

- **The Stronux connection.** A remote MCP server at `https://stronux.com/api/mcp`. The plugin only talks to this address. You sign in with your Stronux account the first time (OAuth).
- **Nine skills:** `setup-offers`, `course`, `guide`, `service`, `bundle`, `space-link`, `stats`, `members` and `community`. They tell Claude where each thing goes and what to ask you first.

The plugin runs no scripts and fetches nothing else. Claude Code can upload files from a folder on your computer to Stronux when you ask it to.

## What you need

A Stronux account that owns an academy. Only the owner can connect it. If you own more than one academy, Claude asks which one to use.

## Install

In Claude Code:

```
/plugin marketplace add stronux-ai/stronux-plugins
/plugin install stronux@stronux
```

Then run `/mcp`, pick `stronux` and choose Authenticate.

## Try it

- "What offers do I have in my academy?"
- "Turn the notes in this folder into a draft course."
- "How many members joined this month?"

Setup guide: https://stronux.com/claude

Privacy policy: https://stronux.com/privacy-policy. Terms of service: https://stronux.com/terms-of-service. Support: https://stronux.com/contact. License: MIT.
