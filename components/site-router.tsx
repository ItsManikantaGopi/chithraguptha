"use client";

import {useEffect, useRef} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import ChithragupthaApp from "@/components/chithraguptha-app";

const routes = ["/", "/garuda-purana", "/dharma", "/about"] as const;

function pathForNav(index: number) {
  return routes[index] ?? "/";
}

export default function SiteRouter() {
  const pathname = usePathname();
  const router = useRouter();
  const syncing = useRef(false);

  useEffect(() => {
    const path = pathname.replace(/\/$/, "") || "/";
    const index = routes.indexOf(path as (typeof routes)[number]);
    if (index < 0) return;

    const timer = window.setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(".cg-nav button");
      if (!buttons[index]) return;
      syncing.current = true;
      buttons[index].click();
      window.setTimeout(() => { syncing.current = false; }, 0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  function handleCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (syncing.current) return;
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>(".cg-nav button");
    if (!button) return;
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".cg-nav button"));
    const index = buttons.indexOf(button);
    if (index < 0) return;
    event.preventDefault();
    event.stopPropagation();
    router.push(pathForNav(index));
  }

  return (
    <div onClickCapture={handleCapture}>
      <ChithragupthaApp />
      <div className="cg-account-strip">
        <div className="cg-account-copy-wrap">
          <span className="cg-eyebrow">Anonymous Soul</span>
          <span className="cg-account-copy">Keep your Soul ID to return from another device.</span>
        </div>
        <Link href="/login" className="cg-account-link">Soul ID · Login</Link>
      </div>
      <style>{` .cg-account-strip{width:min(calc(100% - 40px),1160px);margin:0 auto 28px;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#0d1014;border:1px solid #292e34;border-radius:10px}.cg-account-copy-wrap{display:flex;align-items:center;gap:10px;min-width:0}.cg-account-copy{font-size:9px;color:#777168;line-height:1.4}.cg-account-link{height:34px;display:inline-flex;align-items:center;justify-content:center;padding:0 11px;border:1px solid #695225;border-radius:8px;background:#17130d;color:#d8bd7c;text-decoration:none;font-size:10px;font-weight:700;white-space:nowrap}@media(max-width:560px){.cg-account-strip{width:min(calc(100% - 20px),1160px);align-items:flex-start;flex-direction:column;gap:9px}.cg-account-link{width:100%}.cg-account-copy-wrap{align-items:flex-start;flex-direction:column;gap:4px}} `}</style>
    </div>
  );
}
