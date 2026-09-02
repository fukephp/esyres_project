import type { FetchResult, NextLink, Operation } from '@apollo/client'
import { Observable } from '@apollo/client'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

function xsrfToken(): string {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

let echo: Echo<'reverb'> | null = null

function getEcho(): Echo<'reverb'> {
  if (echo !== null) {
    return echo
  }
  ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher
  const port = window.location.port === '' ? 80 : Number(window.location.port)
  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'esyres',
    wsHost: window.location.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS: window.location.protocol === 'https:',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/graphql/subscriptions/auth',
    auth: {
      headers: {
        'X-XSRF-TOKEN': xsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  })
  return echo
}

function channelFromResult(result: FetchResult): string | null {
  const extensions = result.extensions as { lighthouse_subscriptions?: { channel?: string } } | undefined
  const channel = extensions?.lighthouse_subscriptions?.channel
  return typeof channel === 'string' && channel !== '' ? channel : null
}

export function listenLighthouse(operation: Operation, forward: NextLink): Observable<FetchResult> {
  return new Observable((observer) => {
    let channelName: string | undefined
    const handshake = forward(operation).subscribe({
      next: (result) => {
        if (result.errors !== undefined && result.errors.length > 0) {
          observer.error(result.errors[0])
          return
        }
        const channel = channelFromResult(result)
        if (channel === null) {
          observer.error(new Error('No subscription channel'))
          return
        }
        channelName = channel
        const pusher = getEcho().connector.pusher
        pusher.subscribe(channel).bind('lighthouse-subscription', (payload: { result?: FetchResult }) => {
          if (payload.result !== undefined) {
            observer.next(payload.result)
          }
        })
      },
      error: (error) => observer.error(error),
    })
    return () => {
      handshake.unsubscribe()
      if (channelName !== undefined) {
        getEcho().connector.pusher.unsubscribe(channelName)
      }
    }
  })
}
