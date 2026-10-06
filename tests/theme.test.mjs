import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/theme.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { normalizeTheme, resolveTheme, themeInitScript } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('invalid, missing, and legacy system preferences default to light', () => {
  for (const value of [null, '', 'invalid', 'DARK', 'system']) assert.equal(normalizeTheme(value), 'light');
  for (const value of ['light', 'dark']) assert.equal(normalizeTheme(value), value);
});

test('explicit light and dark choices are used directly', () => {
  assert.equal(resolveTheme('light'), 'light');
  assert.equal(resolveTheme('dark'), 'dark');
});

function boot(stored, blocked = false) {
  const classes = new Set();
  const root = { dataset: {}, style: {}, classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } } };
  vm.runInNewContext(themeInitScript, {
    document: { documentElement: root },
    localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return stored; } },
  });
  return { root, dark: classes.has('dark') };
}

test('bootstrap applies saved theme and native control scheme before hydration', () => {
  const { root, dark } = boot('dark');
  assert.equal(dark, true);
  assert.equal(root.style.colorScheme, 'dark');
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(boot('light').dark, false);
});

test('bootstrap defaults to light when storage is absent, invalid, legacy, or blocked', () => {
  assert.equal(boot(null).dark, false);
  assert.equal(boot('invalid').dark, false);
  assert.equal(boot('system').dark, false);
  assert.equal(boot(null, true).dark, false);
});
