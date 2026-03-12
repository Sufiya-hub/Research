import React from 'react';

const plans = [
  {
    id: 'free',
    name: 'No Plan',
    badge: 'Current',
    price: '$0',
    description: 'Best for getting started and testing.',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Recommended',
    price: '$19 / month',
    description: 'For individual power users and professionals.',
  },
  {
    id: 'plus',
    name: 'Plus',
    badge: 'Teams',
    price: '$49 / month',
    description: 'For small teams and organizations.',
  },
];

const features = [
  {
    id: 'ai',
    label: 'AI features (chat, summarization)',
    values: ['Standard', 'Priority', 'Priority + higher limits'],
  },
  {
    id: 'rag',
    label: 'RAG (file‑aware Q&A)',
    values: [
      'Limited context',
      'Extended context',
      'Extended + team workspace',
    ],
  },
  {
    id: 'storage',
    label: 'Cloud storage limits',
    values: ['10 GB', '250 GB', '1 TB'],
  },
  {
    id: 'api',
    label: 'API keys',
    values: ['Not available', '1 key', '5 keys'],
  },
  {
    id: 'org',
    label: 'Organizational sharing',
    values: ['Basic file links', 'Advanced sharing', 'Org workspaces'],
  },
];

const checkIcon = (
  <svg
    className="h-4 w-4 text-green-600"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207a1 1 0 011.414-1.414L8.5 11.586l6.793-6.793a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function StorageLimitsSettings() {
  return (
    <div className="h-full overflow-y-auto rounded-xl bg-gray-50 border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Storage Limits &amp; Plans
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Compare available plans for Smart Cloud AI. Upgrades, billing, and
            plan management will be enabled soon, but this page already reflects
            how a production system would communicate limits and features.
          </p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800 max-w-xs">
          <p className="font-semibold text-amber-900">Upgrades coming soon</p>
          <p>
            Plan changes, billing, and usage graphs are not yet active in this
            environment.
          </p>
        </div>
      </div>

      {/* Plans comparison table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Features
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {plan.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {plan.price}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          plan.id === 'free'
                            ? 'bg-gray-100 text-gray-700'
                            : plan.id === 'pro'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {features.map((feature) => (
                <tr key={feature.id} className="align-top">
                  <td className="py-3 pl-4 pr-3 text-xs md:text-sm font-medium text-gray-800">
                    {feature.label}
                  </td>
                  {plans.map((plan, idx) => {
                    const value = feature.values[idx];
                    const hasFeature =
                      typeof value === 'string' && value.trim() !== '';
                    const isComingSoon = value
                      .toLowerCase()
                      .includes('coming soon');

                    return (
                      <td
                        key={plan.id}
                        className="px-4 py-3 text-xs md:text-sm text-gray-700"
                      >
                        <div className="flex items-start gap-2">
                          {hasFeature && !isComingSoon && checkIcon}
                          <span
                            className={
                              isComingSoon
                                ? 'text-amber-700 text-xs md:text-sm'
                                : ''
                            }
                          >
                            {value}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
          <p className="font-semibold text-gray-800 text-sm">AI features</p>
          <p>
            Higher plans unlock more generous AI usage limits and priority
            access to new features as they are rolled out.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
          <p className="font-semibold text-gray-800 text-sm">
            RAG &amp; storage
          </p>
          <p>
            RAG quality improves with more storage and larger context windows on
            Pro and Plus.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
          <p className="font-semibold text-gray-800 text-sm">
            API keys &amp; organization
          </p>
          <p>
            API keys and organizational sharing will be surfaced here once those
            capabilities are enabled in the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
