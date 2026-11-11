#!/usr/bin/env node
// Builds dist/stronux-chatgpt.zip for the ChatGPT plugin upload. No dependencies.
//   node scripts/build-chatgpt-zip.mjs [--allow-draft] [--out <file>]
// --allow-draft builds even when review.demo_recording_url is still "TODO" (never upload that ZIP).
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deflateRawSync } from 'node:zlib';
import { TOOLS } from './mcp-tools.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const pluginDir = join(root, 'plugins', 'stronux');

const FORBIDDEN_KEYS = ['clientSecret', 'test_credentials', 'reviewer_instructions'];

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

function walkKeys(obj, fn, path = '') {
  if (Array.isArray(obj)) return obj.forEach((v, i) => walkKeys(v, fn, `${path}[${i}]`));
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) { fn(k, v, `${path}.${k}`); walkKeys(v, fn, `${path}.${k}`); }
  }
}

export function excludedSkills(dir = pluginDir) {
  const f = join(dir, 'chatgpt-exclude.txt');
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

// Returns the list of problems (empty when the package is valid).
export function validate(dir = pluginDir, { allowDraft = false } = {}) {
  const errors = [];
  const err = (m) => errors.push(m);
  let plugin, mcp;
  try { plugin = readJson(join(dir, 'plugin.json')); } catch (e) { return [`plugin.json: ${e.message}`]; }
  try { mcp = readJson(join(dir, 'mcp.json')); } catch (e) { return [`mcp.json: ${e.message}`]; }

  for (const [name, doc] of [['plugin.json', plugin], ['mcp.json', mcp]]) {
    walkKeys(doc, (k, v, p) => {
      if (FORBIDDEN_KEYS.includes(k)) err(`${name}${p}: forbidden key ${k}`);
      if (k === 'headers' && v && Object.keys(v).length) err(`${name}${p}: non-empty headers`);
    });
  }
  if ('apps' in plugin || (plugin.extensions && 'apps' in plugin.extensions)) err('plugin.json: apps are not allowed');
  if ('hooks' in plugin) err('plugin.json: hooks are not allowed');
  for (const bad of ['hooks', '.app.json', 'apps']) if (existsSync(join(dir, bad))) err(`${bad} must not exist in the plugin`);

  if (plugin.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') err('plugin.json: $schema');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(plugin.name || '') || plugin.name.length > 64) err('plugin.json: name must be lowercase with hyphens, up to 64');
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version || '')) err('plugin.json: version must be explicit semver');

  const oa = plugin.extensions?.['com.openai'];
  const ui = oa?.interface;
  if (!ui) err('plugin.json: extensions.com.openai.interface missing');
  else {
    if (!ui.displayName || ui.displayName.length > 30) err('displayName must be 1-30 characters');
    if (!ui.shortDescription || ui.shortDescription.length > 30) err('shortDescription must be 1-30 characters');
    if (!ui.longDescription || ui.longDescription.length > 4000) err('longDescription must be 1-4000 characters');
    if (!Array.isArray(ui.defaultPrompt) || ui.defaultPrompt.length < 1 || ui.defaultPrompt.length > 3) err('defaultPrompt must have 1-3 entries');
    else for (const p of ui.defaultPrompt) if (typeof p !== 'string' || !p || p.length > 128) err(`defaultPrompt entry over 128 characters or empty: ${String(p).slice(0, 30)}`);
    for (const k of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) if (!/^https:\/\//.test(ui[k] || '')) err(`${k} must be an https URL`);
    const logo = join(dir, ui.logo || 'missing');
    if (!existsSync(logo)) err(`logo not found: ${ui.logo}`);
    else {
      const b = readFileSync(logo);
      if (b.length > 5 * 1024 * 1024) err('logo over 5 MiB');
      if (b.slice(1, 4).toString() === 'PNG') {
        const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
        if (w !== h || w < 48) err(`logo must be square and at least 48x48 (is ${w}x${h})`);
      }
    }
  }
  const tc = oa?.review?.test_cases;
  if (!tc || tc.positive?.length !== 5) err('review.test_cases.positive must have exactly 5 cases');
  if (!tc || tc.negative?.length !== 3) err('review.test_cases.negative must have exactly 3 cases');
  for (const c of [...(tc?.positive || []), ...(tc?.negative || [])]) if (!c.description || !c.prompt) err('every test case needs description and prompt');
  for (const c of tc?.positive || []) {
    if (!c.expected_behavior) err(`positive case without expected_behavior: ${c.prompt}`);
    if (typeof c.tools_triggered !== 'string' || !c.tools_triggered.trim()) err(`positive case without tools_triggered (must be a string): ${c.prompt}`);
    for (const t of toolList(c.tools_triggered)) if (!TOOLS.has(t)) err(`test case names an unknown tool: ${t}`);
  }
  if (oa?.review?.demo_recording_url === 'TODO' && !allowDraft) err('review.demo_recording_url is still "TODO"');
  if (oa && !oa.onboardingSkill) err('onboardingSkill missing');
  else if (oa) {
    const rel = oa.onboardingSkill.replace(/^\.\//, '');
    const skill = rel.split('/')[1];
    if (excludedSkills(dir).includes(skill)) err('onboardingSkill is excluded from the ZIP');
    if (!existsSync(join(dir, rel))) err(`onboardingSkill not found: ${rel}`);
  }

  const servers = Object.entries(mcp.mcpServers || {});
  if (servers.length !== 1) err('mcp.json: exactly one server is required');
  else {
    const [, s] = servers[0];
    if (s.type !== 'streamable-http') err('mcp.json: type must be streamable-http');
    if (!/^https:\/\//.test(s.url || '')) err('mcp.json: url must be https');
    const auth = s.extensions?.['com.openai']?.auth;
    if (!auth || auth.type !== 'oauth') err('mcp.json: oauth auth is required');
  }

  const skillsDir = join(dir, 'skills');
  const excluded = excludedSkills(dir);
  for (const x of excluded) if (!existsSync(join(skillsDir, x))) err(`chatgpt-exclude.txt names a missing skill: ${x}`);
  for (const s of readdirSync(skillsDir).filter((d) => !excluded.includes(d))) {
    const text = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
    const m = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!m) { err(`${s}: no frontmatter`); continue; }
    if (!new RegExp(`^name: ${s}$`, 'm').test(m[1]) || !/^description: \S/m.test(m[1])) err(`${s}: frontmatter needs name (= folder) and description`);
    if (/chatgpt|claude|\/mcp|curl/i.test(text)) err(`${s}: shared skills must not name a client, /mcp or curl`);
  }
  return errors;
}

// Files that go in the ZIP, as posix paths relative to the plugin folder.
export function zipFileList(dir = pluginDir) {
  const excluded = excludedSkills(dir);
  const out = ['plugin.json', 'mcp.json'];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p); else out.push(relative(dir, p).split(sep).join('/'));
    }
  };
  walk(join(dir, 'assets'));
  for (const s of readdirSync(join(dir, 'skills')).sort()) if (!excluded.includes(s)) walk(join(dir, 'skills', s));
  return out;
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

// Minimal deterministic ZIP writer (deflate, fixed timestamp 2026-01-01).
export function makeZip(entries) {
  const DOS_TIME = 0, DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  const locals = [], central = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const comp = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(DOS_TIME, 10); lh.writeUInt16LE(DOS_DATE, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nameBuf.length, 26);
    locals.push(lh, nameBuf, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(DOS_TIME, 12); ch.writeUInt16LE(DOS_DATE, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

export function build({ dir = pluginDir, out = join(root, 'dist', 'stronux-chatgpt.zip'), allowDraft = false } = {}) {
  const errors = validate(dir, { allowDraft });
  if (errors.length) return { errors };
  const files = zipFileList(dir);
  const zip = makeZip(files.map((name) => ({ name, data: readFileSync(join(dir, name)) })));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, zip);
  return { errors: [], files, out, size: statSync(out).size };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = process.argv.slice(2);
  const oi = args.indexOf('--out');
  const res = build({ allowDraft: args.includes('--allow-draft'), ...(oi >= 0 ? { out: args[oi + 1] } : {}) });
  if (res.errors.length) {
    console.error('ChatGPT ZIP not built:\n' + res.errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`Built ${res.out} (${res.size} bytes)\n` + res.files.map((f) => `  ${f}`).join('\n'));
  if (args.includes('--allow-draft')) console.log('\nDRAFT build (--allow-draft): do not upload this ZIP.');
}

function toolList(s) {
  return String(s).split(',').map((x) => x.trim()).filter(Boolean);
}
