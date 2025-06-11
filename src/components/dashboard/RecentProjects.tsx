import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { File } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecentProjects() {
  const { projects, clients, purchaseOrders } = useData();

  // Get 5 most recent projects based on start date
  const recentProjects = [...projects]
    .sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    })
    .slice(0, 5);

  // Get client name
  const getClientName = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  // Function to get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500';
      case 'Completed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-amber-500';
      case 'Delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <File className="h-5 w-5 mr-2 text-primary" />
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects.map((project, index) => (
            <div
              key={project.id}
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {project.name}
                </Link>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{getClientName(project.clientId)}</span>
                <span className="mx-2">•</span>
                <span>{project.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={getDynamicProjectProgress(project.id)} className="h-2" />
                <span className="text-sm font-medium ml-2">
                  {getDynamicProjectProgress(project.id)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
