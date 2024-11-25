import { prisma } from "~/db.server";
import type { Route } from "./+types/reset-token";

export async function loader({ }: Route.LoaderArgs) {
  const tokens = await prisma.resetToken.findMany()
  return tokens
}


export default function Component() {
  return (
    <div>Tokens</div>
  )
}
