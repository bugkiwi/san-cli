/**
 * @file ast-parser.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const babel = require('@babel/core');
const hash = require('hash-sum');

/* globals Map */
const cache = new Map();

module.exports = {
    parse(source) {
        let id = hash(source);

        if (!cache.has(id)) {
            try {
                let ast = babel.parse(source, {
                    sourceType: 'module'
                });
                cache.set(id, ast);
            }
            catch (e) {
                cache.set(id, e);
            }
        }

        let val = cache.get(id);
        if (val instanceof Error) {
            throw val;
        }

        return val;
    },
    delete(source) {
        let id = hash(source);
        cache.delete(id);
    }
};

