import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { installApi, type RequirementCheck } from '@/api/installApi';
import { markInstallVerified } from '@/components/install/InstallGate';

const STEPS = [
  'Welcome',
  'Server Requirements',
  'Database Configuration',
  'SoftKatta Connection',
  'Database Migration',
  'Administrator Account',
  'License Activation',
  'Domain Verification',
  'Download Configuration',
  'Installation Complete',
] as const;

const SOFTKATTA_COMPANY_API_PLACEHOLDER = 'https://api.softkatta.in/api/v1/company';
const PRODUCT_SLUG = 'kindergarten';

function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.localhost');
}

function resolveProductSlug(fromApi?: string, current?: string): string {
  const slug = (fromApi || current || '').trim()
  if (slug === PRODUCT_SLUG || slug.includes('kindergarten')) return slug || PRODUCT_SLUG
  return PRODUCT_SLUG
}

function resolveDetectedDomain(apiDomain?: string): string {
  const browserHost = typeof window !== 'undefined' ? window.location.hostname : '';
  if (browserHost && !isLoopbackHost(browserHost)) return browserHost;
  if (apiDomain && !isLoopbackHost(apiDomain)) return apiDomain;
  return browserHost || apiDomain || '…';
}

function isLoopbackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === '127.0.0.1' || host === 'localhost' || host === '::1';
  } catch {
    return false;
  }
}

/** Prefer a real Company API URL; never keep local-dev loopback defaults on a public host. */
function resolveCompanyApiUrl(fromApi?: string, current?: string): string {
  const candidates = [fromApi, current].filter((v): v is string => Boolean(v && v.trim()));
  for (const url of candidates) {
    if (!isLoopbackUrl(url)) return url.replace(/\/+$/, '');
  }
  // On localhost/dev, loopback SoftKatta Central is fine as a starting point.
  if (typeof window !== 'undefined' && isLoopbackUrl(window.location.origin)) {
    return current && isLoopbackUrl(current) ? current : 'http://127.0.0.1:8090/api/v1/company';
  }
  return '';
}

export function InstallWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof installApi.status>> | null>(null);
  const [checks, setChecks] = useState<Record<string, RequirementCheck>>({});
  const [requirementsPassed, setRequirementsPassed] = useState(false);
  const [db, setDb] = useState({ host: 'localhost', port: '3306', database: 'kindergarten_erp', username: 'root', password: '' });
  const [softkatta, setSoftkatta] = useState({
    company_api_url: resolveCompanyApiUrl(),
    public_api_key: '',
    api_secret: '',
    product_slug: PRODUCT_SLUG,
    product_version: '1.0.0',
    app_url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000',
    require_https: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
    offline_grace_days: 1,
    verify_interval_hours: 0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [admin, setAdmin] = useState({ name: '', email: '', password: '' });
  const [licenseKey, setLicenseKey] = useState('');
  const [activation, setActivation] = useState<{ bound_domain?: string; installation_id?: string; configuration_profile?: unknown } | null>(null);
  const [configuration, setConfiguration] = useState<{
    installation_id?: string;
    bound_domain?: string | null;
    plan?: string | null;
    modules?: Record<string, boolean>;
    limits?: Record<string, number>;
    product_slug?: string;
    product_version?: string;
  } | null>(null);

  useEffect(() => {
    installApi
      .status()
      .then((s) => {
        setStatus(s);
        if (s.installed && s.has_license && !s.needs_reactivation) {
          markInstallVerified();
          navigate('/', { replace: true });
          return;
        }
        // Already installed: never show the full wizard again — license restore page only.
        if (s.installed) {
          const map: Record<string, string> = {
            SUSPENDED_LICENSE: '/license/suspended',
            EXPIRED_SUBSCRIPTION: '/license/expired',
            PRODUCT_DISABLED: '/license/product-disabled',
            INVALID_INSTALL_TOKEN: '/license/invalid-install-token',
          };
          navigate(map[s.last_error_code ?? ''] ?? '/license/invalid-install-token', { replace: true });
          return;
        }
        const api = s.company_api;
        if (s.database) {
          setDb((prev) => ({
            host: s.database?.host || prev.host,
            port: s.database?.port || prev.port,
            database: s.database?.database || prev.database,
            username: s.database?.username || prev.username,
            password: prev.password,
          }));
        }
        if (api) {
          const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';
          setSoftkatta((prev) => ({
            ...prev,
            company_api_url: resolveCompanyApiUrl(api.company_api_url, prev.company_api_url),
            product_slug: resolveProductSlug(api.product_slug, prev.product_slug),
            product_version: api.product_version || prev.product_version,
            // Prefer the public site origin for license domain binding (not the API host).
            app_url: browserOrigin || api.app_url || prev.app_url,
            require_https: api.require_https ?? prev.require_https,
            offline_grace_days: api.offline_grace_days ?? prev.offline_grace_days,
            verify_interval_hours: api.verify_interval_hours ?? prev.verify_interval_hours,
          }));
        }
      })
      .catch((err) => {
        const code = (err as { error_code?: string })?.error_code;
        if (code === 'DATABASE_UNAVAILABLE') {
          navigate('/license/database-unavailable', { replace: true });
        }
      });
  }, [navigate]);

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  async function next() {
    setError(null);
    setBusy(true);
    try {
      if (step === 1) {
        const req = await installApi.requirements();
        setChecks(req.checks);
        setRequirementsPassed(req.passed);
        if (!req.passed) {
          setError('Resolve failed requirements before continuing.');
          return;
        }
      }
      if (step === 2) {
        await installApi.database(db);
      }
      if (step === 3) {
        await installApi.companyApi({
          ...softkatta,
          product_slug: PRODUCT_SLUG,
          offline_grace_days: Number(softkatta.offline_grace_days),
          verify_interval_hours: Number(softkatta.verify_interval_hours),
        });
        const s = await installApi.status();
        setStatus(s);
      }
      if (step === 4) {
        await installApi.migrate();
      }
      if (step === 5) {
        await installApi.admin(admin);
      }
      if (step === 6) {
        const result = await installApi.activate(licenseKey);
        setActivation(result as typeof activation);
      }
      if (step === 8) {
        const config = await installApi.configuration();
        setConfiguration(config);
      }
      if (step === 9) {
        await installApi.complete();
        markInstallVerified();
        navigate('/login', { replace: true });
        return;
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message ?? 'Step failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1ef_0%,_#f7f7f5_45%,_#ece8e1_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-800 uppercase">SoftKatta</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-slate-900">Kindergarten Install</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Secure installation wizard. SoftKatta credentials and database settings are written to the server .env —
            you never need to edit env files by hand.
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded bg-slate-200">
            <div className="h-full bg-teal-700 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </header>

        <main className="flex-1 rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur">
          {step === 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Welcome</h2>
              <p className="text-slate-600">
                This wizard will configure your database, SoftKatta Company API, run migrations, create your
                super administrator (only here — never via seeder), activate your license, bind the domain, and
                finish product registration for <strong>Kindergarten</strong>.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li>
                  Detected domain: {resolveDetectedDomain(status?.domain)}
                </li>
                <li>Product version: {status?.product_version || softkatta.product_version}</li>
                <li>
                  SoftKatta API:{' '}
                  {status?.company_api_configured ? 'already configured' : 'will be entered in this wizard'}
                </li>
              </ul>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Server Requirements</h2>
              <button
                type="button"
                className="text-sm text-teal-800 underline"
                onClick={async () => {
                  const req = await installApi.requirements();
                  setChecks(req.checks);
                  setRequirementsPassed(req.passed);
                }}
              >
                Run checks
              </button>
              <div className="space-y-2">
                {Object.values(checks).map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span>{c.label}</span>
                    <span className={c.ok ? 'text-teal-700' : 'text-red-600'}>{c.ok ? 'OK' : c.value}</span>
                  </div>
                ))}
              </div>
              {!requirementsPassed && Object.keys(checks).length > 0 && (
                <p className="text-sm text-red-600">Fix failed checks before continuing.</p>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Database Configuration</h2>
              <p className="text-sm text-slate-600">
                On your host use <strong>Host localhost</strong> and <strong>Port 3306</strong>. If Access denied
                (1045) appears: hosting panel → Databases → MySQL → user ⋮ → <strong>Change password</strong>, then paste
                the new password below (browser may autofill the wrong one). Leave password blank only if{' '}
                <code className="rounded bg-slate-100 px-1">.env</code> already has the correct DB_PASSWORD.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['host', 'port', 'database', 'username', 'password'] as const).map((field) => (
                  <label key={field} className="block text-sm">
                    <span className="mb-1 block capitalize text-slate-600">{field}</span>
                    <input
                      type={field === 'password' ? 'password' : 'text'}
                      name={`install_db_${field}`}
                      autoComplete={field === 'password' ? 'new-password' : 'off'}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                      value={db[field]}
                      onChange={(e) => setDb((d) => ({ ...d, [field]: e.target.value }))}
                      placeholder={
                        field === 'password'
                          ? status?.database?.password_set
                            ? 'Leave blank to keep existing .env password'
                            : 'Paste MySQL password from hosting panel'
                          : undefined
                      }
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">SoftKatta Connection</h2>
              <p className="text-sm text-slate-600">
                Enter SoftKatta Central credentials from your SoftKatta dashboard. Values are saved to the server{' '}
                <code className="rounded bg-slate-100 px-1">.env</code> automatically — no manual editing needed.
                Use the SoftKatta Central Company API URL (not this product&apos;s API host).
              </p>
              <div className="grid gap-3">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-slate-600">Application URL (APP_URL)</span>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={softkatta.app_url}
                    onChange={(e) => setSoftkatta((s) => ({ ...s, app_url: e.target.value }))}
                    placeholder="https://your-domain.com"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Public site URL for license domain binding — use https://your-kindergarten-domain.com (not API).
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Company API URL</span>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                    value={softkatta.company_api_url}
                    onChange={(e) => setSoftkatta((s) => ({ ...s, company_api_url: e.target.value }))}
                    placeholder={SOFTKATTA_COMPANY_API_PLACEHOLDER}
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    SoftKatta Central Company API — usually {SOFTKATTA_COMPANY_API_PLACEHOLDER}
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Public API Key</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                    value={softkatta.public_api_key}
                    onChange={(e) => setSoftkatta((s) => ({ ...s, public_api_key: e.target.value }))}
                    placeholder={status?.company_api?.api_secret_set ? 'Leave blank to keep existing' : 'sk_pub_…'}
                    autoComplete="off"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">API Secret</span>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                    value={softkatta.api_secret}
                    onChange={(e) => setSoftkatta((s) => ({ ...s, api_secret: e.target.value.trim() }))}
                    placeholder={status?.company_api?.api_secret_set ? 'Leave blank to keep existing' : 'sk_sec_…'}
                    autoComplete="new-password"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    SoftKatta Admin → Product Integrations → kindergarten → Reveal secret (must match the public key).
                  </span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Product Slug</span>
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
                      value={PRODUCT_SLUG}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Product Version</span>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      value={softkatta.product_version}
                      onChange={(e) => setSoftkatta((s) => ({ ...s, product_version: e.target.value }))}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                className="text-sm text-teal-800 underline"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
              </button>

              {showAdvanced && (
                <div className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Offline grace (days)</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      value={softkatta.offline_grace_days}
                      onChange={(e) =>
                        setSoftkatta((s) => ({ ...s, offline_grace_days: Number(e.target.value) || 5 }))
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Verify interval (hours)</span>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      value={softkatta.verify_interval_hours}
                      onChange={(e) =>
                        setSoftkatta((s) => ({ ...s, verify_interval_hours: Number(e.target.value) || 24 }))
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={softkatta.require_https}
                      onChange={(e) => setSoftkatta((s) => ({ ...s, require_https: e.target.checked }))}
                    />
                    <span className="text-slate-600">Require HTTPS for Company API</span>
                  </label>
                </div>
              )}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Database Migration</h2>
              <p className="text-slate-600">
                Run migrations and seed roles/permissions. No admin user is created here — that happens in the next step.
              </p>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Administrator Account</h2>
              <p className="text-sm text-slate-600">
                This creates the only super admin for this installation. Choose a strong password — it is not seeded from
                .env.
              </p>
              <div className="grid gap-3">
                {(['name', 'email', 'password'] as const).map((field) => (
                  <label key={field} className="block text-sm">
                    <span className="mb-1 block capitalize text-slate-600">{field}</span>
                    <input
                      type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      value={admin[field]}
                      onChange={(e) => setAdmin((a) => ({ ...a, [field]: e.target.value }))}
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">License Activation</h2>
              <p className="text-sm text-slate-600">
                Enter your SoftKatta license key. Domain, product slug, version, installation ID, and server fingerprint
                are detected automatically on the server.
              </p>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">License Key</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="KG-••••••••"
                />
              </label>
            </section>
          )}

          {step === 7 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Domain Verification</h2>
              <p className="text-slate-600">
                License will be bound to: <strong>{activation?.bound_domain ?? status?.domain}</strong>
              </p>
              <p className="text-sm text-slate-500">Future requests from another domain will be rejected.</p>
            </section>
          )}

          {step === 8 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Download Configuration</h2>
              <p className="text-slate-600">
                Plan and entitlements downloaded from SoftKatta Central (no secrets).
              </p>
              <ul className="space-y-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                <li>Installation ID: <code>{configuration?.installation_id ?? activation?.installation_id ?? '—'}</code></li>
                <li>Bound domain: <strong>{configuration?.bound_domain ?? activation?.bound_domain ?? '—'}</strong></li>
                <li>Plan: {configuration?.plan ?? '—'}</li>
                <li>Product: {configuration?.product_slug ?? status?.product_slug} @ {configuration?.product_version ?? status?.product_version}</li>
                <li>Modules: {configuration?.modules ? Object.keys(configuration.modules).join(', ') || 'all' : '—'}</li>
                <li>Limits: {configuration?.limits ? Object.entries(configuration.limits).map(([k, v]) => `${k}=${v}`).join(', ') : '—'}</li>
              </ul>
              <p className="text-sm text-slate-500">Install token is stored encrypted on the server only.</p>
            </section>
          )}

          {step === 9 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Installation Complete</h2>
              <p className="text-slate-600">
                Click finish to lock the installer and open the login screen. Sign in with the administrator account you
                created in this wizard.
              </p>
            </section>
          )}

          {error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </main>

        <footer className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={busy || step === 0}
            onClick={back}
            className="rounded-lg px-4 py-2 text-sm text-slate-600 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={next}
            className="rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-900 disabled:opacity-50"
          >
            {busy ? 'Working…' : step === 9 ? 'Finish' : 'Continue'}
          </button>
        </footer>
      </div>
    </div>
  );
}
