import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CloseButton } from './ui'

const MOTION_MS = 250

export function Aside({
  open,
  onClose,
  title,
  headerExtra,
  children,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  headerExtra?: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (dialog === null) {
      return
    }
    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
      document.documentElement.style.overflow = 'hidden'
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = setTimeout(() => {
      dialog.close()
      document.documentElement.style.overflow = ''
    }, MOTION_MS)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => () => {
    document.documentElement.style.overflow = ''
  }, [])

  return (
    <dialog
      ref={ref}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div
        aria-hidden
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-[250ms] ease-out ${shown ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <section
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-xl transition duration-[250ms] ease-out motion-reduce:transition-opacity md:w-[440px] ${
          shown ? 'translate-x-0 opacity-100' : 'translate-x-full motion-reduce:translate-x-0 motion-reduce:opacity-0'
        }`}
      >
        <header className="flex items-start gap-3 border-b border-hairline px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-ink">{title}</h2>
            {headerExtra}
          </div>
          <CloseButton onClick={onClose} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </section>
    </dialog>
  )
}
