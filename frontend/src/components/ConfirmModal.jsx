import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

const ConfirmModal = React.memo(function ConfirmModal({
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isSubmitting = false
}) {
  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      // Error handling is done by parent component
      console.error('Confirmation action failed:', error)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="confirm-header">
            <div className="confirm-icon">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="modal-title">{title}</h2>
              <p className="modal-subtitle">{message}</p>
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-actions">
            <div className="flex gap-3">
              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ConfirmModal
