import assert = require('power-assert')
import { describe, it } from 'mocha'
import { VanillaConfig } from '../../types/Config'
import { combineLine, combineSaturatedLine, Line, lineToLintedString, SaturatedLine, saturatedLineToLine } from '../../types/Line'
import { ParsingError } from '../../types/ParsingError'
import { Token, TokenType } from '../../types/Token'

describe('Line Tests', () => {
    describe('combineLine() Tests', () => {
        it('Should combine args', () => {
            const base = { args: [{ data: 'execute', parser: 'test' }], tokens: [], hint: { fix: [], options: [] } }
            const override = { args: [{ data: 'if', parser: 'test' }], tokens: [], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [{ data: 'execute', parser: 'test' }, { data: 'if', parser: 'test' }], tokens: [], hint: { fix: [], options: [] } })
        })
        it('Should combine hint.fix', () => {
            const base = { args: [], tokens: [], hint: { fix: ['a'], options: [] } }
            const override = { args: [], tokens: [], hint: { fix: ['b'], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], hint: { fix: ['a', 'b'], options: [] } })
        })
        it('Should combine hint.options', () => {
            const base: Line = { args: [], tokens: [], hint: { fix: [], options: [['a', ['a']]] } }
            const override: Line = { args: [], tokens: [], hint: { fix: [], options: [['b', ['b']]] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], hint: { fix: [], options: [['a', ['a']], ['b', ['b']]] } })
        })
        it('Should combine cache', () => {
            const base = { args: [], tokens: [], cache: {}, hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], cache: { entities: { foo: { def: [{ start: 0, end: 3 }], ref: [] } } }, hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, override)
        })
        it('Should return parsed completions', () => {
            const base = { args: [], tokens: [], completions: [{ label: 'foo' }], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], completions: [{ label: 'foo' }], hint: { fix: [], options: [] } })
        })
        it('Should return new completions', () => {
            const base = { args: [], tokens: [], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], completions: [{ label: 'foo' }], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], completions: [{ label: 'foo' }], hint: { fix: [], options: [] } })
        })
        it('Should not return empty error array', () => {
            const base = { args: [], tokens: [], errors: [], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], errors: [], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], hint: { fix: [], options: [] } })
        })
        it('Should return parsed errors', () => {
            const parsedError = new ParsingError({ start: 0, end: 3 }, 'Parsed')
            const base = { args: [], tokens: [], errors: [parsedError], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], errors: [], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], hint: { fix: [], options: [] }, errors: [parsedError] })
        })
        it('Should return new errors', () => {
            const newError = new ParsingError({ start: 0, end: 3 }, 'New')
            const base = { args: [], tokens: [], errors: [], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], errors: [newError], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], hint: { fix: [], options: [] }, errors: [newError] })
        })
        it('Should combine parsed errors and new errors', () => {
            const parsedError = new ParsingError({ start: 0, end: 3 }, 'Parsed')
            const newError = new ParsingError({ start: 0, end: 3 }, 'New')
            const base = { args: [], tokens: [], errors: [parsedError], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [], errors: [newError], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [], hint: { fix: [], options: [] }, errors: [parsedError, newError] })
        })
        it('Should combine tokens', () => {
            const oldToken = new Token({ start: 0, end: 1 }, TokenType.comment)
            const newToken = new Token({ start: 1, end: 2 }, TokenType.string)
            const base = { args: [], tokens: [oldToken], errors: [], hint: { fix: [], options: [] } }
            const override = { args: [], tokens: [newToken], errors: [], hint: { fix: [], options: [] } }
            combineLine(base, override)
            assert.deepStrictEqual(base, { args: [], tokens: [oldToken, newToken], hint: { fix: [], options: [] } })
        })
    })
    describe('combineSaturatedLine() Tests', () => {
        it('Should combine args, hint, cache, completions, tokens, and errors', () => {
            const base: SaturatedLine = {
                args: [{ data: 'execute', parser: 'test' }],
                tokens: [new Token({ start: 0, end: 1 }, TokenType.comment)],
                cache: { entities: {} },
                errors: [new ParsingError({ start: 0, end: 3 }, 'Old')],
                hint: { fix: ['a'], options: [['c', ['c']]] },
                completions: [{ label: 'a' }]
            }
            const override: Line = {
                args: [{ data: 'if', parser: 'test' }],
                tokens: [new Token({ start: 1, end: 2 }, TokenType.string)],
                cache: { entities: { foo: { doc: 'foo', def: [{ start: 0, end: 3 }], ref: [] } } },
                errors: [new ParsingError({ start: 0, end: 3 }, 'New')],
                hint: { fix: ['b'], options: [['d', ['d']]] },
                completions: [{ label: 'b' }]
            }
            combineSaturatedLine(base, override)
            assert.deepStrictEqual(base.args, [{ data: 'execute', parser: 'test' }, { data: 'if', parser: 'test' }])
            assert.deepStrictEqual(base.tokens, [new Token({ start: 0, end: 1 }, TokenType.comment), new Token({ start: 1, end: 2 }, TokenType.string)])
            assert.deepStrictEqual(base.hint.fix, ['a', 'b'])
            assert.deepStrictEqual(base.hint.options, [['c', ['c']], ['d', ['d']]])
            assert.deepStrictEqual(
                base.cache,
                { entities: { foo: { doc: 'foo', def: [{ start: 0, end: 3 }], ref: [] } } }
            )
            assert.deepStrictEqual(base.errors, [
                new ParsingError({ start: 0, end: 3 }, 'Old'),
                new ParsingError({ start: 0, end: 3 }, 'New')
            ])
            assert.deepStrictEqual(base.completions, [{ label: 'a' }, { label: 'b' }])
        })
    })
    describe('saturatedLineToLine() Tests', () => {
        it('Should remove empty cache, errors or completions', () => {
            const line = {
                args: [], tokens: [], cache: {}, errors: [], completions: [], hint: { fix: [], options: [] }
            }
            saturatedLineToLine(line)
            assert.deepStrictEqual(line, { args: [], tokens: [], hint: { fix: [], options: [] } })
        })
        it('Should not remove non-empty cache, errors or completions', () => {
            const line = {
                args: [], tokens: [], hint: { fix: [], options: [] },
                cache: { entities: { foo: { def: [{ start: 0, end: 3 }], ref: [] } } },
                errors: [new ParsingError({ start: 0, end: 1 }, 'Error')],
                completions: [{ label: 'completion' }]
            }
            saturatedLineToLine(line)
            assert.deepStrictEqual(line, {
                args: [], tokens: [], hint: { fix: [], options: [] },
                cache: { entities: { foo: { def: [{ start: 0, end: 3 }], ref: [] } } },
                errors: [new ParsingError({ start: 0, end: 1 }, 'Error')],
                completions: [{ label: 'completion' }]
            })
        })
    })
    describe('lineToLintedString() Tests', () => {
        it('Should return correctly', () => {
            const line = {
                args: [
                    {
                        data: 'execute',
                        parser: 'test'
                    },
                    {
                        data: 'if',
                        parser: 'test'
                    }
                ],
                tokens: [], cache: {}, errors: [],
                completions: [], hint: { fix: [], options: [] }
            }
            const actual = lineToLintedString(line, VanillaConfig.lint)
            assert(actual === 'execute if')
        })
    })
})
