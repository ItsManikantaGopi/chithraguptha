"use client";

import {useEffect} from "react";
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

  useEffect(() => {
    const path = pathname.replace(/\/$/, "") || "/";
    const index = routes.indexOf(path as (typeof routes)[number]);
    if (index < 0) return;

    const timer = window.setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(".cg-nav button");
      buttons[index]?.click();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  function handleCapture(event: React.MouseEvent<HTMLDivElement>) {
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
        <div>
          <span className="cg-eyebrow">Anonymous Soul</span>
          <span className="cg-account-copy">Keep your Soul ID to return from another device.</span>
        </div>
        <Link href="/login" className="cg-account-link">Soul ID · Login</Link>
      </div>
    </div>
  );
}
