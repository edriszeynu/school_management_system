import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";
import LandingPage from "@/components/landing-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(getDashboardPath(session.user?.role));
  }
  return <LandingPage />;
}
