'use strict';

const Module = require('module');

const {test, stub} = require('supertape');
const tryCatch = require('try-catch');
const mockRequire = require('mock-require');
const putout = require('putout');
const montag = require('montag');

const {readFixtures} = require('./fixture');
const {loadPlugins, babelPlugin} = require('..');

const {reRequire, stopAll} = mockRequire;
const fixture = readFixtures([
    'shebang',
    'shebang-fix',
    'babel-plugin',
    'babel-plugin-fix',
    'babel-plugin-angularjs-annotate',
    'babel-plugin-angularjs-annotate-fix',
    'babel-plugin-namespace',
    'babel-plugin-namespace-fix',
    'babel-plugin-no-change',
    'babel-plugin-no-change-fix',
]);

test('putout: loader: user plugin', (t) => {
    const {_findPath} = Module;
    const rmVars = 'remove-unused-variables';
    
    const rmUnusedVars = require(`@putout/plugin-${rmVars}`);
    
    mockRequire(`@putout/plugin-${rmVars}`, null);
    mockRequire(`putout-plugin-${rmVars}`, rmUnusedVars);
    
    reRequire('..');
    const putout = reRequire('putout');
    
    Module._findPath = stub((name, paths) => {
        if (!name.indexOf(`@putout/plugin-${rmVars}`))
            return false;
        
        if (name === `putout-plugin-${rmVars}`) {
            return name;
        }
        
        return _findPath(name, paths);
    });
    
    const {code} = putout(`const t = 'hello'`, {
        loadPlugins,
        plugins: [rmVars],
    });
    
    stopAll();
    Module._findPath = _findPath;
    
    t.equal(code, '\n');
    t.end();
});

test('putout: loader: can not find', (t) => {
    const [e] = tryCatch(putout, `const t = 'hello'`, {
        plugins: ['xxx'],
    });
    
    const expected = 'Plugin "putout-plugin-xxx" could not be found!';
    
    t.equal(e.message, expected);
    t.end();
});

test('putout: loader: function', (t) => {
    const rmVars = 'remove-unused-variables';
    const rmVarsPlugin = require(`@putout/plugin-${rmVars}`);
    
    mockRequire(`@putout/plugin-${rmVars}`, null);
    
    reRequire('..');
    const putout = reRequire('putout');
    
    const {code} = putout(`const t = 'hello'`, {
        plugins: [{
            [rmVars]: rmVarsPlugin,
        }],
    });
    
    stopAll();
    
    t.equal(code, '\n');
    t.end();
});

test('putout: loader: function: rules', (t) => {
    const rmVars = 'remove-unused-variables';
    const rmVarsPlugin = require(`@putout/plugin-${rmVars}`);
    
    mockRequire(`@putout/plugin-${rmVars}`, null);
    
    reRequire('..');
    const putout = reRequire('putout');
    
    const {code} = putout(`const t = 'hello'`, {
        plugins: [{
            'brand-new-rule': {
                rules: {
                    [rmVars]: rmVarsPlugin,
                },
            },
        }],
    });
    
    stopAll();
    
    t.equal(code, '\n');
    t.end();
});

test('putout: loader: disabled rule', (t) => {
    const rmVars = 'remove-unused-variables';
    const rmVarsPlugin = require(`@putout/plugin-${rmVars}`);
    
    mockRequire(`@putout/plugin-${rmVars}`, null);
    
    reRequire('..');
    const putout = reRequire('putout');
    
    const {code} = putout(`const t = 'hello'`, {
        rules: {
            [rmVars]: false,
        },
        plugins: [{
            [rmVars]: rmVarsPlugin,
        }],
    });
    
    stopAll();
    
    t.equal(code, `const t = 'hello';\n`);
    t.end();
});

test('putout: loader: disabled rule from multi rule plugin', (t) => {
    const source = `montag
        const t = async () => {
            return 'hello'
        }
    `;
    
    const {places} = putout(source, {
        fix: false,
        rules: {
            'promises/remove-useless-async': 'off',
            'promises/remove-useless-resolve': 'on',
        },
        plugins: ['promises'],
    });
    
    const expected = [];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: loader: plugins: array', (t) => {
    const rmVars = 'remove-unused-variables';
    const rmVarsPlugin = require(`@putout/plugin-${rmVars}`);
    
    mockRequire(`@putout/plugin-${rmVars}`, null);
    
    reRequire('..');
    const putout = reRequire('putout');
    
    const {code} = putout(`const t = 'hello'`, {
        rules: {
            [rmVars]: false,
        },
        plugins: [
            ['remove-unused-variables', rmVarsPlugin],
        ],
    });
    
    stopAll();
    
    t.equal(code, `const t = 'hello';\n`);
    t.end();
});

test('putout: loader: babelPlugins', (t) => {
    const {code} = putout(fixture.babelPlugin, {
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    t.deepEqual(code, fixture.babelPluginFix);
    t.end();
});

test('putout: loader: babelPlugin: implimintation', (t) => {
    const plugin = require('babel-plugin-transform-inline-consecutive-adds');
    
    const {code} = putout(fixture.babelPlugin, {
        plugins: [
            ['babel/transform-inline-consecutive-adds', babelPlugin(plugin)],
        ],
    });
    
    t.deepEqual(code, fixture.babelPluginFix);
    t.end();
});

test('putout: loader: babelPlugins: angularjs annotate', (t) => {
    const {code} = putout(fixture.babelPluginAngularjsAnnotate, {
        plugins: ['babel/angularjs-annotate'],
    });
    
    t.deepEqual(code, fixture.babelPluginAngularjsAnnotateFix);
    t.end();
});

test('putout: loader: babelPlugins: namespace', (t) => {
    const {code} = putout(fixture.babelPluginNamespace, {
        loadPlugins,
        plugins: ['babel/codemod-object-assign-to-object-spread'],
    });
    
    t.deepEqual(code, fixture.babelPluginNamespaceFix);
    t.end();
});

test('putout: loader: babelPlugins: namespace: no change', (t) => {
    const {code} = putout(fixture.babelPluginNoChange, {
        loadPlugins,
        plugins: ['babel/codemod-object-assign-to-object-spread'],
    });
    
    t.deepEqual(code, fixture.babelPluginNoChangeFix);
    t.end();
});

test('putout: loader: babelPlugins: espree', (t) => {
    const {code} = putout(fixture.babelPlugin, {
        parser: 'espree',
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    t.deepEqual(code, fixture.babelPluginFix);
    t.end();
});

test('putout: loader: babelPlugins: espree: shebang', (t) => {
    const {code} = putout(fixture.shebang, {
        parser: 'espree',
        plugins: [
            'remove-unused-variables',
            'babel/transform-inline-consecutive-adds',
        ],
    });
    
    t.deepEqual(code, fixture.shebangFix);
    t.end();
});

test('putout: loader: babelPlugins: position: shebang', (t) => {
    const {places} = putout(fixture.babelPlugin, {
        fix: false,
        recast: true,
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    const expected = [{
        rule: 'babel/transform-inline-consecutive-adds',
        message: 'transform inline consecutive adds',
        position: {
            line: 4,
            column: 0,
        },
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: loader: babelPlugins: custom message', (t) => {
    const message = 'hello world';
    const enabled = true;
    
    const {places} = putout(fixture.babelPlugin, {
        fix: false,
        recast: true,
        rules: {
            'babel/transform-inline-consecutive-adds': [enabled, message],
        },
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    const expected = [{
        rule: 'babel/transform-inline-consecutive-adds',
        message,
        position: {
            line: 4,
            column: 0,
        },
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: loader: babelPlugins: custom message: on', (t) => {
    const message = 'hello world';
    const enabled = 'on';
    
    const {places} = putout(fixture.babelPlugin, {
        fix: false,
        recast: true,
        rules: {
            'babel/transform-inline-consecutive-adds': [enabled, message],
        },
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    const expected = [{
        rule: 'babel/transform-inline-consecutive-adds',
        message,
        position: {
            line: 4,
            column: 0,
        },
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: loader: babelPlugins: no message: first options', (t) => {
    const message = 'transform inline consecutive adds';
    
    const {places} = putout(fixture.babelPlugin, {
        fix: false,
        rules: {
            'babel/transform-inline-consecutive-adds': [{}],
        },
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    const expected = [{
        rule: 'babel/transform-inline-consecutive-adds',
        message,
        position: {
            line: 4,
            column: 0,
        },
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: loader: babelPlugins: shebang', (t) => {
    const {code} = putout(fixture.shebang, {
        plugins: ['babel/transform-inline-consecutive-adds'],
    });
    
    t.deepEqual(code, fixture.shebang);
    t.end();
});

test('putout: loader: nested rules', (t) => {
    const {code} = putout(fixture.shebang, {
        rules: {
            'putout/convert-babel-types': 'off',
            'remove-unused-variables': 'off',
        },
        plugins: [
            'remove-unused-variables',
            'putout',
        ],
    });
    
    t.deepEqual(code, fixture.shebang);
    t.end();
});

test('putout: loader: no plugin for a rule', (t) => {
    const [e] = tryCatch(putout, 'hello', {
        rules: {
            abcd: 'off',
        },
        plugins: [],
    });
    
    t.equal(e.message, 'No plugin found for a rule: "abcd"');
    t.end();
});

test('putout: loader: nested rule: one', (t) => {
    const [e] = tryCatch(putout, 'hello', {
        rules: {
            'putout/convert-babel-types': 'off',
        },
        plugins: ['putout'],
    });
    
    t.notOk(e);
    t.end();
});

test('putout: loader: nested rule: babel', (t) => {
    const [e] = tryCatch(putout, 'hello', {
        rules: {
            'babel/convert': 'off',
        },
        plugins: ['babel/convert'],
    });
    
    t.notOk(e);
    t.end();
});

test('putout: loader: no options', (t) => {
    const [e] = tryCatch(loadPlugins);
    
    t.equal(e.message, 'options should be an object!');
    t.end();
});

test('putout: loader: no options.pluginNames', (t) => {
    const {places} = putout('hello', {
        loadPlugins,
    });
    
    t.notOk(places.length);
    t.end();
});

test('putout: loader: enable part of rule', (t) => {
    const source = `const {run} = require('madrun');`;
    
    const {code} = putout(source, {
        fix: true,
        rules: {
            'convert-commonjs-to-esm': 'off',
            'convert-commonjs-to-esm/require': 'on',
        },
        plugins: ['convert-commonjs-to-esm'],
    });
    
    const expected = `import {run} from 'madrun';\n`;
    
    t.equal(code, expected, 'should enable one of rules in plugin');
    t.end();
});

test('putout: loader: disabled part of rule', (t) => {
    const code = montag`
        const {run} = require('madrun');
        
        module.exports = {
            'lint': () => 'bin/putout.js .',
            'fix:lint': () => run('lint', '--fix'),
        };
    `;
    
    const {places} = putout(code, {
        fix: false,
        rules: {
            'madrun': 'on',
            'madrun/add-madrun-to-lint': 'off',
            'madrun/add-fresh-lint': 'off',
        },
        plugins: ['madrun'],
    });
    
    const expected = [{
        message: '"lint" should check current directory',
        position: {
            column: 17,
            line: 3,
        },
        rule: 'madrun/set-lint-dot',
    }];
    
    t.deepEqual(places, expected, 'should disable one of rules in plugin');
    t.end();
});

test('putout: loader: plugin is a function', (t) => {
    const [e] = tryCatch(putout, 'hello', {
        loadPlugins,
        plugins: [
            ['fn', () => {}],
        ],
    });
    
    t.equal(e.message, `☝️ Cannot determine type of plugin 'fn'. Here is list of supported plugins: https://git.io/JqcMn`);
    t.end();
});

test('putout: loader: declcarator', (t) => {
    const {code} = putout(`isString('hello')`, {
        loadPlugins,
        plugins: [
            ['declare', {
                declare: () => ({
                    isString: 'const isString = (a) => typeof a === "string"',
                }),
            }],
        ],
    });
    
    const expected = montag`
        const isString = (a) => typeof a === 'string';
        isString('hello');\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: loader: ESM', async (t) => {
    const estrace = await import('estrace/plugin');
    
    const [e] = tryCatch(putout, 'hello', {
        loadPlugins,
        rules: {
            'estrace/trace': ['on', {
                url: 'file://hello.js',
            }],
        },
        plugins: [
            ['estrace', estrace],
        ],
    });
    
    t.notOk(e);
    t.end();
});

test('putout: loader: namespace', (t) => {
    const source = `const {run} = require('madrun');`;
    
    const {code} = putout(source, {
        fix: true,
        plugins: ['@putout/plugin-convert-commonjs-to-esm'],
    });
    
    const expected = `import {run} from 'madrun';\n`;
    
    t.equal(code, expected, 'should enable one of rules in plugin');
    t.end();
});

test('putout: loader: wrong plugin name', (t) => {
    const source = `const {run} = require('madrun');`;
    
    const [error] = tryCatch(putout, source, {
        plugins: [
            [putout, putout],
        ],
    });
    
    const expected = `☝️ Looks like plugin name type is not 'string', but: 'function'`;
    
    t.equal(error.message, expected);
    t.end();
});
