import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../scripts/mcp-tools.mjs';
import { validate, zipFileList, excludedSkills, makeZip } from '../scripts/build-chatgpt-zip.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = join(root, 'plugins', 'stronux');
const skillsDir = join(plugin, 'skills');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

test('the ChatGPT package validates (draft mode allows demo_recording_url TODO)', () => {
  assert.deepEqual(validate(plugin, { allowDraft: true }), []);
});

test('mcp.json for ChatGPT points to production with one server and CIMD', () => {
  const mcp = readJson(join(plugin, 'mcp.json'));
  assert.deepEqual(Object.keys(mcp.mcpServers), ['stronux']);
  const s = mcp.mcpServers.stronux;
  assert.equal(s.type, 'streamable-http');
  assert.equal(s.url, 'https://stronux.com/api/mcp');
  assert.equal(s.extensions['com.openai'].auth.client.mode, 'cimd');
  assert.ok(!('headers' in s));
});

test('plugin.json for ChatGPT keeps the field limits and the 5 + 3 test cases', () => {
  const oa = readJson(join(plugin, 'plugin.json')).extensions['com.openai'];
  const ui = oa.interface;
  assert.ok(ui.displayName.length <= 30 && ui.shortDescription.length <= 30 && ui.longDescription.length <= 4000);
  assert.ok(ui.defaultPrompt.length <= 3 && ui.defaultPrompt.every((p) => p.length <= 128));
  assert.equal(oa.review.test_cases.positive.length, 5);
  assert.equal(oa.review.test_cases.negative.length, 3);
  for (const c of oa.review.test_cases.positive) for (const tool of c.tools_triggered.split(",").map((x) => x.trim())) assert.ok(TOOLS.has(tool), tool);
});

test('validate rejects forbidden keys, bad limits, wrong case counts and unknown tools', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'stronux-plugin-'));
  try {
    cpSync(plugin, tmp, { recursive: true });
    const mutate = (fn) => {
      const p = readJson(join(plugin, 'plugin.json'));
      fn(p.extensions['com.openai'], p);
      writeFileSync(join(tmp, 'plugin.json'), JSON.stringify(p));
      return validate(tmp, { allowDraft: true }).join(' | ');
    };
    assert.deepEqual(validate(tmp, { allowDraft: true }), []);
    assert.match(validate(tmp).join(' | '), /demo_recording_url/, 'a TODO demo URL blocks a real build');
    assert.match(mutate((o) => { o.interface.shortDescription = 'x'.repeat(31); }), /shortDescription/);
    assert.match(mutate((o) => { o.interface.displayName = 'x'.repeat(31); }), /displayName/);
    assert.match(mutate((o) => { o.interface.longDescription = 'x'.repeat(4001); }), /longDescription/);
    assert.match(mutate((o) => { o.interface.defaultPrompt = ['x'.repeat(129)]; }), /defaultPrompt/);
    assert.match(mutate((o) => { o.interface.defaultPrompt = ['a', 'b', 'c', 'd']; }), /defaultPrompt/);
    assert.match(mutate((o) => { o.review.test_cases.positive.pop(); }), /exactly 5/);
    assert.match(mutate((o) => { o.review.test_cases.negative.pop(); }), /exactly 3/);
    assert.match(mutate((o) => { o.review.test_cases.positive[0].tools_triggered = 'delete_course'; }), /unknown tool/);
    assert.match(mutate((o) => { o.review.test_credentials = {}; }), /test_credentials/);
    assert.match(mutate((o) => { o.review.reviewer_instructions = 'x'; }), /reviewer_instructions/);
    assert.match(mutate((o, p) => { p.apps = []; }), /apps/);
    assert.match(mutate((o, p) => { p.hooks = {}; }), /hooks/);
    writeFileSync(join(tmp, 'plugin.json'), readFileSync(join(plugin, 'plugin.json')));
    const m = readJson(join(plugin, 'mcp.json'));
    m.mcpServers.stronux.extensions['com.openai'].auth.clientSecret = 'x';
    writeFileSync(join(tmp, 'mcp.json'), JSON.stringify(m));
    assert.match(validate(tmp, { allowDraft: true }).join(' | '), /clientSecret/);
    delete m.mcpServers.stronux.extensions['com.openai'].auth.clientSecret;
    m.mcpServers.stronux.headers = { Authorization: 'x' };
    writeFileSync(join(tmp, 'mcp.json'), JSON.stringify(m));
    assert.match(validate(tmp, { allowDraft: true }).join(' | '), /headers/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('the ChatGPT ZIP list has only plugin.json, mcp.json, assets and the shared skills', () => {
  const files = zipFileList(plugin);
  assert.deepEqual(excludedSkills(plugin), ['files-from-folder']);
  assert.ok(files.includes('plugin.json') && files.includes('mcp.json') && files.includes('assets/logo.png'));
  assert.ok(files.includes('skills/get-started/SKILL.md'));
  for (const f of files) {
    assert.ok(/^(plugin\.json|mcp\.json|assets\/|skills\/)/.test(f), f);
    assert.ok(!f.startsWith('skills/files-from-folder'), f);
  }
  assert.equal(readdirSync(skillsDir).length - 1, files.filter((f) => f.endsWith('SKILL.md')).length);
});

test('shared skills name no client and no curl; files-from-folder is the only Claude-only skill', () => {
  for (const s of readdirSync(skillsDir)) {
    const text = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8');
    if (s === 'files-from-folder') {
      assert.ok(/curl -X PUT/.test(text) && /\/mcp/.test(text), 'keeps the curl uploads and the Claude connection notes');
    } else {
      assert.ok(!/chatgpt|claude|\/mcp|curl/i.test(text), `${s}: shared skill names a client or curl`);
    }
  }
});

test('Claude keeps its upload steps: files-from-folder carries every upload tool and the others point to it', () => {
  const text = readFileSync(join(skillsDir, 'files-from-folder', 'SKILL.md'), 'utf8');
  for (const t of ['create_lesson_video_upload', 'get_lesson_video_status', 'prepare_material_upload', 'attach_material', 'prepare_guide_upload', 'prepare_image_upload', 'set_course_cover', 'set_section_cover', 'set_offer_cover', 'create_space_link', 'set_cover_framing', 'get_cover']) {
    assert.ok(text.includes('`' + t + '`'), t);
  }
  for (const s of ['course', 'guide', 'service', 'bundle', 'space-link', 'setup-offers']) {
    assert.ok(readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8').includes('files-from-folder'), `${s} points to files-from-folder`);
  }
});

test('makeZip writes a readable archive', () => {
  const zip = makeZip([{ name: 'a.txt', data: Buffer.from('hello') }]);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
});

test('.gitignore ignores dist/', () => {
  assert.match(readFileSync(join(root, '.gitignore'), 'utf8'), /^dist\/$/m);
});
