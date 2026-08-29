import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

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

export const apolloClient = new ApolloClient({
  link: from([csrfLink, httpLink]),
  cache: new InMemoryCache(),
})
