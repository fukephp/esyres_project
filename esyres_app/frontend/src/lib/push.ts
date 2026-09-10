import { useEffect } from 'react'
import { gql, useApolloClient, type ApolloClient } from '@apollo/client'

export function pushClickPath(salonId: string): string {
  return `/owner?salon=${salonId}`
}

export function customerPushClickPath(): string {
  return '/bookings'
}

const VAPID_QUERY = gql`
  query VapidPublicKey {
    vapidPublicKey
  }
`

const SUBSCRIBE_PUSH = gql`
  mutation SubscribePush($endpoint: String!, $p256dh: String!, $auth: String!) {
    subscribePush(endpoint: $endpoint, p256dh: $p256dh, auth: $auth)
  }
`

export function useOwnerPush(ready: boolean): void {
  useSessionPush(ready)
}

export function useCustomerPush(ready: boolean): void {
  useSessionPush(ready)
}

function useSessionPush(ready: boolean): void {
  const client = useApolloClient()
  useEffect(() => {
    if (!ready) {
      return
    }
    void subscribeSessionPush(client)
  }, [ready, client])
}

async function subscribeSessionPush(client: ApolloClient): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return
  }
  const { data } = await client.query<{ vapidPublicKey: string }>({ query: VAPID_QUERY })
  const key = data?.vapidPublicKey ?? ''
  if (key === '') {
    return
  }
  const registration = await navigator.serviceWorker.ready.catch(() => null)
  if (registration === null) {
    return
  }
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
  })
  const json = sub.toJSON()
  const endpoint = json.endpoint
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (endpoint === undefined || p256dh === undefined || auth === undefined) {
    return
  }
  await client.mutate({
    mutation: SUBSCRIBE_PUSH,
    variables: { endpoint, p256dh, auth },
  })
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i)
  }

  return out
}
