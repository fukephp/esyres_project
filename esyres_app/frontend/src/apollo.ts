import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'

function xsrfToken(): string {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const csrfLink = setContext(async (_, { headers }) => {
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' })
  return {
    headers: {
      ...headers,
      'X-XSRF-TOKEN': xsrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
    },
  }
})

const httpLink = new HttpLink({
  uri: '/graphql',
  credentials: 'include',
})

const lighthouseLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query)
  if (definition.kind !== 'OperationDefinition' || definition.operation !== 'subscription') {
    return forward(operation)
  }
  return new Observable((observer) => {
    let inner: { unsubscribe: () => void } | undefined
    void import('./lib/ownerEcho')
      .then(({ listenLighthouse }) => {
        inner = listenLighthouse(operation, forward).subscribe(observer)
      })
      .catch((error: unknown) => {
        observer.error(error)
      })
    return () => {
      inner?.unsubscribe()
    }
  })
})

export const apolloClient = new ApolloClient({
  link: from([csrfLink, lighthouseLink, httpLink]),
  cache: new InMemoryCache(),
})
