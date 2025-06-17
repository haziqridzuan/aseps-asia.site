import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { TrendValue } from '@/types/trend';
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

  // Get date range for trend calculation (last 30 days vs previous 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);

  // Helper function to calculate trend with consistent positive/negative handling
  const calculateTrend = (currentCount: number, previousCount: number, isActivePO = false): TrendValue => {
    // Special handling for Active POs - always show positive if there are any Active POs
    if (isActivePO && (currentCount > 0 || previousCount > 0)) {
      // If current is 0 but previous was > 0, show 100% (positive)
      if (currentCount === 0 && previousCount > 0) {
        return { value: 100, positive: true };
      }
      // If current > 0 and previous was 0, show 100% (positive)
      if (currentCount > 0 && previousCount === 0) {
        return { value: 100, positive: true };
      }
      // If both > 0, show 0% (no change, positive)
      return { value: 0, positive: true };
    }
    
    // Handle cases where previous count is 0
    if (previousCount === 0) {
      if (currentCount > 0) {
        return { value: 100, positive: true }; // Show 100% increase
      }
      return { value: 0, positive: true }; // Both are 0, show 0%
    }
    
    // Calculate percentage change
    const change = ((currentCount - previousCount) / previousCount) * 100;
    const roundedValue = Math.round(Math.abs(change));
    const isPositive = currentCount >= previousCount;
    
    // Return the raw value and let the display component handle formatting
    const formattedValue = isPositive ? roundedValue : -roundedValue;
    
    // Return the raw value and let the display component handle formatting
    return {
      value: formattedValue,
      positive: isPositive
    } as TrendValue;
  };

  // Calculate project metrics
  const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  
  // Total Projects Trend: Projects started in the last 30 days vs previous 30-60 days
  const currentPeriodProjects = projects.filter(p => {
    const projectDate = new Date(p.startDate);
    return projectDate >= thirtyDaysAgo && projectDate <= today;
  }).length;
  
  const previousPeriodProjects = projects.filter(p => {
    const projectDate = new Date(p.startDate);
    return projectDate >= sixtyDaysAgo && projectDate < thirtyDaysAgo;
  }).length;
  
  const projectTrend = calculateTrend(currentPeriodProjects, previousPeriodProjects);

  // Active Suppliers (no trend)
  const activeSuppliers = suppliers.length;

  // Clients (no trend)
  const currentClients = clients.length;

  // Calculate PO metrics
  const uniquePONumbers = [...new Set(purchaseOrders.map((po) => po.poNumber))];
  
  // Active POs
  const activePOCount = uniquePONumbers.filter((poNumber) =>
    purchaseOrders.some((po) => po.poNumber === poNumber && getEffectiveStatus(po) === 'Active'),
  ).length;
  
  // Active PO Trend: POs issued in the last 30 days vs previous 30-60 days
  const currentPeriodActivePOs = purchaseOrders
    .filter(po => {
      const poDate = new Date(po.issuedDate || new Date());
      return poDate >= thirtyDaysAgo && poDate <= today && getEffectiveStatus(po) === 'Active';
    })
    .map(po => po.poNumber);
  
  const previousPeriodActivePOs = purchaseOrders
    .filter(po => {
      const poDate = new Date(po.issuedDate || new Date());
      return poDate >= sixtyDaysAgo && poDate < thirtyDaysAgo && getEffectiveStatus(po) === 'Active';
    })
    .map(po => po.poNumber);
  
  const currentActivePOs = [...new Set(currentPeriodActivePOs)].length;
  const previousActivePOs = [...new Set(previousPeriodActivePOs)].length;
  const activePOTrend = calculateTrend(currentActivePOs, previousActivePOs, true);

  // Completed POs
  const completedPOCount = uniquePONumbers.filter((poNumber) =>
    purchaseOrders
      .filter((po) => po.poNumber === poNumber)
      .every((po) => getEffectiveStatus(po) === 'Completed'),
  ).length;
  
  // Completed PO Trend: POs completed in the last 30 days vs previous 30-60 days
  const currentPeriodCompletedPOs = purchaseOrders
    .filter(po => {
      const completionDate = po.completionDate ? new Date(po.completionDate) : null;
      return completionDate && completionDate >= thirtyDaysAgo && completionDate <= today && 
             getEffectiveStatus(po) === 'Completed';
    })
    .map(po => po.poNumber);
  
  const previousPeriodCompletedPOs = purchaseOrders
    .filter(po => {
      const completionDate = po.completionDate ? new Date(po.completionDate) : null;
      return completionDate && completionDate >= sixtyDaysAgo && completionDate < thirtyDaysAgo && 
             getEffectiveStatus(po) === 'Completed';
    })
    .map(po => po.poNumber);
  
  const completedPOTrend = calculateTrend(
    [...new Set(currentPeriodCompletedPOs)].length,
    [...new Set(previousPeriodCompletedPOs)].length
  );

  // Delayed POs (keep current calculation)
  const delayedPOCount = uniquePONumbers.filter((poNumber) =>
    purchaseOrders.some((po) => po.poNumber === poNumber && getEffectiveStatus(po) === 'Delayed'),
  ).length;
  
  // Previous period delayed POs (for trend calculation)
  const previousDelayedPOs = [...new Set(purchaseOrders
    .filter(po => {
      const poDate = new Date(po.issuedDate || new Date());
      return poDate >= sixtyDaysAgo && poDate < thirtyDaysAgo;
    })
    .filter(po => getEffectiveStatus(po) === 'Delayed')
    .map(po => po.poNumber)
  )].length;
  const delayedPOTrend = calculateTrend(delayedPOCount, previousDelayedPOs);

  // Initialize trends with default values
  let completionRateTrend: TrendValue = { value: '0', positive: true };
  const currentPeriodCompletedProjects = projects.filter(p => {
    const endDate = p.endDate ? new Date(p.endDate) : null;
    return p.status === 'Completed' && endDate && 
           endDate >= thirtyDaysAgo && endDate <= today;
  }).length;
  
  const previousPeriodCompletedProjects = projects.filter(p => {
    const endDate = p.endDate ? new Date(p.endDate) : null;
    return p.status === 'Completed' && endDate && 
           endDate >= sixtyDaysAgo && endDate < thirtyDaysAgo;
  }).length;
  
  if (currentPeriodCompletedProjects > 0) {
    completionRateTrend = calculateTrend(
      currentPeriodCompletedProjects,
      previousPeriodCompletedProjects
    );
  }
  
  const currentCompletionRate = projects.length > 0 
    ? Math.round((completedProjects / projects.length) * 100) 
    : 0;

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
          trend={projectTrend}
        />
        <StatCard
          title="Active Suppliers"
          value={activeSuppliers}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={<File className="h-6 w-6" />}
        />
        <StatCard 
          title="Clients" 
          value={clients.length} 
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active POs" 
          value={activePOCount} 
          trend={activePOTrend} 
        />
        <StatCard 
          title="Completed POs" 
          value={completedPOCount} 
          trend={completedPOTrend}
        />
        <StatCard
          title="Delayed POs"
          value={delayedPOCount}
          trend={delayedPOTrend}
        />
        <StatCard
          title="Completion Rate"
          value={`${currentCompletionRate}%`}
          trend={completionRateTrend}
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
