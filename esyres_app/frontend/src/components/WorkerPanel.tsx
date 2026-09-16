import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
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
        <thead className="sticky top-12 z-10 bg-canvas">
          <tr>
            <th className="sticky left-0 bg-canvas px-2 py-1" />
            {workers.map((worker) => (
              <th key={worker.id} className="min-w-24 px-2 py-1 text-left font-semibold text-ink">
                {worker.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((cell, i) => (
            <tr key={cell.time}>
              <td className="sticky left-0 bg-canvas px-2 py-1 font-medium text-ink">{cell.time}</td>
              {workers.map((worker) => (
                <TimeWorkerCell
                  key={worker.id}
                  workerId={worker.id}
                  cell={cell}
                  cellIndex={i}
                  cells={cells}
                  blocks={blocks}
                  disabled={disabled}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimeWorkerCell({
  workerId,
  cell,
  cellIndex,
  cells,
  blocks,
  disabled,
}: {
  workerId: string
  cell: PanelCell
  cellIndex: number
  cells: PanelCell[]
  blocks: OccupyingBlock[]
  disabled: boolean
}) {
  const kind = cellKind(cell.time, cell.off, blocks, workerId)
  const block = blocks.find((row) => row.workerId === workerId && row.start === cell.time)
  if (block !== undefined && (kind === 'booked' || kind === 'proposed')) {
    const span = occupyingColSpan(block.durationMinutes, cells.length - cellIndex)
    return <OccupyingJobCell rowSpan={span} kind={kind} label={block.label} />
  }
  if (kind === 'booked' || kind === 'proposed') {
    return null
  }

  return <PanelCellDrop workerId={workerId} time={cell.time} kind={kind} disabled={disabled} />
}

function OccupyingJobCell({
  rowSpan,
  kind,
  label,
}: {
  rowSpan: number
  kind: 'booked' | 'proposed'
  label: string
}) {
  return (
    <td rowSpan={rowSpan} className="p-0 align-top">
      <div className={`h-full min-h-0 break-words px-0.5 text-xs ${KIND_CLASS[kind]} ${JOB_TEXT_CLASS[kind]}`} title={label}>
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
        className={`h-8 min-w-10 w-full ${KIND_CLASS[kind]} ${isOver && droppable ? 'ring-2 ring-ink ring-inset' : ''}`}
      />
    </td>
  )
}
