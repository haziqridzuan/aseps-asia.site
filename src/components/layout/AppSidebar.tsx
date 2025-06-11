import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Get version from package.json
const version = import.meta.env.VITE_APP_VERSION || '1.1.11'; // Fallback to current version
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ExternalLink,
  Calendar,
  Package,
  Settings,
  Users,
  FileText,
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  LogOut,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const navItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: FileText,
  },
  {
    title: 'Clients',
    path: '/clients',
    icon: Users,
  },
  {
    title: 'Suppliers',
    path: '/suppliers',
    icon: Package,
  },
  {
    title: 'Timeline',
    path: '/timeline',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'External Links',
    path: '/external-links',
    icon: ExternalLink,
  },
];

const bottomNavItems = [
  {
    title: 'Help',
    icon: HelpCircle,
    path: '/help',
  },
  {
    title: 'Feedback',
    icon: MessageSquare,
    path: '/feedback',
  },
  {
    title: 'Admin',
    path: '/admin',
    icon: Settings,
  },
];

import { useNavigate } from 'react-router-dom';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [isHidden, setIsHidden] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const showSidebar = () => {
    setIsHidden(false);
    setIsCollapsed(false);
  };

  // Auto-collapse on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  return (
    <TooltipProvider delayDuration={100}>
      {/* Floating button to show sidebar when hidden */}
      {isHidden && (
        <Button
          onClick={showSidebar}
          className="fixed top-4 left-4 z-50 rounded-full w-10 h-10 p-0 shadow-lg bg-primary hover:bg-primary/90"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
      )}

      <Sidebar
        className={cn(
          'bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col border-r border-slate-700/50',
          isCollapsed ? 'w-16' : 'w-64',
          isHidden && 'hidden',
        )}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="relative h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          {!isCollapsed ? (
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              ASEPS Asia
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AA
              </div>
            </div>
          )}

          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-all duration-200 flex items-center justify-center',
              isCollapsed ? 'mx-auto' : '',
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-300" />
            )}
          </Button>
        </div>

        <SidebarContent className="flex-1 overflow-y-auto py-4">
          <SidebarGroup>
            <SidebarGroupContent className="px-2 space-y-1">
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));

                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <div>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={item.path}
                                className={cn(
                                  'group flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 relative overflow-hidden',
                                  isActive
                                    ? 'bg-blue-600/20 text-blue-100 shadow-lg shadow-blue-500/10'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
                                )}
                              >
                                <div
                                  className={cn(
                                    'absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r transition-all duration-300',
                                    isActive ? 'opacity-100' : 'opacity-0 -translate-x-2',
                                    isCollapsed &&
                                      'group-hover:opacity-100 group-hover:translate-x-0',
                                  )}
                                />
                                <item.icon
                                  className={cn(
                                    'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                                    isActive
                                      ? 'text-blue-300'
                                      : 'text-slate-400 group-hover:text-blue-300',
                                    isCollapsed ? 'mx-auto' : 'mr-3',
                                  )}
                                />
                                {!isCollapsed && <span className="truncate">{item.title}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </div>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" sideOffset={10}>
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-700/50 py-3 px-2">
          <div className="space-y-2">
            <SidebarGroup>
              <SidebarGroupContent className="px-2 space-y-1">
                <SidebarMenu className="list-none">
                  {bottomNavItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          <div>
                            <SidebarMenuItem>
                              <SidebarMenuButton
                                asChild
                                className={cn(
                                  'w-full group flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 relative overflow-hidden',
                                  isActive
                                    ? 'bg-blue-600/20 text-blue-100 shadow-lg shadow-blue-500/10'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
                                )}
                              >
                                <NavLink to={item.path} className="flex items-center w-full">
                                  <div
                                    className={cn(
                                      'absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r transition-all duration-300',
                                      isActive ? 'opacity-100' : 'opacity-0 -translate-x-2',
                                      isCollapsed &&
                                        'group-hover:opacity-100 group-hover:translate-x-0',
                                    )}
                                  />
                                  <item.icon
                                    className={cn(
                                      'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                                      isActive
                                        ? 'text-blue-300'
                                        : 'text-slate-400 group-hover:text-blue-300',
                                      isCollapsed ? 'mx-auto' : 'mr-3',
                                    )}
                                  />
                                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </div>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" sideOffset={10}>
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {!isCollapsed && (
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} ASEPS Asia</p>
              <p className="text-[10px] text-slate-600 mt-1">v{version}</p>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
