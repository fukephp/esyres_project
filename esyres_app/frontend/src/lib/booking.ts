export function stackSelection(
  services: { durationMinutes: number; priceFeninga: number }[],
): { durationMinutes: number; priceFeninga: number } {
  return {
    durationMinutes: services.reduce((sum, s) => sum + s.durationMinutes, 0),
    priceFeninga: services.reduce((sum, s) => sum + s.priceFeninga, 0),
  }
}

export function graphqlErrorCode(error: unknown): string | null {
  if (error === null || typeof error !== 'object' || !('graphQLErrors' in error)) {
    return null
  }
  const errors = (error as { graphQLErrors: { extensions?: { code?: string } }[] }).graphQLErrors
  return errors[0]?.extensions?.code ?? null
}

export function bookingWorkerId(selected: string): string | undefined {
  if (selected === '') {
    return undefined
  }
  return selected
}
