import { foo, baz } from './foo'
import bar from './bar'

const two = 2
export const one = 1 + two + baz
export function afunc () {
  foo()
  bar()
  return one + two
}
