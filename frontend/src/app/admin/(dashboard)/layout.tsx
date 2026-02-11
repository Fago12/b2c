import { AdminHeader } from "../_components/AdminHeader";
import { AdminSidebar } from "../_components/AdminSidebar";

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-full w-full overflow-hidden bg-muted/40">
            <AdminSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
