import { LayoutDashboard, FileText, ClipboardCheck, Package, User, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

type MenuItem = {
  icon: any;
  label: string;
  path?: string;
  subItems?: { label: string; path: string }[];
};

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
    subItems: [
      { label: "Tracking Transaksi", path: "/tracking" },
    ],
  },
  {
    icon: FileText,
    label: "Approval",
    path: "/approval",
    subItems: [
      { label: "Pengajuan", path: "/pengajuan" },
    ],
  },
  {
    icon: ClipboardCheck,
    label: "Form Evaluasi",
    path: "/evaluasi",
    subItems: [
      { label: "Progres Dokumen", path: "/evaluasi/progres" },
    ],
  },
  {
    icon: Package,
    label: "Pengadaan",
    path: "/pengadaan",
  },
  {
    icon: User,
    label: "User Konfirmasi Pembayaran",
    path: "/konfirmasi-pembayaran",
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Dashboard: true,
    Approval: false,
    "Form Evaluasi": false,
    Pengadaan: false,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isPathActive = (path: string) => location.pathname === path;
  const isGroupActive = (subItems?: { path: string }[]) =>
    subItems?.some((item) => isPathActive(item.path));

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          ProcureApp
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Procurement System</p>
      </div>

      <nav className="px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openGroups[item.label];
          const isActive = item.path ? isPathActive(item.path) : isGroupActive(item.subItems);

          if (!hasSubItems) {
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          }

          return (
            <div key={item.label}>
              <Link
                to={item.path!}
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isPathActive(item.path!) 
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isActive 
                    ? "bg-muted" 
                    : "hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isOpen ? "rotate-180" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleGroup(item.label);
                  }}
                />
              </Link>

              {isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems?.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isPathActive(subItem.path)
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
