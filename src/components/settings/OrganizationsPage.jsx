import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

export default function OrganizationsPage() {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgKey, setNewOrgKey] = useState('');
  const [newOrgPublic, setNewOrgPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const [lookupKey, setLookupKey] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const [invites, setInvites] = useState([]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/organizations');
      if (!res.ok) throw new Error('Failed to load organizations');
      const data = await res.json();
      setOrganizations(data);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const res = await fetch('/api/organizations/invites');
      if (!res.ok) return;
      const data = await res.json();
      setInvites(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrganizations();
    loadInvites();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newOrgKey.trim()) {
      toast.error('Please provide both name and organization ID');
      return;
    }
    try {
      setCreating(true);
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName.trim(),
          orgKey: newOrgKey.trim(),
          isPublic: newOrgPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }
      toast.success('Organization created');
      setNewOrgName('');
      setNewOrgKey('');
      setNewOrgPublic(true);
      loadOrganizations();
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const handleLookupOrg = async () => {
    if (!lookupKey.trim()) {
      toast.error('Enter an organization ID');
      return;
    }
    try {
      setLookupLoading(true);
      setLookupResult(null);
      const res = await fetch(
        `/api/organizations/lookup?orgKey=${encodeURIComponent(
          lookupKey.trim(),
        )}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Organization not found');
      }
      setLookupResult(data);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to find organization');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleJoinOrg = async () => {
    if (!lookupResult?.organization?.id) return;
    try {
      setJoinLoading(true);
      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: lookupResult.organization.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join organization');
      }

      if (data.status === 'joined') {
        toast.success('Joined organization');
        loadOrganizations();
      } else if (data.status === 'requested') {
        toast.info('Join request sent to organization admins');
      } else if (data.status === 'already_member') {
        toast.info('You are already a member of this organization');
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to join organization');
    } finally {
      setJoinLoading(false);
    }
  };

  const currentUserEmail = session?.user?.email || 'you@example.com';

  return (
    <div className="h-full overflow-y-auto rounded-xl bg-gray-50 border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Create or join organizations to collaborate and share cloud files
            with your team. Each organization has a unique ID that others can
            use to join.
          </p>
        </div>
      </div>

      {/* Create organization */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Create organization
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Define a name and a unique organization ID that teammates can use
              to join.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateOrg}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 md:items-end"
        >
          <div className="md:col-span-2 self-start">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Organization name
            </label>
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Acme Research Team"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Organization ID
            </label>
            <input
              type="text"
              value={newOrgKey}
              onChange={(e) =>
                setNewOrgKey(e.target.value.toLowerCase().replace(/\s+/g, '-'))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="acme-research"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Must be unique across all organizations.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={newOrgPublic}
                onChange={(e) => setNewOrgPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Public organization (users with the ID can join directly)
            </label>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create organization'}
            </button>
          </div>
        </form>
      </section>

      {/* Your organizations + invites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Your organizations
            </h2>
            <span className="text-xs text-gray-400">
              {organizations.length} organization
              {organizations.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoading ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              Loading organizations...
            </div>
          ) : organizations.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400 text-sm">
              <p>No organizations yet.</p>
              <p className="text-xs text-gray-500 mt-1">
                Create one above or join using an organization ID.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {org.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: <span className="font-mono">{org.orgKey}</span>
                      <span className="mx-2">•</span>
                      {org.isPublic ? 'Public' : 'Private'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Role: {org.role} • Access: {org.accessLevel}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 ${
                        org.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {org.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(org.orgKey)
                          .then(() => toast.success('Organization ID copied'));
                      }}
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Join by organization ID
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Ask an admin for the organization ID and use it to join. Public
              orgs add you directly; private orgs create a join request.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupKey}
                onChange={(e) => setLookupKey(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. acme-research"
              />
              <button
                type="button"
                onClick={handleLookupOrg}
                disabled={lookupLoading}
                className="px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-black disabled:opacity-60"
              >
                {lookupLoading ? 'Checking...' : 'Find'}
              </button>
            </div>

            {lookupResult && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1 text-xs">
                <p className="text-sm font-semibold text-gray-900">
                  {lookupResult.organization.name}
                </p>
                <p className="text-gray-600">
                  ID:{' '}
                  <span className="font-mono">
                    {lookupResult.organization.orgKey}
                  </span>{' '}
                  • {lookupResult.organization.isPublic ? 'Public' : 'Private'}
                </p>
                {lookupResult.membership ? (
                  <p className="text-green-700">
                    You are already a member of this organization.
                  </p>
                ) : lookupResult.joinRequest ? (
                  <p className="text-amber-700">
                    Join request status: {lookupResult.joinRequest.status}
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={joinLoading}
                    onClick={handleJoinOrg}
                    className="mt-2 inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {joinLoading
                      ? 'Submitting...'
                      : lookupResult.organization.isPublic
                        ? 'Join organization'
                        : 'Request access'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Invites for {currentUserEmail}
            </h3>
            {invites.length === 0 ? (
              <p className="text-xs text-gray-400">
                No pending organization invites.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <p className="text-gray-800">
                      {inv.organizationName}{' '}
                      <span className="text-gray-500">
                        ({inv.orgKey}) • Access: {inv.accessLevel}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Accept / decline actions will be available soon.
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
