import { bookingWorkerId } from './booking'

export type ProfileMode = 'idle' | 'picker' | 'chat' | 'sent'

export type AssistantStep = 'services' | 'worker' | 'date' | 'time' | 'send'

export type AssistantBookingInput = {
  salonId: string
  serviceIds: string[]
  workerId?: string
  preferredDate: string
  preferredTime: string
}

export function showChatCta(serviceCount: number, sent: boolean): boolean {
  return serviceCount > 0 && !sent
}

export function skipWorkerStep(workerCount: number): boolean {
  return workerCount === 0
}

export function isPickerOpen(mode: ProfileMode): boolean {
  return mode === 'picker'
}

export function isChatOpen(mode: ProfileMode): boolean {
  return mode === 'chat'
}

export function assistantCanSend(
  serviceIds: string[],
  preferredDate: string,
  preferredTime: string,
): boolean {
  return serviceIds.length > 0 && preferredDate !== '' && preferredTime !== ''
}

export function assistantStep(input: {
  serviceIds: string[]
  workerCount: number
  workerConfirmed: boolean
  preferredDate: string
  preferredTime: string
}): AssistantStep {
  if (input.serviceIds.length === 0) {
    return 'services'
  }
  if (!skipWorkerStep(input.workerCount) && !input.workerConfirmed) {
    return 'worker'
  }
  if (input.preferredDate === '') {
    return 'date'
  }
  if (input.preferredTime === '') {
    return 'time'
  }
  return 'send'
}

export function assistantBookingInput(input: {
  salonId: string
  serviceIds: string[]
  workerChoice: string
  preferredDate: string
  preferredTime: string
}): AssistantBookingInput | null {
  if (!assistantCanSend(input.serviceIds, input.preferredDate, input.preferredTime)) {
    return null
  }
  const booking: AssistantBookingInput = {
    salonId: input.salonId,
    serviceIds: input.serviceIds,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
  }
  const workerId = bookingWorkerId(input.workerChoice)
  if (workerId !== undefined) {
    booking.workerId = workerId
  }
  return booking
}
