import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import type { OccupyingBlock, PanelCell, PanelHours } from '../lib/owner'
import { canDropOnStart, cellKind } from '../lib/owner'

const KIND_CLASS = {
  free: 'bg-cell-free',
  off: 'bg-cell-off',
  booked: 'bg-cell-booked',
  proposed: 'bg-cell-proposed',
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
              {cells.map((cell) => (
                <PanelCellDrop
                  key={cell.time}
                  workerId={worker.id}
                  time={cell.time}
                  kind={cellKind(cell.time, cell.off, blocks, worker.id)}
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
