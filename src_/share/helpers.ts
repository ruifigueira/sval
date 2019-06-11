import State from '../state'
import * as estree from 'estree'
import { OP } from './const'
import compile from '../compile'

type FunctionDefinition = estree.FunctionDeclaration | estree.FunctionExpression | estree.ArrowFunctionExpression

export function compileFunc(node: FunctionDefinition, state: State) {
  const arrow = node.type === 'ArrowFunctionExpression'
  const funCode = {
    op: OP.FUNC,
    val: -1,
    arrow,
    async: node.async,
    generator: node.generator
  }
  state.opCodes.push(funCode)

  state.symbols.pushScope()
  if (!arrow) {
    state.opCodes.push({ op: OP.MOVE, val: state.symbols.set('const', 'this').pointer })
    state.opCodes.push({ op: OP.MOVE, val: state.symbols.set('let', 'arguments').pointer })
  }
  for (let i = 0; i < node.params.length; i++) {
    const param = node.params[i]
    if (param.type === 'Identifier') {
      state.opCodes.push({ op: OP.MOVE, val: state.symbols.set('let', param.name).pointer })
    } else if (param.type === 'RestElement') {
    } else {
    }
  }
  const body = node.body.type === 'BlockStatement' ? node.body.body : [node.body]
  for (let i = 0; i < body.length; i++) {
    compile(body[i], state)
  }
  state.symbols.popScope()

  funCode.val = state.opCodes.length
}