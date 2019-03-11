/*
 * Dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { resetKeyGenerator } from '@gitbook/slate'

/*
 * Tests.
 */

describe('slate', () => {
  require('./serializers')
  require('./schema')
  require('./changes')
  require('./history')
  require('./operations')
  require('./models')
})

/*
 * Reset Slate's internal key generator state before each text.
 */

beforeEach(() => {
  resetKeyGenerator()
})
