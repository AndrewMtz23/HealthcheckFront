import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/theme.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { normalizeTheme, resolveTheme, themeInitScript } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('invalid or missing preferences follow the system', () => {
  for (const value of [null, '', 'invalid', 'DARK']) assert.equal(normalizeTheme(value), 'system');
  for (const value of ['light', 'dark', 'system']) assert.equal(normalizeTheme(value), value);
});

test('explicit choice overrides system preference', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
});

function boot(stored, systemDark, blocked = false) {
  const classes = new Set();
  const root = { dataset: {}, style: {}, classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } } };
  vm.runInNewContext(themeInitScript, {
    document: { documentElement: root },
    localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return stored; } },
    window: { matchMedia: () => ({ matches: systemDark }) },
  });
  return { root, dark: classes.has('dark') };
}

test('bootstrap applies saved theme and native control scheme before hydration', () => {
  const { root, dark } = boot('dark', false);
  assert.equal(dark, true);
  assert.equal(root.style.colorScheme, 'dark');
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(boot('light', true).dark, false);
});

test('bootstrap follows system when storage is absent, invalid or blocked', () => {
  assert.equal(boot(null, true).dark, true);
  assert.equal(boot('invalid', true).dark, true);
  assert.equal(boot(null, true, true).dark, true);
  assert.equal(boot(null, false, true).dark, false);
});
