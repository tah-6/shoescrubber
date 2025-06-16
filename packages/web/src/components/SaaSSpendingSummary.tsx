import React from 'react';
import { SaaSTool } from '../types/saas-tools';

interface SaaSSpendingSummaryProps {
  tools: SaaSTool[];
  loading?: boolean;
}

export const SaaSSpendingSummary: React.FC<SaaSSpendingSummaryProps> = ({
  tools,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalMonthlySpending = tools.reduce((total, tool) => total + tool.monthlyCost, 0);
  const totalSeats = tools.reduce((total, tool) => total + tool.seats, 0);
  const averageCostPerTool = tools.length > 0 ? totalMonthlySpending / tools.length : 0;
  const averageCostPerSeat = totalSeats > 0 ? totalMonthlySpending / totalSeats : 0;

  // Calculate usage insights
  const now = new Date();
  const activeTools = tools.filter(tool => {
    const lastUsed = new Date(tool.lastUsed);
    const diffDays = Math.ceil((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  const inactiveTools = tools.filter(tool => {
    const lastUsed = new Date(tool.lastUsed);
    const diffDays = Math.ceil((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  });

  const potentialSavings = inactiveTools.reduce((total, tool) => total + tool.monthlyCost, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = [
    {
      title: 'Monthly Spending',
      value: formatCurrency(totalMonthlySpending),
      subtitle: `${formatCurrency(totalMonthlySpending * 12)}/year`,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Active Tools',
      value: tools.length.toString(),
      subtitle: `${activeTools.length} used this week`,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Total Seats',
      value: totalSeats.toString(),
      subtitle: `${formatCurrency(averageCostPerSeat)}/seat`,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Potential Savings',
      value: formatCurrency(potentialSavings),
      subtitle: `${inactiveTools.length} unused tools`,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: potentialSavings > 0 ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 