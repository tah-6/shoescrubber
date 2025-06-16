import React, { useState, useEffect } from 'react';
import { SaaSTool, SaaSToolFormData } from '../types/saas-tools';

const CATEGORIES = [
  'Productivity',
  'Design',
  'Development',
  'Marketing',
  'Sales',
  'Communication',
  'Analytics',
  'Finance',
  'HR',
  'Other'
];

interface SaaSToolFormProps {
  tool?: SaaSTool;
  onSubmit: (data: SaaSToolFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const SaaSToolForm: React.FC<SaaSToolFormProps> = ({
  tool,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<SaaSToolFormData>({
    name: '',
    monthlyCost: 0,
    seats: 1,
    lastUsed: new Date().toISOString().split('T')[0],
    category: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<SaaSToolFormData>>({});

  // Populate form when editing
  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        monthlyCost: tool.monthlyCost,
        seats: tool.seats,
        lastUsed: new Date(tool.lastUsed).toISOString().split('T')[0],
        category: tool.category || '',
        description: tool.description || ''
      });
    }
  }, [tool]);

  const validateForm = (): boolean => {
    const newErrors: Partial<SaaSToolFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tool name is required';
    }

    if (formData.monthlyCost < 0) {
      newErrors.monthlyCost = 'Monthly cost must be positive';
    }

    if (formData.seats < 1) {
      newErrors.seats = 'Number of seats must be at least 1';
    }

    if (!formData.lastUsed) {
      newErrors.lastUsed = 'Last used date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: SaaSToolFormData = {
      ...formData,
      lastUsed: new Date(formData.lastUsed + 'T00:00:00.000Z').toISOString(),
    };

    const success = await onSubmit(submitData);
    if (success && !tool) {
      // Reset form if creating new tool
      setFormData({
        name: '',
        monthlyCost: 0,
        seats: 1,
        lastUsed: new Date().toISOString().split('T')[0],
        category: '',
        description: ''
      });
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tool Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Tool Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Notion, Slack, Figma"
            disabled={loading}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Monthly Cost */}
        <div>
          <label htmlFor="monthlyCost" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Cost ($) *
          </label>
          <input
            type="number"
            id="monthlyCost"
            min="0"
            step="0.01"
            value={formData.monthlyCost}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlyCost: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            disabled={loading}
          />
          {errors.monthlyCost && <p className="text-red-500 text-sm mt-1">{errors.monthlyCost}</p>}
        </div>

        {/* Seats */}
        <div>
          <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Seats *
          </label>
          <input
            type="number"
            id="seats"
            min="1"
            value={formData.seats}
            onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1"
            disabled={loading}
          />
          {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
        </div>

        {/* Last Used */}
        <div>
          <label htmlFor="lastUsed" className="block text-sm font-medium text-gray-700 mb-2">
            Last Used Date *
          </label>
          <input
            type="date"
            id="lastUsed"
            value={formData.lastUsed}
            onChange={(e) => setFormData(prev => ({ ...prev, lastUsed: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {errors.lastUsed && <p className="text-red-500 text-sm mt-1">{errors.lastUsed}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of how you use this tool..."
            disabled={loading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : (tool ? 'Update Tool' : 'Add Tool')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}; 