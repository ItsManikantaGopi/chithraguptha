import LiveLedger from "@/components/live-ledger";

// The Ledger requires browser/runtime Supabase environment variables.
// Keep the route dynamic so CI builds without production secrets do not
// attempt to initialize the client during static prerendering.
export const dynamic = "force-dynamic";

export default function Home() {
  return <LiveLedger />;
}
