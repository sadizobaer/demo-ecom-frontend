/**
 * /admin → redirect to /admin/dashboard
 * This makes localhost:3000/admin go straight to the dashboard.
 */
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
