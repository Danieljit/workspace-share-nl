import { db } from "@/lib/db"
import { HomePage } from "@/components/pages/home"

export default async function Home() {
  const spaces = await db.space.findMany({
    take: 6,
    include: {
      owner: true,
    },
  })

  return <HomePage spaces={spaces} />
}
