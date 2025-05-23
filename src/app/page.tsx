import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Home } from "@/components/Home";

export default async function Page() {
  const session = await getServerSession(authOptions);
  return <Home session={session} />;
}
