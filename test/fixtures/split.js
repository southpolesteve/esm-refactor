import { foo } from './foo'
import bar from './bar'

const two = 2
export const one = 1
export function hello () {
  bar()
  return one + two
}

export function world () {
  foo()
  bar()
}
