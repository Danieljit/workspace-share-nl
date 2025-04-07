import { Metadata } from "next"
import { ListingOnboardingLanding } from "@/components/spaces/listing-onboarding/landing"

export const metadata: Metadata = {
  title: "List Your Space - WorkSpace Share",
  description: "Turn your empty space into income by listing your workspace for others to book",
}

export default function ListSpacePage() {
  return <ListingOnboardingLanding />
}
