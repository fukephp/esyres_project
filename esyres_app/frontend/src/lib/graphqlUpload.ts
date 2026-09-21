function xsrfToken(): string {
  if (typeof document === 'undefined') {
    return ''
  }
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function queryString(query: string): string {
  return query
}

export async function graphqlUpload(
  query: string,
  variables: Record<string, unknown>,
  file: File,
  fileField = 'file',
): Promise<unknown> {
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' })
  const operations = JSON.stringify({
    query: queryString(query),
    variables: { ...variables, [fileField]: null },
  })
  const map = JSON.stringify({ '0': [`variables.${fileField}`] })
  const body = new FormData()
  body.append('operations', operations)
  body.append('map', map)
  body.append('0', file)
  const response = await fetch('/graphql', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-XSRF-TOKEN': xsrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  })
  const json: {
    data?: unknown
    errors?: { message?: string; extensions?: { code?: string } }[]
  } = await response.json()
  if (json.errors !== undefined && json.errors.length > 0) {
    throw Object.assign(new Error(json.errors[0]?.message ?? 'GraphQL error'), {
      graphQLErrors: json.errors,
    })
  }
  return json.data
}
