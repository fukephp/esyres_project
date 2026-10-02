import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { SALON_PICKER_DIALOG_CLASS } from '../lib/salonSend'
import { Alert, CloseButton, Spinner } from './ui'

export function ImageUploadModal({
  open,
  title,
  accept,
  onClose,
  onUpload,
}: {
  open: boolean
  title: string
  accept: string
  onClose: () => void
  onUpload: (file: File) => Promise<string | null>
}) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) {
      return
    }
    if (open && !dialog.open) {
      setFile(null)
      setError(null)
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (file === null) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function pick(next: File | undefined) {
    if (next) {
      setFile(next)
      setError(null)
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    pick(event.dataTransfer.files[0])
  }

  async function submit() {
    if (file === null || uploading) {
      return
    }
    setUploading(true)
    setError(null)
    const failure = await onUpload(file)
    setUploading(false)
    if (failure === null) {
      onClose()
      return
    }
    setError(failure)
  }

  return (
    <dialog
      ref={dialogRef}
      className={SALON_PICKER_DIALOG_CLASS}
      onCancel={(event) => {
        event.preventDefault()
        if (!uploading) {
          onClose()
        }
      }}
    >
      <div className="mb-1 flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
        <CloseButton onClick={() => !uploading && onClose()} />
      </div>
      <p className="text-sm text-muted">{t('owner.uploadHint')}</p>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-4 flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center text-sm text-body ${
          dragging ? 'border-ink bg-surface-soft' : 'border-hairline bg-page'
        }`}
      >
        {preview !== null ? (
          <img src={preview} alt="" className="h-28 w-28 rounded-lg object-cover" />
        ) : (
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-canvas text-ink">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
          </span>
        )}
        {file !== null ? <p className="max-w-full truncate text-ink">{file.name}</p> : null}
        <p>
          {t('owner.uploadDrop')}{' '}
          <button type="button" className="font-semibold text-ink underline underline-offset-4" onClick={() => inputRef.current?.click()}>
            {t('owner.uploadBrowse')}
          </button>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          aria-label={t('owner.addImage')}
          onChange={(event) => {
            pick(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>
      {error !== null ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
      <button
        type="button"
        disabled={file === null || uploading}
        onClick={() => void submit()}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-canvas active:bg-[#242424] disabled:bg-hairline disabled:text-muted"
      >
        {uploading ? <Spinner /> : null}
        {t('owner.uploadSubmit')}
      </button>
    </dialog>
  )
}
