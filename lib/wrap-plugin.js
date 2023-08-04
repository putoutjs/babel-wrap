'use strict';

const tryCatch = require('try-catch');
const {print} = require('@putout/engine-parser');

const getPositions = require('./get-positions-by-diff');
const babelTransform = require('./transforms/babel');
const BABEL_REG = /@babel\/plugin-|babel-plugin-/;

const getMessage = (a) => a.replace(BABEL_REG, '').replaceAll('-', ' ');

const getModulePath = (name) => {
    const [, path] = tryCatch(require.resolve, name);
    return path;
};

module.exports = (name, namespace) => {
    const message = getMessage(name);
    
    if (/babel/.test(namespace))
        return getPlugin({
            name: getBabelPluginName(name),
            message,
            transform: babelTransform,
        });
    
    return null;
};

const getPlugin = ({name, transform, message}) => ({
    report: () => message,
    fix: () => {},
    find(ast, {push}) {
        const oldCode = print(ast, {
            printer: 'putout',
        });
        
        transform(ast, oldCode, name);
        
        const newCode = print(ast, {
            printer: 'putout',
        });
        
        if (newCode === oldCode)
            return;
        
        const positions = getPositions(oldCode, newCode);
        
        for (const start of positions) {
            const node = {
                loc: {
                    start,
                },
            };
            
            const path = {
                node,
            };
            
            push(path);
        }
    },
});

module.exports.babelPlugin = (plugin, message) => {
    return getPlugin({
        name: plugin,
        transform: babelTransform,
        message,
    });
};

function getBabelPluginName(name) {
    const namespaced = getModulePath(`@babel/plugin-${name}`);
    
    if (namespaced)
        return namespaced;
    
    return `babel-plugin-${name}`;
}
