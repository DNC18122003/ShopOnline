import { FileText, Ticket, Store, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar({ activeItem, onItemClick, isCollapsed, onToggleCollapse }) {
  const menuItems = [
    { id: "posts", label: "Quản lý bài đăng", icon: FileText },
    { id: "vouchers", label: "Vouchers", icon: Ticket },
  ]

  return (
    <aside className={cn(
      "min-h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header with Toggle */}
      <div className="p-4 flex items-center gap-2 justify-between border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">TechStore</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center mx-auto">
            <Store className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          <ChevronLeft className={cn(
            "w-5 h-5 text-gray-600 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                isActive
                  ? "bg-[#3B82F6] text-white"
                  : "text-gray-600 hover:bg-gray-100",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}