import assert = require('power-assert')
import { describe, it } from 'mocha'
import { constructConfig } from '../../../../types/Config'
import { GetFormattedString } from '../../../../types/Formattable'
import { NbtStringNode } from '../../../../nodes/NbtStringNode'

describe('NbtStringNode Tests', () => {
    const { lint } = constructConfig({
        lint: {
            nbtStringQuote: ['warning', true],
            nbtStringQuoteType: ['warning', 'prefer double']
        }
    })
    // TODO: GetCodeActions Tests
    describe('[GetFormattedString]() Tests', () => {
        it('Should return correctly', () => {
            const node = new NbtStringNode(null, 'foo', '"foo"', { start: 1 })

            const actual = node[GetFormattedString]()

            assert(actual === '"foo"')
        })
    })
})
