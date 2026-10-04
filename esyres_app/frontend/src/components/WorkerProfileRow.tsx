import { useMutation } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageUploadModal } from './ImageUploadModal'
import { Alert, Spinner } from './ui'
import {
  REMOVE_WORKER_PHOTO_MUTATION,
  UPDATE_SALON_WORKER_MUTATION,
  UPLOAD_WORKER_PHOTO_MUTATION,
  type WorkerProfile,
} from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'
import { graphqlUpload } from '../lib/graphqlUpload'
import {
  MAX_LIST_ROW_LENGTH,
  MAX_LIST_ROWS,
  MAX_STRONGEST,
  workerDraft,
  workerInitials,
  workerInput,
  type WorkerDraft,
  type WorkerListField,
} from '../lib/workerProfile'

const FIELD = 'field mt-1'
const SAVE_BTN =
  'inline-flex h-10 w-fit items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]'
const PLUS_BTN =
  'inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-ink text-sm font-semibold text-canvas active:bg-[#242424]'
const REMOVE_BTN =
  'inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-hairline bg-canvas px-5 text-sm font-semibold text-ink disabled:opacity-40'
const FILE_ACCEPT = 'image/jpeg,image/png,image/webp'

type Worker = { id: string; name: string; profile: WorkerProfile }
type ServiceOption = { id: string; name: string }

const SAVE_ERRORS = [
  'ABOUT_TOO_LONG',
  'INVALID_EXPERIENCE',
  'INVALID_PORTFOLIO_URL',
  'MAINTENANCE_TOO_LONG',
  'LIST_ROW_TOO_LONG',
  'LIST_TOO_LONG',
  'TOO_MANY_STRONGEST',
  'INVALID_SERVICE',
]

function saveFail(code: string, t: (key: string) => string): string {
  if (code === 'INVALID_NAME') {
    return t('owner.INVALID_WORKER_NAME')
  }
  if (code === 'DUPLICATE_WORKER_NAME' || code === 'FORBIDDEN') {
    return t(`owner.${code}`)
  }
  if (SAVE_ERRORS.includes(code)) {
    return t(`owner.worker.error.${code}`)
  }

  return t('salon.gate.fallback')
}

function photoFail(code: string, t: (key: string) => string): string {
  if (code === 'INVALID_IMAGE_TYPE' || code === 'IMAGE_TOO_LARGE') {
    return t(`owner.${code}`)
  }

  return t('salon.gate.fallback')
}

export function WorkerAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl !== null) {
    return <img src={photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
  }

  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pastel-pink text-sm font-semibold text-ink"
    >
      {workerInitials(name)}
    </span>
  )
}

export function WorkerProfileRow({
  worker,
  services,
  open,
  onToggle,
  onSaved,
}: {
  worker: Worker
  services: ServiceOption[]
  open: boolean
  onToggle: () => void
  onSaved: () => Promise<unknown>
}) {
  return (
    <li className={open ? 'space-y-4' : undefined}>
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left text-sm"
        onClick={onToggle}
      >
        <WorkerAvatar name={worker.name} photoUrl={worker.profile.photoUrl} />
        <span className="font-medium text-ink">{worker.name}</span>
      </button>
      {open ? <WorkerProfileForm worker={worker} services={services} onSaved={onSaved} /> : null}
    </li>
  )
}

function WorkerProfileForm({
  worker,
  services,
  onSaved,
}: {
  worker: Worker
  services: ServiceOption[]
  onSaved: () => Promise<unknown>
}) {
  const { t } = useTranslation()
  const [updateSalonWorker, { loading: saving }] = useMutation<{
    updateSalonWorker: Worker
  }>(UPDATE_SALON_WORKER_MUTATION)
  const [removeWorkerPhoto, { loading: removingPhoto }] = useMutation(REMOVE_WORKER_PHOTO_MUTATION)
  const [draft, setDraft] = useState<WorkerDraft>(() => workerDraft(worker.name, worker.profile))
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  function patch(next: Partial<WorkerDraft>): void {
    setSaved(false)
    setDraft((current) => ({ ...current, ...next }))
  }

  function patchRow(field: WorkerListField, index: number, value: string): void {
    patch({ [field]: draft[field].map((row, i) => (i === index ? value : row)) })
  }

  function toggleStrongest(id: string): void {
    const ids = draft.strongestServiceIds
    patch({ strongestServiceIds: ids.includes(id) ? ids.filter((row) => row !== id) : [...ids, id] })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) {
      return
    }
    setError(null)
    setSaved(false)
    try {
      const result = await updateSalonWorker({ variables: { id: worker.id, input: workerInput(draft) } })
      const next = result.data?.updateSalonWorker
      if (next) {
        setDraft(workerDraft(next.name, next.profile))
      }
      setSaved(true)
      await onSaved()
    } catch (err) {
      setError(saveFail(graphqlErrorCode(err) ?? '', t))
    }
  }

  async function onUpload(file: File): Promise<string | null> {
    try {
      await graphqlUpload(UPLOAD_WORKER_PHOTO_MUTATION, { workerId: worker.id }, file)
      await onSaved()
      return null
    } catch (err) {
      return photoFail(graphqlErrorCode(err) ?? '', t)
    }
  }

  async function onRemovePhoto(): Promise<void> {
    setPhotoError(null)
    try {
      await removeWorkerPhoto({ variables: { workerId: worker.id } })
      await onSaved()
    } catch (err) {
      setPhotoError(photoFail(graphqlErrorCode(err) ?? '', t))
    }
  }

  function listField(field: WorkerListField) {
    const rows = draft[field]

    return (
      <div className="space-y-2">
        <p className="text-sm text-body">{t(`owner.worker.${field}`)}</p>
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={row}
              maxLength={MAX_LIST_ROW_LENGTH}
              placeholder={t(`owner.worker.${field}Hint`)}
              onChange={(e) => patchRow(field, index, e.target.value)}
              className="field"
            />
            <button
              type="button"
              className={REMOVE_BTN}
              onClick={() => patch({ [field]: rows.filter((_, i) => i !== index) })}
            >
              {t('owner.worker.removeRow')}
            </button>
          </div>
        ))}
        {rows.length < MAX_LIST_ROWS ? (
          <button
            type="button"
            className={PLUS_BTN}
            aria-label={t('owner.worker.addRow')}
            onClick={() => patch({ [field]: [...rows, ''] })}
          >
            <span aria-hidden>+</span>
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
      <div className="space-y-2">
        <p className="text-sm text-body">{t('owner.worker.photo')}</p>
        <div className="flex items-center gap-3">
          <WorkerAvatar name={draft.name} photoUrl={worker.profile.photoUrl} />
          {worker.profile.photoUrl !== null ? (
            <button type="button" disabled={removingPhoto} className={REMOVE_BTN} onClick={() => void onRemovePhoto()}>
              {removingPhoto ? <Spinner /> : null}
              {t('owner.removeImage')}
            </button>
          ) : (
            <button
              type="button"
              className={PLUS_BTN}
              aria-label={t('owner.addImage')}
              onClick={() => setUploadOpen(true)}
            >
              <span aria-hidden>+</span>
            </button>
          )}
        </div>
        {photoError ? <Alert variant="error">{photoError}</Alert> : null}
        <ImageUploadModal
          open={uploadOpen}
          title={t('owner.worker.uploadPhotoTitle')}
          accept={FILE_ACCEPT}
          onClose={() => setUploadOpen(false)}
          onUpload={onUpload}
        />
      </div>
      <label className="block text-sm text-body">
        {t('owner.workerName')}
        <input type="text" value={draft.name} onChange={(e) => patch({ name: e.target.value })} className={FIELD} />
      </label>
      <label className="block text-sm text-body">
        {t('owner.worker.about')}
        <textarea
          value={draft.about}
          rows={4}
          maxLength={1000}
          onChange={(e) => patch({ about: e.target.value })}
          className={FIELD}
        />
      </label>
      <label className="block text-sm text-body">
        {t('owner.worker.experienceYears')}
        <input
          type="number"
          min={0}
          max={60}
          step={1}
          value={draft.experienceYears}
          onChange={(e) => patch({ experienceYears: e.target.value })}
          className={FIELD}
        />
      </label>
      <label className="block text-sm text-body">
        {t('owner.worker.portfolioUrl')}
        <input
          type="url"
          value={draft.portfolioUrl}
          placeholder="https://"
          onChange={(e) => patch({ portfolioUrl: e.target.value })}
          className={FIELD}
        />
      </label>
      {listField('talents')}
      {listField('specializations')}
      <fieldset className="space-y-2">
        <legend className="text-sm text-body">{t('owner.worker.strongest')}</legend>
        {services.length === 0 ? (
          <p className="text-sm text-muted">{t('owner.worker.noServices')}</p>
        ) : (
          services.map((service) => {
            const checked = draft.strongestServiceIds.includes(service.id)

            return (
              <label key={service.id} className="flex items-center gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && draft.strongestServiceIds.length >= MAX_STRONGEST}
                  onChange={() => toggleStrongest(service.id)}
                />
                {service.name}
              </label>
            )
          })
        )}
      </fieldset>
      {listField('certificates')}
      {listField('education')}
      {listField('brands')}
      <label className="block text-sm text-body">
        {t('owner.worker.maintenance')}
        <input
          type="text"
          value={draft.maintenance}
          maxLength={300}
          placeholder={t('owner.worker.maintenanceHint')}
          onChange={(e) => patch({ maintenance: e.target.value })}
          className={FIELD}
        />
      </label>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {saved ? <p className="text-sm text-body">{t('owner.worker.saved')}</p> : null}
      <button type="submit" disabled={saving} className={SAVE_BTN}>
        {saving ? <Spinner /> : null}
        {t('owner.save')}
      </button>
    </form>
  )
}
