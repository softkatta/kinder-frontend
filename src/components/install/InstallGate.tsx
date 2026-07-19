import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { installApi, licenseApi } from '@/api/installApi';

const EXEMPT_PREFIXES = ['/install', '/license/'];

/** Cached after first successful check — avoids "Checking installation…" on every route change. */
let installVerified: boolean | null = null;

export function resetInstallVerificationCache(): void {
  installVerified = null;
}

export function markInstallVerified(): void {
  installVerified = true;
}

function isExemptPath(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function licenseRestorePath(lastErrorCode?: string | null): string {
  const map: Record<string, string> = {
    INVALID_LICENSE: '/license/invalid',
    SUSPENDED_LICENSE: '/license/suspended',
    EXPIRED_SUBSCRIPTION: '/license/expired',
    PRODUCT_DISABLED: '/license/product-disabled',
    INVALID_INSTALL_TOKEN: '/license/invalid-install-token',
    DOMAIN_NOT_AUTHORIZED: '/license/domain-not-authorized',
    GRACE_EXPIRED: '/license/grace-expired',
    COMPANY_API_UNAVAILABLE: '/license/company-api-unavailable',
    DATABASE_UNAVAILABLE: '/license/database-unavailable',
  };
  return map[lastErrorCode ?? ''] ?? '/license/invalid-install-token';
}

type GateResult =
  | { kind: 'ok' }
  | { kind: 'install' }
  | { kind: 'license'; path: string }
  | { kind: 'database' };

/**
 * Fail closed: incomplete install → wizard. Installed but license/DB dead → never wizard again.
 */
async function resolveGate(): Promise<GateResult> {
  if (installVerified === true) {
    return { kind: 'ok' };
  }

  try {
    const status = await installApi.status();
    if (status.database_unavailable || status.last_error_code === 'DATABASE_UNAVAILABLE') {
      return { kind: 'database' };
    }
    if (status.installed && status.has_license && !status.needs_reactivation) {
      installVerified = true;
      return { kind: 'ok' };
    }
    if (status.installed) {
      // SoftKatta Admin may have Activated — try online recover before the restore page.
      try {
        await licenseApi.verify(true);
        installVerified = true;
        return { kind: 'ok' };
      } catch {
        return { kind: 'license', path: licenseRestorePath(status.last_error_code) };
      }
    }
    return { kind: 'install' };
  } catch (err) {
    const code = (err as { error_code?: string; status?: number })?.error_code;
    const status = (err as { status?: number })?.status;
    if (code === 'DATABASE_UNAVAILABLE') {
      return { kind: 'database' };
    }
    if (code === 'NOT_INSTALLED') {
      return { kind: 'install' };
    }
    // Network/CORS/5xx on a fresh site → allow installer; never pretend DB is broken.
    if (status === 503 || status === 404 || status === 0 || status === undefined) {
      return { kind: 'install' };
    }
    return { kind: 'license', path: '/license/company-api-unavailable' };
  }
}

/**
 * Blocks the entire app until SoftKatta install + license are complete.
 * Already-installed products never reopen the install wizard.
 */
export function InstallGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const exempt = isExemptPath(location.pathname);

  const [ready, setReady] = useState(() => exempt || installVerified === true);
  const [blockingMessage, setBlockingMessage] = useState('Checking installation…');

  useEffect(() => {
    if (exempt) {
      setReady(true);
      return;
    }

    if (installVerified === true) {
      setReady(true);
      return;
    }

    let cancelled = false;

    setReady(false);
    setBlockingMessage('Checking installation…');

    resolveGate().then((result) => {
      if (cancelled) return;
      if (result.kind === 'ok') {
        setReady(true);
        return;
      }
      if (result.kind === 'license') {
        setBlockingMessage('License restore required. Redirecting…');
        navigate(result.path, { replace: true });
        return;
      }
      if (result.kind === 'database') {
        setBlockingMessage('Database unavailable. Redirecting…');
        navigate('/license/database-unavailable', { replace: true });
        return;
      }
      setBlockingMessage('Installation required. Redirecting…');
      navigate('/install', { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [exempt, location.pathname, navigate]);

  if (exempt) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-stone-50 px-6 text-center text-sm text-stone-500">
        <p>{blockingMessage}</p>
        <p className="text-xs text-stone-400">Kindergarten is locked until SoftKatta installation and license are valid.</p>
      </div>
    );
  }

  return <>{children}</>;
}
