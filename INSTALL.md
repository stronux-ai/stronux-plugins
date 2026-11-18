# Install the Stronux plugin

The plugin has two parts: the **connection** to Stronux and the **skills** that tell Claude where each thing goes (courses, guides, services, bundles and space links). Claude never deletes anything and only publishes when you say yes.

> The plugin connects to Stronux (`https://stronux.com/api/mcp`). You need an owner account of an academy in Stronux to connect.

## Claude Code

1. Add the marketplace:

   ```
   /plugin marketplace add stronux-ai/stronux-plugins
   ```

   (or `claude plugin marketplace add stronux-ai/stronux-plugins` in a terminal)

   Two ways, same result. **In a terminal** (installs directly): `claude plugin marketplace add ...` and `claude plugin install stronux@stronux`. **Inside a Claude Code session**: `/plugin marketplace add ...` and `/plugin install stronux@stronux` open a panel where you confirm the install.

2. Install the plugin:

   ```
   claude plugin install stronux@stronux
   ```

3. Run `/mcp`, choose `stronux` and **Authenticate**. The Stronux login opens in your browser; when you come back it says connected.
4. Open Claude Code in the folder with your material and ask: *"Read this folder and tell me how it would look in Stronux, without creating anything."*

**Update:** `claude plugin update stronux@stronux`. **Disconnect:** "Clear authentication" in `/mcp`.

**If `/mcp` does not use the Stronux client automatically**, add the server by hand:

```
claude mcp add --transport http stronux https://stronux.com/api/mcp --client-id stronux-claude-prod --callback-port 47821 --scope user
```

If you already added a server with the same URL by hand, Claude Code may hide the plugin's copy: use one of the two.

## Claude Desktop

1. **Skills:** Customize → Plugins → Add → upload the `plugins/stronux` folder as a `.zip`, or add the GitHub marketplace `stronux-ai/stronux-plugins`.
2. **Connection:** Customize → Connectors → Add custom connector. URL `https://stronux.com/api/mcp`; under "Use your own OAuth client" (Advanced settings) enter the OAuth Client ID `stronux-claude-prod` and leave the secret empty. Add, Connect, and sign in to Stronux. Connector authentication settings cannot be edited: to change them, remove the connector and add it again.
3. Give Claude access to the folder with your material and make the same first request.

Availability of custom connectors depends on your Claude plan (the Free plan allows one).

## Notes

- The client ID is public (a PKCE client with no secret). No secret is stored in this repository.
- Files and images are uploaded with `curl` to a signed URL that Stronux gives Claude, so Claude needs permission to run `curl` in your folder.

## Legal

- Privacy policy: https://stronux.com/privacy-policy
- Terms of service: https://stronux.com/terms-of-service
