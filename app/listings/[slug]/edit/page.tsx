import { notFound, redirect } from "next/navigation";

import { updatePropertyAction } from "@/app/actions/housing";
import { PropertyForm } from "@/components/property-form";
import { getCurrentUser } from "@/lib/auth";
import { getPropertyBySlug } from "@/lib/store";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  if (property.landlordId !== user.id) redirect(`/listings/${slug}`);

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">Edit listing</h1>
      <div className="mt-8">
        <PropertyForm action={updatePropertyAction} property={property} />
      </div>
    </div>
  );
}
