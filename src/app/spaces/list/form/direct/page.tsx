import { Metadata } from "next"
import { ListingForm } from "@/components/spaces/listing-onboarding/form"

export const metadata: Metadata = {
  title: "Create Your Listing - WorkSpace Share",
  description: "Create your workspace listing in a few simple steps",
}

export default function DirectListingFormPage() {
  return <ListingForm />
}
