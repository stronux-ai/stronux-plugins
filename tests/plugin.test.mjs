import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../scripts/mcp-tools.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = join(root, 'plugins', 'stronux');
const skillsDir = join(plugin, 'skills');
const skills = readdirSync(skillsDir);

test('45 known tools', () => assert.equal(TOOLS.size, 45));

test('the eleven skills exist (nine of Claude + get-started + files-from-folder)', () => {
  assert.deepEqual([...skills].sort(), ['bundle', 'community', 'course', 'files-from-folder', 'get-started', 'guide', 'members', 'service', 'setup-offers', 'space-link', 'stats']);
});

test('frontmatter has only name and description', () => {
  for (const s of skills) {
    const text = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
    const m = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(m, `${s}: no frontmatter`);
    const keys = m[1].split('\n').filter((l) => /^[A-Za-z-]+:/.test(l)).map((l) => l.split(':')[0]);
    assert.deepEqual(keys, ['name', 'description'], s);
    assert.match(m[1], new RegExp(`^name: ${s}$`, 'm'));
  }
});

test('tool names in backticks exist', () => {
  const toolLike = /^(whoami|(?:create|add|update|set|get|list|prepare|attach|publish|show|reorder|preview|invite|describe)_[a-z_]+|mark_community_seen)$/;
  for (const s of skills) {
    const text = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8');
    for (const [, name] of text.matchAll(/`([a-z_]+)`/g)) {
      if (!toolLike.test(name) || name === 'publish_enabled' || name === 'set_password' || name === 'invite_failed') continue; // publish_enabled is a whoami field; set_password is an email_sent value; invite_failed is an error code
      assert.ok(TOOLS.has(name), `${s}: unknown tool ${name}`);
    }
  }
});

test('every skill carries the whoami and space_id rule; community marks with mark_token; no marked_read', () => {
  for (const s of skills) {
    const text = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8');
    // get-started only calls whoami (no other tool), so it has no space_id to pass.
    assert.ok(text.includes('`whoami`') && (s === 'get-started' || text.includes('`space_id`')), `${s}: needs whoami and space_id`);
    assert.ok(!text.includes('marked_read'), `${s}: marked_read is gone`);
  }
  const community = readFileSync(join(skillsDir, 'community', 'SKILL.md'), 'utf8');
  assert.ok(community.includes('mark_community_seen') && community.includes('mark_token'));
  const setup = readFileSync(join(skillsDir, 'setup-offers', 'SKILL.md'), 'utf8');
  for (const e of ['space_choice_required', 'space_not_connected', 'space_mismatch']) assert.ok(setup.includes(e), e);
});

test('forbidden words', () => {
  for (const s of skills) {
    const text = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8');
    for (const w of ['delete_', 'remove_', 'unpublish', 'acceptOverage', 'isPublished', 'image_base64', 'base64']) {
      assert.ok(!text.includes(w), `${s}: contains ${w}`);
    }
  }
});

test('.mcp.json points to production with the public client', () => {
  const mcp = JSON.parse(readFileSync(join(plugin, '.mcp.json'), 'utf8'));
  const srv = mcp.mcpServers.stronux;
  assert.equal(srv.type, 'http');
  assert.equal(srv.url, 'https://stronux.com/api/mcp');
  assert.deepEqual(srv.oauth, { clientId: 'stronux-claude-prod', callbackPort: 47821 });
  assert.deepEqual(Object.keys(srv).sort(), ['oauth', 'type', 'url']);
});

test('nothing from a test environment ships in the repo', () => {
  // Patterns are built from pieces so this file does not trip itself.
  const banned = [['demo', '.stronux.com'].join(''), ['2ur8s3rhp028e4hc', '8rp9e0r4rp'].join(''), ['stag', 'ing'].join('')];
  const files = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(root);
  for (const f of files) {
    const text = readFileSync(f, 'utf8').toLowerCase();
    for (const w of banned) assert.ok(!text.includes(w), `${f}: contains ${w}`);
  }
});

test('plugin contains only the Claude files, the ChatGPT files and skills (D1)', () => {
  assert.deepEqual(readdirSync(plugin).sort(), ['.claude-plugin', '.mcp.json', 'LICENSE', 'README.md', 'assets', 'chatgpt-exclude.txt', 'icon.png', 'mcp.json', 'plugin.json', 'skills']);
  for (const d of ['commands', 'agents', 'hooks', 'bin']) assert.ok(!existsSync(join(plugin, d)), d);
});

test('manifests', () => {
  const p = JSON.parse(readFileSync(join(plugin, '.claude-plugin', 'plugin.json'), 'utf8'));
  const m = JSON.parse(readFileSync(join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.equal(p.name, 'stronux');
  assert.equal(m.name, 'stronux');
  assert.equal(m.plugins[0].name, 'stronux');
  assert.equal(m.plugins[0].source, './plugins/stronux');
  assert.ok(!('version' in m.plugins[0]), 'version only in plugin.json');
});

test('directory listing fields (icon, URLs, version) and README/LICENSE in the plugin folder', () => {
  const p = JSON.parse(readFileSync(join(plugin, '.claude-plugin', 'plugin.json'), 'utf8'));
  assert.match(p.version, /^\d+\.\d+\.\d+$/);
  assert.equal(p.homepage, 'https://stronux.com/claude');
  assert.equal(p.documentationUrl, 'https://stronux.com/claude');
  assert.ok(existsSync(join(plugin, p.icon)), 'icon file exists');
  for (const k of ['supportUrl', 'privacyPolicyUrl', 'termsOfServiceUrl']) assert.match(p[k], /^https:\/\//, k);
  assert.ok(p.author && p.author.name);
  const readme = readFileSync(join(plugin, 'README.md'), 'utf8').replace(/```[\s\S]*?```/g, '');
  assert.ok(readme.split(/\s+/).filter(Boolean).length >= 40, 'README has 40+ words outside code blocks');
  assert.ok(existsSync(join(plugin, 'LICENSE')));
});
