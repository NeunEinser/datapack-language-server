import { ProposedFeatures } from 'vscode-languageserver'
import { FunctionInfo } from '../../types/FunctionInfo'

export function onSemanticTokens({ info }: { info: FunctionInfo }) {
    info.builder = info.builder || new ProposedFeatures.SemanticTokensBuilder()

    for (let i = 0; i < info.lines.length; i++) {
        const { tokens } = info.lines[i]
        for (const token of tokens) {
            info.builder.push(...token.toArray(i))
        }
    }

    return info.builder.build()
}
