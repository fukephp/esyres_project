import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { GUEST_COLUMN_CLASS } from '../lib/homepage'

export const SKELETON_DELAY_MS = 150

export function useSkeletonVisible(): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), SKELETON_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])
  return visible
}

export function Skeleton({ className = '', children }: { className?: string; children: ReactNode }) {
  const { t } = useTranslation()
  const visible = useSkeletonVisible()
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{t('salon.loading')}</span>
      {visible ? <div aria-hidden="true">{children}</div> : null}
    </div>
  )
}

export function SkeletonBlock({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={`motion-safe:animate-pulse ${dark ? 'bg-surface-dark-elevated' : 'bg-surface-card'} ${className}`} />
  )
}

function times(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i)
}

export function RowsSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <Skeleton className={className}>
      <div className="space-y-3">
        {times(count).map((i) => (
          <div key={i} className="rounded-2xl border border-hairline p-4">
            <SkeletonBlock className="h-4 w-1/3 rounded-md" />
            <SkeletonBlock className="mt-3 h-3 w-2/3 rounded-md" />
          </div>
        ))}
      </div>
    </Skeleton>
  )
}

export function CardsSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <Skeleton className={className}>
      <div className="space-y-3">
        {times(count).map((i) => (
          <SkeletonBlock key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </Skeleton>
  )
}

export function TilesSkeleton({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <Skeleton className={className}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {times(count).map((i) => (
          <SkeletonBlock key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </Skeleton>
  )
}

export function PillsSkeleton({ count = 8, className = '' }: { count?: number; className?: string }) {
  return (
    <Skeleton className={className}>
      <div className="flex flex-wrap gap-2">
        {times(count).map((i) => (
          <SkeletonBlock key={i} className="h-9 w-16 rounded-full" />
        ))}
      </div>
    </Skeleton>
  )
}

export function PopularSkeleton() {
  return (
    <Skeleton className="mt-16">
      <SkeletonBlock className="h-7 w-56 rounded-md" />
      <div className="-mx-5 mt-6 flex gap-3 overflow-hidden px-5 md:mx-0 md:grid md:grid-cols-4 md:px-0">
        {times(4).map((i) => (
          <SkeletonBlock key={i} className="h-24 w-[70%] shrink-0 rounded-3xl md:w-auto" />
        ))}
      </div>
    </Skeleton>
  )
}

export function FormSkeleton({ className = '' }: { className?: string }) {
  return (
    <Skeleton className={className}>
      <SkeletonBlock className="h-8 w-48 rounded-md" />
      <div className="mt-8 max-w-sm space-y-4">
        <SkeletonBlock className="h-11 rounded-full" />
        <SkeletonBlock className="h-11 w-32 rounded-full" />
      </div>
    </Skeleton>
  )
}

export function GuestPageSkeleton({ children }: { children: ReactNode }) {
  return <main className={`${GUEST_COLUMN_CLASS} py-8`}>{children}</main>
}

export function SalonProfileSkeleton() {
  return (
    <Skeleton>
      <SkeletonBlock className="h-9 w-64 rounded-md" />
      <SkeletonBlock className="mt-3 h-4 w-48 rounded-md" />
      <div className="mt-8 max-w-md space-y-2">
        {times(7).map((i) => (
          <SkeletonBlock key={i} className="h-10 rounded-lg" />
        ))}
      </div>
      {times(2).map((g) => (
        <div key={g} className="mt-8 max-w-xl">
          <SkeletonBlock className="h-5 w-32 rounded-md" />
          <div className="mt-3 space-y-2">
            {times(3).map((i) => (
              <SkeletonBlock key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </Skeleton>
  )
}

function WeekGridBlocks() {
  return (
    <>
      <div className="space-y-2 md:hidden">
        {times(3).map((i) => (
          <SkeletonBlock key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
      <div className="hidden grid-cols-7 gap-2 md:grid">
        {times(7).map((d) => (
          <div key={d} className="space-y-2">
            <SkeletonBlock className="h-5 w-12 rounded-md" />
            {times(d % 3 === 0 ? 3 : 2).map((i) => (
              <SkeletonBlock key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export function WeekGridSkeleton({ className = '' }: { className?: string }) {
  return (
    <Skeleton className={className}>
      <WeekGridBlocks />
    </Skeleton>
  )
}

export function OwnerWeekSkeleton() {
  return (
    <Skeleton>
      <div className="rounded-3xl bg-canvas p-4 md:p-6">
        <SkeletonBlock className="h-6 w-40 rounded-md" />
        <div className="mt-4 flex gap-2 md:hidden">
          {times(7).map((i) => (
            <SkeletonBlock key={i} className="h-12 flex-1 rounded-2xl" />
          ))}
        </div>
        <div className="mt-4">
          <WeekGridBlocks />
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-canvas p-4 md:p-6">
        <SkeletonBlock className="h-6 w-48 rounded-md" />
        <div className="mt-4 space-y-3">
          {times(3).map((i) => (
            <SkeletonBlock key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </Skeleton>
  )
}

export function KanbanSkeleton({ className = '' }: { className?: string }) {
  return (
    <Skeleton className={className}>
      <div className="grid gap-3 md:grid-cols-4">
        {times(4).map((c) => (
          <div key={c} className="space-y-2 rounded-2xl p-3">
            <SkeletonBlock className="h-5 w-24 rounded-md" />
            {times(2).map((i) => (
              <SkeletonBlock key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ))}
      </div>
    </Skeleton>
  )
}

export function ColumnSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Skeleton>
      <div className="space-y-2">
        {times(count).map((i) => (
          <SkeletonBlock key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </Skeleton>
  )
}

export function OwnerSalonsSkeleton() {
  return (
    <Skeleton>
      <div className="space-y-3">
        {times(2).map((i) => (
          <div key={i} className="flex items-center justify-between border border-hairline p-5">
            <div className="w-1/2">
              <SkeletonBlock className="h-5 w-2/3 rounded-md" />
              <SkeletonBlock className="mt-2 h-3 w-1/3 rounded-md" />
            </div>
            <SkeletonBlock className="h-9 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </Skeleton>
  )
}

export function OwnerSalonEditSkeleton() {
  return (
    <Skeleton>
      <div className="flex flex-wrap gap-2">
        {times(4).map((i) => (
          <SkeletonBlock key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <SkeletonBlock className="mt-6 h-72 rounded-3xl" />
    </Skeleton>
  )
}

export function RequestDetailSkeleton() {
  return (
    <Skeleton>
      <SkeletonBlock className="h-5 w-16 rounded-md" />
      <SkeletonBlock className="mt-4 h-72 rounded-lg" />
    </Skeleton>
  )
}

export function OwnerShellGhost({ children }: { children: ReactNode }) {
  const visible = useSkeletonVisible()
  return (
    <div className="min-h-svh bg-page text-ink md:flex">
      <aside
        aria-hidden="true"
        className="hidden bg-surface-dark px-4 py-6 md:sticky md:top-0 md:flex md:h-svh md:w-16 md:shrink-0 md:flex-col md:items-center"
      >
        {visible ? (
          <>
            <SkeletonBlock dark className="h-6 w-6 rounded-full" />
            <div className="mt-8 space-y-2">
              {times(6).map((i) => (
                <SkeletonBlock key={i} dark className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <SkeletonBlock dark className="mt-auto h-8 w-8 rounded-full" />
          </>
        ) : null}
      </aside>
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <div aria-hidden="true" className="flex items-center gap-3 px-5 pt-4 md:hidden">
          {visible ? (
            <>
              <SkeletonBlock className="h-6 w-6 rounded-full" />
              <SkeletonBlock className="h-5 flex-1 rounded-md" />
              <SkeletonBlock className="h-10 w-20 rounded-full" />
            </>
          ) : null}
        </div>
        <div aria-hidden="true" className="px-5 pt-6 md:px-10 md:pt-10">
          {visible ? (
            <>
              <SkeletonBlock className="h-3 w-24 rounded-md" />
              <SkeletonBlock className="mt-2 h-9 w-72 max-w-full rounded-md md:h-11" />
            </>
          ) : null}
        </div>
        <main className="px-5 py-6 md:px-10 md:py-8">{children}</main>
      </div>
      <div aria-hidden="true" className="fixed inset-x-0 bottom-0 z-20 bg-surface-dark md:hidden">
        <div className="flex h-16 items-center justify-around px-3">
          {visible
            ? times(5).map((i) => <SkeletonBlock key={i} dark className="h-6 w-6 rounded-full" />)
            : null}
        </div>
      </div>
    </div>
  )
}

export function OwnerPageSkeleton({ children = <CardsSkeleton /> }: { children?: ReactNode }) {
  return <OwnerShellGhost>{children}</OwnerShellGhost>
}
