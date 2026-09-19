export function dialogCancelShouldClose(activeInputType: string | null): boolean {
  return activeInputType !== 'date' && activeInputType !== 'time'
}
