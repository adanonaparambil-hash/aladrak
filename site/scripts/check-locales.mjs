import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const out = process.argv[2] ?? 'out';
const routes = ['', 'news/', 'careers/', 'hse/'];
for (const route of routes) {
  for (const locale of ['en', 'ar']) {
    const prefix = locale === 'ar' ? 'ar/' : '';
    const html = readFileSync(join(out, prefix, route, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`));
    const anchor = html.match(/<a\b[^>]*data-language-switch[^>]*>/)?.[0];
    assert.ok(anchor, `Missing switch: ${prefix}${route}`);
    const expected = `${base}/${locale === 'ar' ? '' : 'ar/'}${route}`;
    assert.ok(anchor.includes(`href="${expected}"`), `Wrong switch target: ${anchor}`);
    for (const match of html.matchAll(/href="([^"?#]+)(?:[?#][^"]*)?"/g)) {
      if (!match[1].startsWith('/') || match[1].startsWith('//')) continue;
      const relative = match[1].slice(base.length).replace(/^\//, '');
      assert.ok(existsSync(join(out, relative)) || existsSync(join(out, relative, 'index.html')), `Missing link: ${match[1]}`);
    }
  }
}

// Test the actual helper, compiled in memory; no generated files in the source tree.
const require = createRequire(import.meta.url);
const context = { exports: {}, require: name => name === './translations.ar.json' ? require('../lib/translations.ar.json') : require(name) };
vm.runInNewContext(ts.transpileModule(readFileSync('lib/translate.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, context);
const { translateText: t, translateValue, translatePassage } = context.exports;
assert.equal(t('Projects', 'en'), 'Projects');
assert.equal(t('Projects', 'ar'), 'المشاريع');
assert.equal(t('  Projects  ', 'ar'), '  المشاريع  ');
assert.equal(t('info@aladrak.com', 'ar'), 'info@aladrak.com');
assert.equal(t('ISO 9001', 'ar'), 'ISO 9001');
assert.equal(t('Unknown future copy', 'ar'), 'Unknown future copy');
assert.equal(t('View Central Bank of Oman details', 'ar'), 'عرض تفاصيل البنك المركزي العُماني');
assert.equal(t('3 fields need attention.', 'ar'), 'يرجى مراجعة 3 حقول.');
assert.ok(t('For over 41 years, Al Adrak has shaped the skyline', 'ar').includes('41'));
assert.equal(translatePassage('Muscat, Barka. Civil Engineering', 'ar'), 'مسقط, بركاء. الهندسة المدنية');
const node = { key: 'project', type: 'span' };
assert.equal(translateValue(node, 'ar'), node);
console.log('Language checks passed: eight routes, SSR direction, counterpart links, internal links and translation behavior.');
