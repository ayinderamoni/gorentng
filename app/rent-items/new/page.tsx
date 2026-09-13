import { redirect } from "next/navigation";

import { createItemAction } from "@/app/actions/items";
import { ItemForm } from "@/components/item-form";
import { getCurrentUser } from "@/lib/auth";

export default async function NewItemPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/rent-items/new");

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">List an item</h1>
      <p className="mt-2 text-sm text-ink-soft">Same marketplace as homes — shorter bookings, daily or weekly rates.</p>
      <div className="mt-8">
        <ItemForm action={createItemAction} />
      </div>
    </div>
  );
}
