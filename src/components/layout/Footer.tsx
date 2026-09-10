import Link from "next/link";
import { AppLogo } from "@/components/brand/AppLogo";
import { APP_NAME, HELPLINE_PRIMARY, HELPLINE_TOLL_FREE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[#0d241c] text-slate-200">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white px-2 py-1">
              <AppLogo size="sm" />
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">{APP_NAME}</h2>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Unofficial helper for Kashmir residents. Always verify critical plans with KPDCL.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Helplines</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`tel:${HELPLINE_PRIMARY}`} className="hover:text-white">
                {HELPLINE_PRIMARY} (complaint)
              </a>
            </li>
            <li>
              <a href={`tel:${HELPLINE_TOLL_FREE}`} className="hover:text-white">
                {HELPLINE_TOLL_FREE}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">App</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-white">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {APP_NAME}
      </div>
    </footer>
  );
}
