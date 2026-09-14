import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { OccupyingBlock, PanelCell, PanelHours } from '../lib/owner'
import { canDropOnStart, cellKind, occupyingColSpan } from '../lib/owner'

const KIND_CLASS = {
  free: 'bg-cell-free',
  off: 'bg-cell-off',
  booked: 'bg-cell-booked',
  proposed: 'bg-cell-proposed',
} as const

const JOB_TEXT_CLASS = {
  booked: 'text-canvas',
  proposed: 'text-ink',
} as const

type Worker = { id: string; name: string }

export function WorkerPanel({
  workers,
  hours,
  cells,
  blocks,
  disabled,
}: {
  workers: Worker[]
  hours: PanelHours | undefined
  cells: PanelCell[]
  blocks: OccupyingBlock[]
  disabled: boolean
}) {
  const { t } = useTranslation()

  if (workers.length === 0) {
    return <p className="mt-8 text-sm text-body">{t('owner.noWorkers')}</p>
  }
  if (hours === undefined || hours.closed || cells.length === 0) {
    return <p className="mt-8 text-sm text-body">{t('owner.closedDay')}</p>
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-canvas px-2 py-1 text-left font-semibold text-ink">{t('salon.worker')}</th>
            {cells.map((cell) => (
              <th key={cell.time} className="px-0 py-1 text-center font-medium text-muted">
                {cell.time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.id}>
              <td className="sticky left-0 bg-canvas px-2 py-1 font-medium text-ink">{worker.name}</td>
              <WorkerCells workerId={worker.id} cells={cells} blocks={blocks} disabled={disabled} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WorkerCells({
  workerId,
  cells,
  blocks,
  disabled,
}: {
  workerId: string
  cells: PanelCell[]
  blocks: OccupyingBlock[]
  disabled: boolean
}) {
  const nodes: ReactNode[] = []
  let i = 0
  while (i < cells.length) {
    const cell = cells[i]
    const block = blocks.find((row) => row.workerId === workerId && row.start === cell.time)
    const kind = cellKind(cell.time, cell.off, blocks, workerId)
    if (block !== undefined && (kind === 'booked' || kind === 'proposed')) {
      const span = occupyingColSpan(block.durationMinutes, cells.length - i)
      nodes.push(
        <OccupyingJobCell key={cell.time} colSpan={span} kind={kind} label={block.label} />,
      )
      i += span
      continue
    }
    nodes.push(
      <PanelCellDrop
        key={cell.time}
        workerId={workerId}
        time={cell.time}
        kind={kind}
        disabled={disabled}
      />,
    )
    i += 1
  }

  return nodes
}

function OccupyingJobCell({
  colSpan,
  kind,
  label,
}: {
  colSpan: number
  kind: 'booked' | 'proposed'
  label: string
}) {
  return (
    <td colSpan={colSpan} className="p-0">
      <div className={`h-8 min-w-0 truncate px-0.5 text-xs leading-8 ${KIND_CLASS[kind]} ${JOB_TEXT_CLASS[kind]}`} title={label}>
        {label}
      </div>
    </td>
  )
}

function PanelCellDrop({
  workerId,
  time,
  kind,
  disabled,
}: {
  workerId: string
  time: string
  kind: keyof typeof KIND_CLASS
  disabled: boolean
}) {
  const droppable = canDropOnStart(kind) && !disabled
  const { setNodeRef, isOver } = useDroppable({
    id: `cell:${workerId}:${time}`,
    data: { workerId, time },
    disabled: !droppable,
  })

  return (
    <td className="p-0">
      <div
        ref={setNodeRef}
        className={`h-8 w-10 ${KIND_CLASS[kind]} ${isOver && droppable ? 'ring-2 ring-ink ring-inset' : ''}`}
      />
    </td>
  )
}
