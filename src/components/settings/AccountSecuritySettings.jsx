import React from 'react';
import { useSession } from 'next-auth/react';

const SectionCard = ({ title, description, children }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-4">
    <div>
      <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
    <div className="border-t border-gray-100 pt-4">{children}</div>
  </section>
);

export default function AccountSecuritySettings() {
  const { data: session } = useSession();

  const userEmail = session?.user?.email || 'user@example.com';
  const userName = session?.user?.fullName || session?.user?.name || 'User';

  return (
    <div className="h-full overflow-y-auto rounded-xl bg-gray-50 border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Account &amp; Security
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Manage your account details, active sessions, and security
            preferences, similar to a production cloud system.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
          <span className="font-semibold">Heads up</span>
          <span className="text-amber-700">
            Account recovery, API keys, and 2FA will be added soon.
          </span>
        </div>
      </div>

      {/* Account Profile */}
      <SectionCard
        title="Account profile"
        description="Basic identity details for your Smart Cloud AI account."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 md:col-span-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-sm font-semibold">
              {userName
                .split(' ')
                .map((p) => p[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-gray-500">
            <p>
              Profile editing and account recovery contacts will be available
              soon.
            </p>
            <p className="flex items-center gap-1 text-amber-600">
              <span className="font-semibold">Account recovery</span>
              <span className="text-amber-700">will be added soon.</span>
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Active Sessions & Devices */}
      <SectionCard
        title="Active sessions & devices"
        description="Monitor where your account is signed in and remotely sign out if needed."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm text-gray-600 max-w-xl">
              This section will list browsers and devices currently signed into
              your account, including approximate location, IP address, and last
              activity time.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                disabled
              >
                Refresh sessions (coming soon)
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md bg-red-50 text-xs font-medium text-red-600 border border-red-100 cursor-not-allowed"
                disabled
              >
                Sign out of all devices
              </button>
            </div>
          </div>

          <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/80 text-xs text-gray-500">
            <p className="font-medium text-gray-600 mb-1">
              Sessions list coming soon
            </p>
            <p>
              In production, you would see a table of devices here (current
              browser highlighted, last active timestamps, and actions to sign
              out individual sessions).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Security Alerts & Preferences */}
      <SectionCard
        title="Security alerts & preferences"
        description="Control which security events should trigger notifications."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Email notifications
            </h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Login from a new device or location
                <span className="block text-xs text-gray-500">
                  Recommended. We’ll email you when we detect a suspicious sign
                  in.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Password changes
                <span className="block text-xs text-gray-500">
                  Notify when your password is updated from any device.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                disabled
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Monthly security summary
                <span className="block text-xs text-gray-500">
                  Receive a monthly email summarizing sign‑ins and key security
                  events.
                </span>
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Upcoming security features
            </h3>
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
              <p className="font-semibold text-amber-900">
                2FA / MFA will be added soon
              </p>
              <p>
                You&apos;ll be able to protect your account with an authenticator
                app, SMS, or email OTP.
              </p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
              <p className="font-semibold text-amber-900">
                API keys management will be added soon
              </p>
              <p>
                A dedicated page for creating, rotating, and revoking API keys
                for programmatic access.
              </p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
              <p className="font-semibold text-amber-900">
                Account recovery will be added soon
              </p>
              <p>
                Recovery email, phone number, and backup codes to regain access
                if you lose your primary login method.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

