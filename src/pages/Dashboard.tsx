import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBar, Package, File, Users } from 'lucide-react';

export default function Dashboard() {
  const { projects, suppliers, clients, purchaseOrders } = useData();

  // Helper: get effective PO status (delayed if deadline passed and not completed)
  const getEffectiveStatus = (po) => {
    if (po.status === 'Completed') return 'Completed';
    const today = new Date();
    const deadline = new Date(po.deadline);
    return today > deadline ? 'Delayed' : po.status;
  };

  // Calculate dashboard metrics
  const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  // Count unique PO numbers for each status (using effective status)
  const uniquePONumbers = [...new Set(purchaseOrders.map((po) => po.poNumber))];
  const activePOCount = uniquePONumbers.filter((poNumber) =>
    purchaseOrders.some((po) => po.poNumber === poNumber && getEffectiveStatus(po) === 'Active'),
  ).length;
  // Count a PO as completed only if all POs with the same PO number are completed
  const completedPOCount = uniquePONumbers.filter((poNumber) =>
    purchaseOrders
      .filter((po) => po.poNumber === poNumber)
      .every((po) => getEffectiveStatus(po) === 'Completed'),
  ).length;
  const delayedPOCount = uniquePONumbers.filter((poNumber) =>
    purchaseOrders.some((po) => po.poNumber === poNumber && getEffectiveStatus(po) === 'Delayed'),
  ).length;

  const activeSuppliers = suppliers.length;

  // --- Delayed POs trend calculation ---
  // Helper: get month and year from date
  const getMonthYear = (dateStr) => {
    const d = new Date(dateStr);
    return d.getFullYear() + '-' + (d.getMonth() + 1);
  };
  // Get last full month and previous month
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const lastMonthStr = lastMonth.getFullYear() + '-' + (lastMonth.getMonth() + 1);
  const prevMonthStr = prevMonth.getFullYear() + '-' + (prevMonth.getMonth() + 1);
  // Count delayed POs with deadline in last month and previous month
  const delayedPOsLastMonth = purchaseOrders.filter((po) => {
    return getEffectiveStatus(po) === 'Delayed' && getMonthYear(po.deadline) === lastMonthStr;
  });
  const delayedPOsPrevMonth = purchaseOrders.filter((po) => {
    return getEffectiveStatus(po) === 'Delayed' && getMonthYear(po.deadline) === prevMonthStr;
  });
  const lastMonthCount = delayedPOsLastMonth.length;
  const prevMonthCount = delayedPOsPrevMonth.length;
  // Calculate trend percentage
  let delayedTrendValue = 0;
  let delayedTrendPositive = false;
  if (prevMonthCount === 0 && lastMonthCount > 0) {
    delayedTrendValue = 100;
    delayedTrendPositive = false;
  } else if (prevMonthCount === 0 && lastMonthCount === 0) {
    delayedTrendValue = 0;
    delayedTrendPositive = false;
  } else {
    delayedTrendValue = Math.round(((lastMonthCount - prevMonthCount) / prevMonthCount) * 100);
    delayedTrendPositive = delayedTrendValue < 0;
  }

  // Project status data for chart
  const projectStatusData = [
    {
      name: 'In Progress',
      value: projects.filter((p) => p.status === 'In Progress').length,
      color: '#3b82f6',
    },
    {
      name: 'Completed',
      value: projects.filter((p) => p.status === 'Completed').length,
      color: '#22c55e',
    },
    {
      name: 'Pending',
      value: projects.filter((p) => p.status === 'Pending').length,
      color: '#f59e0b',
    },
    {
      name: 'Delayed',
      value: projects.filter((p) => p.status === 'Delayed').length,
      color: '#ef4444',
    },
  ].filter((item) => item.value > 0);

  // Helper to calculate dynamic project progress
  const getDynamicProjectProgress = (projectId) => {
    const projectPOs = purchaseOrders.filter((po) => po.projectId === projectId);
    const poProgresses = projectPOs.map((po) => {
      if (po.parts && po.parts.length > 0) {
        return po.parts.reduce((sum, part) => sum + (part.progress || 0), 0) / po.parts.length;
      }
      return po.progress || 0;
    });
    return poProgresses.length > 0
      ? Math.round(poProgresses.reduce((a, b) => a + b, 0) / poProgresses.length)
      : 0;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={<File className="h-6 w-6" />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Active Suppliers"
          value={activeSuppliers}
          icon={<Package className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={<File className="h-6 w-6" />}
        />
        <StatCard title="Clients" value={clients.length} icon={<Users className="h-6 w-6" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active POs" value={activePOCount} trend={{ value: 8, positive: true }} />
        <StatCard title="Completed POs" value={completedPOCount} />
        <StatCard
          title="Delayed POs"
          value={delayedPOCount}
          trend={{ value: Math.abs(delayedTrendValue), positive: delayedTrendPositive }}
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round((completedProjects / projects.length) * 100) || 0}%`}
          trend={{ value: 7, positive: true }}
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <ChartBar className="h-5 w-5 mr-2 text-primary" />
              Project Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={projectStatusData} />
          </CardContent>
        </Card>

        <UpcomingDeadlines />
      </div>

      {/* Recent Projects */}
      <RecentProjects />
    </div>
  );
}
