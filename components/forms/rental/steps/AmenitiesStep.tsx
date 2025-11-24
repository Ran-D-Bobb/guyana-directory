'use client'

import { CheckboxGrid } from '@/components/forms/inputs/CheckboxGrid'
import {
  Wifi, Wind, Car, Waves, Utensils, WashingMachine, Tv, Droplet,
  Armchair, Shield, Zap, Trees, LayoutGrid, Dumbbell, MoveVertical,
  PawPrint, Accessibility, Flame, FireExtinguisher, Heart
} from 'lucide-react'

interface AmenitiesStepProps {
  formData: {
    amenities: string[]
    utilities_included: string[]
    house_rules: string[]
  }
  onChange: (field: string, value: string[]) => void
}

// Amenities with icons
const AMENITIES = [
  { value: 'WiFi', label: 'WiFi', icon: Wifi },
  { value: 'Air Conditioning', label: 'Air Conditioning', icon: Wind },
  { value: 'Parking', label: 'Parking', icon: Car },
  { value: 'Pool', label: 'Pool', icon: Waves },
  { value: 'Kitchen', label: 'Kitchen', icon: Utensils },
  { value: 'Washer/Dryer', label: 'Washer/Dryer', icon: WashingMachine },
  { value: 'TV', label: 'TV', icon: Tv },
  { value: 'Hot Water', label: 'Hot Water', icon: Droplet },
  { value: 'Furnished', label: 'Furnished', icon: Armchair },
  { value: 'Security', label: 'Security', icon: Shield },
  { value: 'Generator', label: 'Generator', icon: Zap },
  { value: 'Garden', label: 'Garden', icon: Trees },
  { value: 'Balcony', label: 'Balcony', icon: LayoutGrid },
  { value: 'Gym', label: 'Gym', icon: Dumbbell },
  { value: 'Elevator', label: 'Elevator', icon: MoveVertical },
  { value: 'Pet Friendly', label: 'Pet Friendly', icon: PawPrint },
  { value: 'Wheelchair Accessible', label: 'Wheelchair Accessible', icon: Accessibility },
  { value: 'Smoke Detector', label: 'Smoke Detector', icon: Flame },
  { value: 'Fire Extinguisher', label: 'Fire Extinguisher', icon: FireExtinguisher },
  { value: 'First Aid Kit', label: 'First Aid Kit', icon: Heart }
]

// Utilities
const UTILITIES = [
  { value: 'Water', label: 'Water' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Internet', label: 'Internet' },
  { value: 'Gas', label: 'Gas' }
]

// House Rules
const HOUSE_RULES = [
  { value: 'No Smoking', label: 'No Smoking' },
  { value: 'No Pets', label: 'No Pets' },
  { value: 'No Parties', label: 'No Parties' },
  { value: 'Quiet Hours', label: 'Quiet Hours' }
]

export default function AmenitiesStep({
  formData,
  onChange
}: AmenitiesStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Amenities & Features
        </h2>
        <p className="text-base text-gray-600">
          What does your property offer? (All optional)
        </p>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Property Amenities
        </h3>
        <CheckboxGrid
          label=""
          name="amenities"
          options={AMENITIES.map(amenity => {
            const Icon = amenity.icon
            return {
              value: amenity.value,
              label: amenity.label,
              icon: <Icon className="w-5 h-5" />
            }
          })}
          selected={formData.amenities}
          onChange={(selected) => onChange('amenities', selected)}
          columns={2}
        />
      </div>

      {/* Utilities Included */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Utilities Included
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {UTILITIES.map((utility) => (
            <label
              key={utility.value}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${formData.utilities_included.includes(utility.value)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={formData.utilities_included.includes(utility.value)}
                onChange={(e) => {
                  const newUtilities = e.target.checked
                    ? [...formData.utilities_included, utility.value]
                    : formData.utilities_included.filter(u => u !== utility.value)
                  onChange('utilities_included', newUtilities)
                }}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-sm font-medium ${
                formData.utilities_included.includes(utility.value)
                  ? 'text-blue-900'
                  : 'text-gray-700'
              }`}>
                {utility.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* House Rules */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          House Rules
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {HOUSE_RULES.map((rule) => (
            <label
              key={rule.value}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${formData.house_rules.includes(rule.value)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={formData.house_rules.includes(rule.value)}
                onChange={(e) => {
                  const newRules = e.target.checked
                    ? [...formData.house_rules, rule.value]
                    : formData.house_rules.filter(r => r !== rule.value)
                  onChange('house_rules', newRules)
                }}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-sm font-medium ${
                formData.house_rules.includes(rule.value)
                  ? 'text-blue-900'
                  : 'text-gray-700'
              }`}>
                {rule.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Why amenities matter</p>
            <p>Properties with detailed amenity information get 3x more inquiries. Highlight what makes your property special!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
