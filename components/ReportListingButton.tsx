'use client'

import { useState } from 'react'
import { Flag, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ReportListingButtonProps {
  rentalId: string
  rentalName: string
}

const flagReasons = [
  { value: 'fake_photos', label: 'Fake or Misleading Photos' },
  { value: 'scam', label: 'Suspected Scam' },
  { value: 'duplicate', label: 'Duplicate Listing' },
  { value: 'incorrect_info', label: 'Incorrect Information' },
  { value: 'not_available', label: 'No Longer Available' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
]

export function ReportListingButton({ rentalId, rentalName }: ReportListingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedReason) {
      setError('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be signed in to report a listing')
        setIsSubmitting(false)
        return
      }

      // Check if user already flagged this listing
      const { data: existingFlag } = await supabase
        .from('rental_flags')
        .select('id')
        .eq('rental_id', rentalId)
        .eq('user_id', user.id)
        .single()

      if (existingFlag) {
        setError('You have already reported this listing')
        setIsSubmitting(false)
        return
      }

      // Submit flag
      const { error: insertError } = await supabase
        .from('rental_flags')
        .insert({
          rental_id: rentalId,
          user_id: user.id,
          reason: selectedReason,
          comment: comment || null,
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setSelectedReason('')
        setComment('')
      }, 2000)
    } catch (err) {
      console.error('Error reporting listing:', err)
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Flag className="h-4 w-4" />
        <span>Report Listing</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Flag className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Report Listing</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Thank you for reporting this listing. Our team will review it shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Reporting: <span className="font-semibold text-gray-900">{rentalName}</span>
                </p>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-lg">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for reporting <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {flagReasons.map((reason) => (
                      <label
                        key={reason.value}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedReason === reason.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Optional Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide any additional information that might help us review this report..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedReason}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
