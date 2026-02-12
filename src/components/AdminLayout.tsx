import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebarContent } from "@/components/AdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-56 border-r border-border bg-background shrink-0 sticky top-0 h-screen overflow-y-auto">
          <AdminSidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-3 py-2 flex items-center gap-2 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <AdminSidebarContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          <span className="text-sm font-semibold text-muted-foreground">Painel Admin</span>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
