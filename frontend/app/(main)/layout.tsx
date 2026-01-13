import { Navbar } from "@/templates/default/components/layout/Navbar";
import { MainSidebar } from "@/templates/default/components/layout/MainSidebar";
import { SidebarProvider } from "@/templates/default/components/layout/SidebarContext";
import { SidebarToggle } from "@/templates/default/components/layout/SidebarToggle";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Navbar />
            <div className="max-w-[1700px] mx-auto pt-14 relative flex">
                <SidebarToggle />
                <MainSidebar />
                <main className="flex-1 min-w-0 pl-16 pr-4 py-4 relative transition-all duration-300 ease-in-out z-10">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
