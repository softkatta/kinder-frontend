import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { licenseApi } from '@/api/installApi';
import { markInstallVerified, resetInstallVerificationCache } from '@/components/install/InstallGate';

const COPY: Record<string, { title: string; body: string }> = {
  invalid: {
    title: 'Invalid License',
    body: 'This installation does not have a valid SoftKatta license. After SoftKatta Admin activates the license, enter the key below to restore access.',
  },
  expired: {
    title: 'Expired Subscription',
    body: 'Your SoftKatta subscription has expired. Renew from the SoftKatta Customer Portal, then restore access below if needed.',
  },
  suspended: {
    title: 'Suspended License',
    body: 'SoftKatta Admin has suspended this license. Do not run the install wizard. When Admin Activates again, restore with your license key below (or wait for automatic heartbeat restore).',
  },
  'domain-not-authorized': {
    title: 'Domain Not Authorized',
    body: 'This domain is not authorized for the activated license. Request a domain change from the SoftKatta Customer Portal.',
  },
  'product-disabled': {
    title: 'Product Disabled',
    body: 'This SoftKatta product has been disabled for licensing. After SoftKatta Admin enables it again, restore access below.',
  },
  'unsupported-version': {
    title: 'Unsupported Version',
    body: 'This product version is not supported by your SoftKatta license. Upgrade or contact support.',
  },
  'server-verification-failed': {
    title: 'Server Verification Failed',
    body: 'The server fingerprint no longer matches the registered installation. Contact SoftKatta support.',
  },
  'grace-expired': {
    title: 'Offline Grace Period Expired',
    body: 'SoftKatta Central could not be reached within the offline grace period. Restore connectivity, then try Restore access.',
  },
  'company-api-unavailable': {
    title: 'Company API Unavailable',
    body: 'SoftKatta Central is temporarily unreachable. Try again shortly.',
  },
  'invalid-install-token': {
    title: 'License Session Ended',
    body: 'This install session was revoked (usually after SoftKatta Suspend). Do not open the install wizard. After SoftKatta Admin Activates the license, enter the key below to restore.',
  },
  'database-unavailable': {
    title: 'Database Unavailable',
    body: 'Kindergarten is already installed, but the database connection failed (wrong DB password/user in .env). Fix your host MySQL credentials. Do not run the install wizard again.',
  },
};

const CAN_REACTIVATE = new Set(['suspended', 'invalid-install-token', 'invalid', 'product-disabled', 'expired']);

export function LicenseErrorPage({ code }: { code: keyof typeof COPY }) {
  const content = COPY[code] ?? COPY.invalid;
  const [licenseKey, setLicenseKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const showReactivate = CAN_REACTIVATE.has(code);

  async function onReactivate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await licenseApi.activate(licenseKey.trim());
      resetInstallVerificationCache();
      markInstallVerified();
      setDone(true);
      window.setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch (err) {
      const ax = err as {
        response?: { data?: { message?: string; error_code?: string } };
        message?: string;
        error_code?: string;
      };
      const msg = ax.response?.data?.message ?? ax.message ?? 'Activation failed.';
      const errCode = ax.response?.data?.error_code ?? ax.error_code;
      if (errCode === 'SUSPENDED_LICENSE' || /suspend/i.test(msg)) {
        setError(
          'License is still suspended on SoftKatta. Ask SoftKatta Admin to Activate first, then try Restore again. Install wizard will not open.',
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f3e9e4_0%,_#f8f6f2_50%,_#e8ecea_100%)] px-6">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">SoftKatta License</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">{content.title}</h1>
        <p className="mt-4 text-stone-600">{content.body}</p>

        {showReactivate && !done && (
          <form onSubmit={onReactivate} className="mt-8 space-y-3 text-left">
            <label className="block text-sm text-stone-700">
              License key
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="KG-????????"
                required
                autoComplete="off"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy || !licenseKey.trim()}
              className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {busy ? 'Restoring...' : 'Restore access'}
            </button>
            <p className="text-xs text-stone-500">
              SoftKatta Admin must Activate the license first. The install wizard never opens after the first successful install.
            </p>
          </form>
        )}

        {done && <p className="mt-6 text-sm text-emerald-700">License restored. Redirecting...</p>}

        <div className="mt-8 flex justify-center">
          <Link to="/login" className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
