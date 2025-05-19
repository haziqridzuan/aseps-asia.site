import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Ship, Package, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { PartsProgressPieChart } from "@/components/dashboard/PartsProgressPieChart";
import { useMemo, useState } from "react";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, clients, suppliers, purchaseOrders, shipments } = useData();
  
  // Find the project
  const project = projects.find(p => p.id === projectId);
  
  // If project not found, show error and return to projects list
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }
  
  // Get client details
  const client = clients.find(c => c.id === project.clientId);
  
  // Get POs related to this project and count unique PO numbers
  const projectPOs = purchaseOrders.filter(po => po.projectId === project.id);
  const uniquePONumbers = [...new Set(projectPOs.map(po => po.poNumber))];
  const activePOs = uniquePONumbers.filter(poNumber => 
    projectPOs.some(po => po.poNumber === poNumber && po.status === "Active")
  ).length;
  const completedPOs = uniquePONumbers.filter(poNumber => 
    projectPOs.every(po => po.poNumber === poNumber && po.status === "Completed")
  ).length;
  const delayedPOs = uniquePONumbers.filter(poNumber => 
    projectPOs.some(po => po.poNumber === poNumber && po.status === "Delayed")
  ).length;
  
  // Get total parts count
  const totalParts = projectPOs.reduce((total, po) => total + po.parts.length, 0);
  
  // Get suppliers involved
  const supplierIds = [...new Set(projectPOs.map(po => po.supplierId))];
  const projectSuppliers = suppliers.filter(s => supplierIds.includes(s.id));
  
  // Get upcoming deadlines
  const upcomingDeadlines = projectPOs
    .filter(po => po.status === "Active")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  // Get shipments for this project
  const projectShipments = shipments.filter(s => s.projectId === project.id)
    .sort((a, b) => new Date(a.etaDate).getTime() - new Date(b.etaDate).getTime());
  
  // Calculate days remaining
  const calculateDaysRemaining = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get supplier name
  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };
  
  // Function to get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Completed":
      case "Delayed":
        return "status-badge-po";
      case "Not Started":
        return "status-badge-not-started";
      case "Preparation":
        return "status-badge-preparation";
      case "Purchasing":
        return "status-badge-purchasing";
      case "Manufacturing":
        return "status-badge-manufacturing";
      case "Ready to Check":
        return "status-badge-ready-to-check";
      case "Finished":
        return "status-badge-finished";
      default:
        return "bg-gray-400 text-white";
    }
  };
  
  // Group POs by poNumber
  const groupedPOs = projectPOs.reduce((acc, po) => {
    if (!acc[po.poNumber]) acc[po.poNumber] = [];
    acc[po.poNumber].push(po);
    return acc;
  }, {} as Record<string, typeof projectPOs>);
  
  // Calculate parts progress data for pie chart
  const partsProgressData = useMemo(() => {
    const statusCounts = {
      "Not Started": 0,
      "Preparation": 0,
      "Purchasing": 0,
      "Manufacturing": 0,
      "Ready to Check": 0,
      "Finished": 0
    };

    // Count parts by status
    projectPOs.forEach(po => {
      po.parts.forEach(part => {
        if (statusCounts.hasOwnProperty(part.status)) {
          statusCounts[part.status as keyof typeof statusCounts]++;
        }
      });
    });

    // Define colors for each status
    const statusColors = {
      "Not Started": "#94a3b8",
      "Preparation": "#f59e0b",
      "Purchasing": "#3b82f6",
      "Manufacturing": "#8b5cf6",
      "Ready to Check": "#10b981",
      "Finished": "#22c55e"
    };

    // Format data for chart
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, value]) => ({
        name: status,
        value,
        color: statusColors[status as keyof typeof statusColors]
      }));
  }, [projectPOs]);
  
  // --- PO Progress Table Filter State ---
  const [poSearch, setPoSearch] = useState("");
  const [poSupplier, setPoSupplier] = useState("");
  const [poStatus, setPoStatus] = useState("");
  const [poDeadline, setPoDeadline] = useState("");

  // Filtered POs for Progress Table
  const filteredPOs = projectPOs.filter(po => {
    const matchesSearch =
      poSearch === "" ||
      po.poNumber.toLowerCase().includes(poSearch.toLowerCase()) ||
      (po.description && po.description.toLowerCase().includes(poSearch.toLowerCase()));
    const matchesSupplier = poSupplier === "" || po.supplierId === poSupplier;
    const matchesStatus = poStatus === "" || po.status === poStatus;
    const matchesDeadline = poDeadline === "" || (po.deadline && po.deadline.startsWith(poDeadline));
    return matchesSearch && matchesSupplier && matchesStatus && matchesDeadline;
  });
  
  // --- Parts Progress Table Filter State ---
  const [partPoNumber, setPartPoNumber] = useState("");
  const [partPoDescription, setPartPoDescription] = useState("");
  const [partSearch, setPartSearch] = useState("");
  const [partSupplier, setPartSupplier] = useState("");
  const [partStatus, setPartStatus] = useState("");
  const [partDeadline, setPartDeadline] = useState("");

  // Get filtered PO list for dropdowns
  const filteredPOsForDropdown = partPoNumber
    ? projectPOs.filter(po => po.poNumber === partPoNumber)
    : projectPOs;
  // Unique PO Descriptions for dropdown
  const poDescriptions = [...new Set(filteredPOsForDropdown.map(po => po.description || "-"))];
  // Unique Part Names for dropdown
  const partNames = [...new Set(filteredPOsForDropdown.flatMap(po => po.parts.map(part => part.name)))];

  const filteredParts = projectPOs.flatMap(po => po.parts.map(part => ({ part, po: po })))
    .filter(item => {
      const { part, po } = item;
      const matchesPoNumber = partPoNumber === "" || po.poNumber === partPoNumber;
      const matchesPoDescription = partPoDescription === "" || (po.description === partPoDescription);
      const matchesPartName = partSearch === "" || part.name === partSearch;
      const matchesSupplier = partSupplier === "" || po.supplierId === partSupplier;
      const matchesStatus = partStatus === "" || part.status === partStatus;
      const matchesDeadline = partDeadline === "" || (po.deadline && po.deadline.startsWith(partDeadline));
      return matchesPoNumber && matchesPoDescription && matchesPartName && matchesSupplier && matchesStatus && matchesDeadline;
    });
  
  // Utility to capitalize each word in part name, preserving numbers and dashes
  function capitalizePartName(name: string) {
    return name.replace(/([a-zA-Z]+)/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center" 
          onClick={() => navigate("/projects")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
        </Button>
        
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold animate-fade-in">{project.name}</h1>
            <p className="text-muted-foreground">{project.location}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Project Progress */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{project.progress}% Complete</span>
              <span className="text-sm text-muted-foreground">
                Target: {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client and Project Info */}
        <Card className="card-hover h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Client</dt>
                <dd className="font-medium">{client?.name || "Unknown Client"}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                <dd>{client?.contactPerson || "N/A"}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Contact Info</dt>
                <dd>{client?.email || "N/A"}</dd>
                <dd>{client?.phone || "N/A"}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Project Manager</dt>
                <dd>{project.projectManager}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd>{project.description || "No description available"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* PO Summary */}
        <Card className="card-hover h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Purchase Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Total POs</p>
                  <p className="text-xl font-bold">{uniquePONumbers.length}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Active POs</p>
                  <p className="text-xl font-bold">{activePOs}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Completed POs</p>
                  <p className="text-xl font-bold">{completedPOs}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Total Parts</p>
                  <p className="text-xl font-bold">{totalParts}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Suppliers Involved</h4>
              <div className="space-y-2 max-h-[130px] overflow-auto">
                {projectSuppliers.map(supplier => (
                  <div key={supplier.id} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-md">
                    <span>{supplier.name}</span>
                    <span className="text-xs text-muted-foreground">{supplier.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Manufacturing Progress Summary */}
        <PartsProgressPieChart data={partsProgressData} />
      </div>
      
      {/* PO Details */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Parts</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedPOs).length > 0 ? (
                  Object.entries(groupedPOs).map(([poNumber, poList]) => {
                    const totalParts = poList.reduce((sum, po) => sum + po.parts.reduce((s, p) => s + (p.quantity || 0), 0), 0);
                    const uniqueSuppliers = [...new Set(poList.map(po => getSupplierName(po.supplierId)))].join(", ");
                    const statuses = [...new Set(poList.map(po => po.status))].join(", ");
                    const issueDates = poList.map(po => po.issuedDate).sort();
                    const deadlines = poList.map(po => po.deadline).sort();
                    const descriptions = poList.map(po => po.description || "No description");
                    const hasMultipleDescriptions = descriptions.filter((v, i, a) => a.indexOf(v) === i).length > 1;
                    const allSameSupplier = poList.every(p => getSupplierName(p.supplierId) === getSupplierName(poList[0].supplierId));
                    const allSameIssueDate = poList.every(p => p.issuedDate === poList[0].issuedDate);
                    const allSameDeadline = poList.every(p => p.deadline === poList[0].deadline);
                    if (!hasMultipleDescriptions) {
                      return (
                        <TableRow key={poNumber} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                          <TableCell className="font-medium">{poNumber}</TableCell>
                          <TableCell>{new Date(issueDates[0]).toLocaleDateString()}</TableCell>
                          <TableCell>{descriptions[0]}</TableCell>
                          <TableCell>{uniqueSuppliers}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(poList[0].status)}>
                              {poList[0].status}
                            </Badge>
                          </TableCell>
                          <TableCell>{totalParts} parts</TableCell>
                          <TableCell>{new Date(deadlines[0]).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    }
                    // Collapsible row for multiple descriptions
                    return (
                      <CollapsiblePrimitive.Root asChild key={poNumber}>
                        <>
                          <TableRow>
                            <TableCell className="font-medium">
                              {poNumber} <span className="ml-2 text-xs text-muted-foreground">({poList.length} variants)</span>
                            </TableCell>
                            <TableCell colSpan={5}></TableCell>
                            <TableCell className="text-right">
                              <CollapsiblePrimitive.CollapsibleTrigger asChild>
                                <button className="flex items-center justify-end w-full group" tabIndex={-1} type="button">
                                  <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
                                </button>
                              </CollapsiblePrimitive.CollapsibleTrigger>
                            </TableCell>
                          </TableRow>
                          <CollapsiblePrimitive.CollapsibleContent asChild>
                            <>
                              {poList.map((po, idx) => (
                                <TableRow key={po.id} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                                  {idx === 0 && (
                                    <TableCell rowSpan={poList.length} className="text-center align-middle font-medium">
                                      {poNumber}
                                    </TableCell>
                                  )}
                                  {allSameIssueDate ? (
                                    idx === 0 ? (
                                      <TableCell rowSpan={poList.length} className="text-center align-middle">
                                        {new Date(po.issuedDate).toLocaleDateString()}
                                      </TableCell>
                                    ) : null
                                  ) : (
                                    <TableCell>{new Date(po.issuedDate).toLocaleDateString()}</TableCell>
                                  )}
                                  <TableCell>{po.description || "No description"}</TableCell>
                                  {allSameSupplier ? (
                                    idx === 0 ? (
                                      <TableCell rowSpan={poList.length} className="text-center align-middle">
                                        {getSupplierName(po.supplierId)}
                                      </TableCell>
                                    ) : null
                                  ) : (
                                    <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                                  )}
                                  <TableCell>
                                    <Badge className={getStatusColor(po.status)}>
                                      {po.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{po.parts.reduce((s, p) => s + (p.quantity || 0), 0)} parts</TableCell>
                                  {allSameDeadline ? (
                                    idx === 0 ? (
                                      <TableCell rowSpan={poList.length} className="text-center align-middle">
                                        {new Date(po.deadline).toLocaleDateString()}
                                      </TableCell>
                                    ) : null
                                  ) : (
                                    <TableCell>{new Date(po.deadline).toLocaleDateString()}</TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </>
                          </CollapsiblePrimitive.CollapsibleContent>
                        </>
                      </CollapsiblePrimitive.Root>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Manufacturing Progress */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Purchase Orders Progress Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter/Search Bar for PO Progress Table */}
            <div className="flex flex-wrap gap-2 mb-4 items-end">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Search PO</label>
                <input
                  type="text"
                  placeholder="PO Number or Description"
                  className="input input-bordered w-full min-w-[180px] px-2 py-1 rounded border"
                  value={poSearch}
                  onChange={e => setPoSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Supplier</label>
                <select
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border"
                  value={poSupplier}
                  onChange={e => setPoSupplier(e.target.value)}
                >
                  <option value="">All</option>
                  {projectSuppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                <select
                  className="input input-bordered w-full min-w-[120px] px-2 py-1 rounded border"
                  value={poStatus}
                  onChange={e => setPoStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Deadline</label>
                <input
                  type="date"
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border"
                  value={poDeadline}
                  onChange={e => setPoDeadline(e.target.value)}
                />
              </div>
            </div>
            {/* PO Progress Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.map(po => {
                  // Calculate PO progress as average of part progresses (fallback to po.progress)
                  const poProgress = po.parts.length > 0
                    ? Math.round(po.parts.reduce((sum, part) => sum + (part.progress || 0), 0) / po.parts.length)
                    : (po.progress || 0);
                  return (
                    <TableRow key={po.id}>
                      <TableCell>{po.poNumber}</TableCell>
                      <TableCell>{po.description || '-'}</TableCell>
                      <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={poProgress} className="h-2 w-[80px]" />
                          <span className="text-xs">{poProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{po.deadline ? new Date(po.deadline).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  );
                })}
                {filteredPOs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No purchase orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Parts Progress */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="font-medium mb-2">Parts Progress Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter/Search Bar for Parts Progress Table */}
            <div className="flex flex-wrap gap-2 mb-4 items-end">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">PO Number</label>
                <select
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border"
                  value={partPoNumber}
                  onChange={e => {
                    setPartPoNumber(e.target.value);
                    setPartPoDescription("");
                    setPartSearch("");
                  }}
                >
                  <option value="">All</option>
                  {[...new Set(projectPOs.map(po => po.poNumber))].map(poNumber => (
                    <option key={poNumber} value={poNumber}>{poNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">PO Description</label>
                <select
                  className="input input-bordered w-full min-w-[180px] px-2 py-1 rounded border"
                  value={partPoDescription}
                  onChange={e => setPartPoDescription(e.target.value)}
                >
                  <option value="">All</option>
                  {poDescriptions.map(desc => (
                    <option key={desc} value={desc}>{desc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Part Name</label>
                <select
                  className="input input-bordered w-full min-w-[180px] px-2 py-1 rounded border"
                  value={partSearch}
                  onChange={e => setPartSearch(e.target.value)}
                >
                  <option value="">All</option>
                  {partNames.map(name => (
                    <option key={name} value={name}>{capitalizePartName(name)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Supplier</label>
                <select
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border"
                  value={partSupplier}
                  onChange={e => setPartSupplier(e.target.value)}
                >
                  <option value="">All</option>
                  {projectSuppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                <select
                  className="input input-bordered w-full min-w-[120px] px-2 py-1 rounded border"
                  value={partStatus}
                  onChange={e => setPartStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Preparation">Preparation</option>
                  <option value="Purchasing">Purchasing</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Ready to Check">Ready to Check</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Deadline</label>
                <input
                  type="date"
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border"
                  value={partDeadline}
                  onChange={e => setPartDeadline(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Description</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map(({ part, po }) => (
                  <TableRow key={po.id + '-' + part.id}>
                    <TableCell>{po.description || '-'}</TableCell>
                    <TableCell>{capitalizePartName(part.name)}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(part.status)}>{part.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={part.progress || 0} className="h-2 w-[80px]" />
                        <span className="text-xs">{part.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{po.deadline ? new Date(po.deadline).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
                {filteredParts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No parts found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Upcoming Deadlines */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Upcoming PO Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.slice(0, 5).map((po) => {
                  const daysRemaining = calculateDaysRemaining(po.deadline);
                  return (
                    <div key={po.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {po.poNumber} - {getSupplierName(po.supplierId)}
                        </p>
                        <div className="flex flex-col space-y-1">
                          {po.parts.map(part => (
                            <div key={part.id} className="flex items-center text-sm">
                              <Badge variant="outline" className="mr-2">
                                {capitalizePartName(part.name)}
                              </Badge>
                              <Badge className={getStatusColor(part.status)}>
                                {part.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(po.deadline).toLocaleDateString()}</p>
                        <Badge className={
                          daysRemaining < 7 ? "bg-red-500" : 
                          daysRemaining < 14 ? "bg-amber-500" : 
                          "bg-green-500"
                        }>
                          {daysRemaining} days left
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming deadlines
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Shipments Section */}
        <Card className="card-hover">
          <CardHeader className="pb-2 flex items-center">
            <Ship className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg font-medium">Project Shipments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>ETD</TableHead>
                  <TableHead>Container Number</TableHead>
                  <TableHead>Lock Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => {
                  // Find the PO for this shipment
                  const po = purchaseOrders.find(po => po.id === shipment.poId);
                  // Get parts for this PO
                  let parts = po && po.parts ? po.parts : [];
                  // Filter by shipment.part_ids if present
                  if (shipment.part_ids && Array.isArray(shipment.part_ids) && shipment.part_ids.length > 0) {
                    parts = parts.filter(part => shipment.part_ids.includes(part.id));
                  }
                  return [
                    <TableRow key={shipment.id}>
                      <TableCell>{shipment.type}</TableCell>
                      <TableCell>{getSupplierName(shipment.supplierId)}</TableCell>
                      <TableCell>{shipment.status}</TableCell>
                      <TableCell>{shipment.etaDate}</TableCell>
                      <TableCell>{shipment.etdDate}</TableCell>
                      <TableCell>{shipment.containerNumber}</TableCell>
                      <TableCell>{shipment.lockNumber}</TableCell>
                    </TableRow>,
                    <TableRow key={shipment.id + '-parts'}>
                      <TableCell colSpan={7} className="bg-muted/50 text-sm p-2">
                        {parts.length > 0 ? (
                          <div className="flex flex-wrap gap-4">
                            {parts.map(part => (
                              <div key={part.id} className="flex items-center gap-2">
                                <span className="font-medium">{capitalizePartName(part.name)}</span>
                                <span className="text-muted-foreground">x{part.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No parts</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ];
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
