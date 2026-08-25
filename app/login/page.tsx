import type {Metadata} from "next";
import SoulLogin from "@/components/soul-login";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soul ID — Chithraguptha",
  description: "Return to your anonymous Chithraguptha Soul using your Soul ID and password.",
};

export default function LoginPage() {
  return <SoulLogin />;
}
