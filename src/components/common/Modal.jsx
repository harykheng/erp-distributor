import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-md',
  bodyClassName = 'p-5',
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              className={`w-full ${width} max-h-[88vh] bg-base-900 border border-base-800 rounded-2xl shadow-pop flex flex-col`}
            >
              <div className="flex items-start justify-between px-5 py-4 border-b border-base-800 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-bold text-base-100">{title}</h3>
                  {subtitle && <p className="text-xs text-base-400 mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-base-400 hover:text-base-100 hover:bg-base-800 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
