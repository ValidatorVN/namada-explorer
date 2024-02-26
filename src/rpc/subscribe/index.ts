import { NewBlockEvent, Comet38Client } from '@cosmjs/tendermint-rpc'
import { Subscription } from 'xstream'

export function subscribeNewBlock(
  tmClient: Comet38Client,
  callback: (event: NewBlockEvent) => any
): Subscription {
  const stream = tmClient.subscribeNewBlock()
  const subscription = stream.subscribe({
    next: (event) => {
      callback(event)
    },
    error: (err) => {
      console.error(err)
      subscription.unsubscribe()
    },
  })

  return subscription
}
