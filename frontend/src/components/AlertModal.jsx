import { useState } from 'react'

export default function AlertModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [alertForm, setAlertForm] = useState({
    alertType: 'HIGH_TEMPERATURE',
    severity: 'WARNING',
    vitalDetails: {},
    notes: ''
  })
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = async () => {
    setAlertMessage('')
    try {
      await onSubmit(alertForm)
      setAlertForm({
        alertType: 'HIGH_TEMPERATURE',
        severity: 'WARNING',
        vitalDetails: {},
        notes: ''
      })
      setAlertMessage('✅ Alert created successfully!')
      setTimeout(() => {
        onClose()
        setAlertMessage('')
      }, 1500)
    } catch (error) {
      setAlertMessage('❌ Error: ' + error.message)
    }
  }

  const handleClose = () => {
    setAlertForm({
      alertType: 'HIGH_TEMPERATURE',
      severity: 'WARNING',
      vitalDetails: {},
      notes: ''
    })
    setAlertMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Emergency Alert</h2>
          <button className="modal-close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          {alertMessage && (
            <div className={`form-message ${alertMessage.includes('✅') ? 'success' : 'error'}`}>
              {alertMessage}
            </div>
          )}

          <div className="form-group">
            <label>Alert Type</label>
            <select 
              value={alertForm.alertType}
              onChange={(e) => setAlertForm({...alertForm, alertType: e.target.value})}
            >
              <option value="HIGH_TEMPERATURE">High Temperature</option>
              <option value="LOW_OXYGEN">Low Oxygen</option>
              <option value="HIGH_HEART_RATE">High Heart Rate</option>
              <option value="RESPIRATORY_ABNORMAL">Respiratory Abnormality</option>
              <option value="CRITICAL">Critical Condition</option>
            </select>
          </div>

          <div className="form-group">
            <label>Severity Level</label>
            <select 
              value={alertForm.severity}
              onChange={(e) => setAlertForm({...alertForm, severity: e.target.value})}
            >
              <option value="WARNING">Warning</option>
              <option value="ALERT">Alert</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea 
              placeholder="Describe the emergency situation or symptoms..."
              value={alertForm.notes}
              onChange={(e) => setAlertForm({...alertForm, notes: e.target.value})}
              rows="4"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="btn-submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Alert...' : 'Send Alert'}
          </button>
        </div>
      </div>
    </div>
  )
}
