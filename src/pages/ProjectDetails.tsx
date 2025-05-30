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
import { ChevronLeft, Ship, Package, ChevronDown, Link as LinkIcon, ChevronUp, Filter } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { PartsProgressPieChart } from "@/components/dashboard/PartsProgressPieChart";
import { useMemo, useState, useEffect, useRef } from "react";

// Helper to format date as DD-MM-YYYY (move this up for use in filter rendering)
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

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
  // Count a PO as completed only if all POs with the same PO number are completed
  const completedPOs = uniquePONumbers.filter(poNumber => 
    projectPOs.filter(po => po.poNumber === poNumber).every(po => po.status === "Completed")
  ).length;
  const delayedPOs = uniquePONumbers.filter(poNumber => 
    projectPOs.some(po => po.poNumber === poNumber && po.status === "Delayed")
  ).length;
  
  // Get total parts count (sum of all part quantities)
  const totalParts = projectPOs.reduce((total, po) => total + po.parts.reduce((sum, part) => sum + (part.quantity || 0), 0), 0);
  
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
      case "Delayed":
        return "status-badge-delayed"; // red fill, glow
      case "Completed":
        return "status-badge-completed"; // green fill, glow
      case "Active":
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
  
  // Function to check if PO is delayed
  const getEffectiveStatus = (po: any) => {
    if (po.status === "Completed") return "Completed";
    const today = new Date();
    const deadline = new Date(po.deadline);
    return today > deadline ? "Delayed" : po.status;
  };
  
  // Group POs by poNumber
  const groupedPOs = projectPOs.reduce((acc, po) => {
    if (!acc[po.poNumber]) acc[po.poNumber] = [];
    acc[po.poNumber].push(po);
    return acc;
  }, {} as Record<string, typeof projectPOs>);
  
  // --- Expanded PO Rows State ---
  const [expandedPOs, setExpandedPOs] = useState<{ [poNumber: string]: boolean }>({});

  // On mount or when groupedPOs changes, expand all multi-variant POs by default
  useEffect(() => {
    const newExpanded: { [poNumber: string]: boolean } = {};
    Object.entries(groupedPOs).forEach(([poNumber, poList]) => {
      const descriptions = poList.map(po => po.description || "No description");
      const hasMultipleDescriptions = descriptions.filter((v, i, a) => a.indexOf(v) === i).length > 1;
      if (hasMultipleDescriptions) {
        newExpanded[poNumber] = true;
      }
    });
    setExpandedPOs(newExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, Object.keys(groupedPOs).join(",")]);

  // Toggle expand/collapse for a PO number
  const handleTogglePO = (poNumber: string) => {
    setExpandedPOs(prev => ({ ...prev, [poNumber]: !prev[poNumber] }));
  };
  
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

    // Sum part quantities by status
    projectPOs.forEach(po => {
      po.parts.forEach(part => {
        if (statusCounts.hasOwnProperty(part.status)) {
          statusCounts[part.status as keyof typeof statusCounts] += part.quantity || 0;
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
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
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
    })
    .sort((a, b) => new Date(a.po.deadline).getTime() - new Date(b.po.deadline).getTime());
  
  // Utility to capitalize each word in part name, preserving numbers and dashes
  function capitalizePartName(name: string) {
    return name.replace(/([a-zA-Z]+)/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  
  // --- Collapsible state for shipment details ---
  const [expandedShipments, setExpandedShipments] = useState<{ [id: string]: boolean }>({});
  const handleToggleShipment = (shipmentId: string) => {
    setExpandedShipments(prev => ({ ...prev, [shipmentId]: !prev[shipmentId] }));
  };
  
  // --- Sorting/filtering state for shipments table ---
  const [shipmentSort, setShipmentSort] = useState<{ column: string, direction: 'asc' | 'desc' | null }>({ column: '', direction: null });
  const [shipmentFilters, setShipmentFilters] = useState<{ [key: string]: string[] }>({});
  const [filterDropdown, setFilterDropdown] = useState<string | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [poFilterDropdown, setPoFilterDropdown] = useState<string | null>(null);
  const poFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [partFilterDropdown, setPartFilterDropdown] = useState<string | null>(null);
  const partFilterDropdownRef = useRef<HTMLDivElement>(null);

  // --- Helper to get unique values for a column ---
  const getUniqueShipmentValues = (col: string) => {
    return Array.from(new Set(shipments.filter(s => s.projectId === project.id).map(s => {
      if (col === 'supplier') return getSupplierName(s.supplierId);
      if (col === 'shippedDate') return s.shippedDate;
      if (col === 'etdDate') return s.etdDate;
      if (col === 'etaDate') return s.etaDate;
      if (col === 'containerNumber') return s.containerNumber;
      if (col === 'lockNumber') return s.lockNumber;
      return s[col];
    }))).filter(Boolean);
  };

  // --- Click-away handler for filter dropdowns ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdown && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdown(null);
      }
      if (poFilterDropdown && poFilterDropdownRef.current && !poFilterDropdownRef.current.contains(event.target as Node)) {
        setPoFilterDropdown(null);
      }
      if (partFilterDropdown && partFilterDropdownRef.current && !partFilterDropdownRef.current.contains(event.target as Node)) {
        setPartFilterDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterDropdown, poFilterDropdown, partFilterDropdown]);

  // --- Multi-select filter logic ---
  const handleFilterClick = (col: string) => {
    setFilterDropdown(col);
  };
  const handleFilterSelect = (col: string, value: string) => {
    setShipmentFilters(prev => {
      const selected = prev[col] || [];
      if (selected.includes(value)) {
        return { ...prev, [col]: selected.filter(v => v !== value) };
      } else {
        return { ...prev, [col]: [...selected, value] };
      }
    });
  };
  const handleFilterClear = (col: string) => {
    setShipmentFilters(prev => ({ ...prev, [col]: [] }));
  };

  // --- Apply multi-select filter ---
  let filteredShipments = shipments.filter(s => s.projectId === project.id);
  Object.entries(shipmentFilters).forEach(([col, values]) => {
    if (values && values.length > 0) {
      filteredShipments = filteredShipments.filter(s => {
        if (col === 'supplier') return values.includes(getSupplierName(s.supplierId));
        if (col === 'shippedDate') return values.includes(s.shippedDate);
        if (col === 'etdDate') return values.includes(s.etdDate);
        if (col === 'etaDate') return values.includes(s.etaDate);
        if (col === 'containerNumber') return values.includes(s.containerNumber);
        if (col === 'lockNumber') return values.includes(s.lockNumber);
        return values.includes(s[col]);
      });
    }
  });

  // --- Sorting/filtering state for PO table ---
  const [poSort, setPoSort] = useState<{ column: string, direction: 'asc' | 'desc' | null }>({ column: '', direction: null });
  const [poFilters, setPoFilters] = useState<{ [key: string]: string[] }>({});
  const getUniquePOValues = (col: string) => {
    return Array.from(new Set(projectPOs.map(po => {
      if (col === 'supplier') return getSupplierName(po.supplierId);
      if (col === 'issuedDate') return po.issuedDate;
      if (col === 'deadline') return po.deadline;
      if (col === 'status') return po.status;
      if (col === 'description') return po.description;
      if (col === 'parts') return `${po.parts.reduce((s, p) => s + (p.quantity || 0), 0)} parts`;
      return po[col];
    }))).filter(Boolean);
  };
  let filteredPOsForTable = [...projectPOs];
  Object.entries(poFilters).forEach(([col, values]) => {
    if (values && values.length > 0) {
      filteredPOsForTable = filteredPOsForTable.filter(po => {
        if (col === 'supplier') return values.includes(getSupplierName(po.supplierId));
        if (col === 'issuedDate') return values.includes(po.issuedDate);
        if (col === 'deadline') return values.includes(po.deadline);
        if (col === 'status') return values.includes(po.status);
        if (col === 'description') return values.includes(po.description);
        if (col === 'parts') return `${po.parts.reduce((s, p) => s + (p.quantity || 0), 0)} parts` === values[0];
        return values.includes(po[col]);
      });
    }
  });
  if (poSort.column && poSort.direction) {
    filteredPOsForTable = [...filteredPOsForTable].sort((a, b) => {
      let aVal = a[poSort.column];
      let bVal = b[poSort.column];
      if (poSort.column === 'supplier') {
        aVal = getSupplierName(a.supplierId);
        bVal = getSupplierName(b.supplierId);
      }
      if (poSort.column.endsWith('Date') || poSort.column === 'deadline') {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      }
      if (poSort.column === 'parts') {
        aVal = a.parts.reduce((s, p) => s + (p.quantity || 0), 0);
        bVal = b.parts.reduce((s, p) => s + (p.quantity || 0), 0);
      }
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return poSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return poSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  const handlePOHeaderClick = (col: string) => {
    if (poSort.column === col) {
      setPoSort({ column: col, direction: poSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setPoSort({ column: col, direction: 'asc' });
    }
  };
  const handlePOFilterClick = (col: string) => {
    setPoFilterDropdown(col);
  };
  const handlePOFilterSelect = (col: string, value: string) => {
    setPoFilters(prev => {
      const selected = prev[col] || [];
      if (selected.includes(value)) {
        return { ...prev, [col]: selected.filter(v => v !== value) };
      } else {
        return { ...prev, [col]: [...selected, value] };
      }
    });
  };
  const handlePOFilterClear = (col: string) => {
    setPoFilters(prev => ({ ...prev, [col]: [] }));
  };
  
  // --- Sorting/filtering state for Parts Progress table ---
  const [partSort, setPartSort] = useState<{ column: string, direction: 'asc' | 'desc' | null }>({ column: '', direction: null });
  const [partFilters, setPartFilters] = useState<{ [key: string]: string[] }>({});
  const getUniquePartValues = (col: string) => {
    return Array.from(new Set(filteredParts.map(({ part, po }) => {
      if (col === 'poDescription') return po.description;
      if (col === 'partName') return part.name;
      if (col === 'quantity') return String(part.quantity);
      if (col === 'supplier') return getSupplierName(po.supplierId);
      if (col === 'status') return part.status;
      if (col === 'progress') return (part.progress || 0) + '%';
      if (col === 'deadline') return po.deadline;
      return part[col];
    }))).filter(Boolean);
  };
  let filteredPartsForTable = [...filteredParts];
  Object.entries(partFilters).forEach(([col, values]) => {
    if (values && values.length > 0) {
      filteredPartsForTable = filteredPartsForTable.filter(({ part, po }) => {
        if (col === 'poDescription') return values.includes(po.description);
        if (col === 'partName') return values.includes(part.name);
        if (col === 'quantity') return String(part.quantity) === values[0];
        if (col === 'supplier') return values.includes(getSupplierName(po.supplierId));
        if (col === 'status') return values.includes(part.status);
        if (col === 'progress') return ((part.progress || 0) + '%') === values[0];
        if (col === 'deadline') return values.includes(po.deadline);
        return values.includes(part[col]);
      });
    }
  });
  if (partSort.column && partSort.direction) {
    filteredPartsForTable = [...filteredPartsForTable].sort((a, b) => {
      let aVal = a.part[partSort.column];
      let bVal = b.part[partSort.column];
      if (partSort.column === 'poDescription') {
        aVal = a.po.description;
        bVal = b.po.description;
      }
      if (partSort.column === 'supplier') {
        aVal = getSupplierName(a.po.supplierId);
        bVal = getSupplierName(b.po.supplierId);
      }
      if (partSort.column === 'deadline') {
        aVal = a.po.deadline ? new Date(a.po.deadline) : new Date(0);
        bVal = b.po.deadline ? new Date(b.po.deadline) : new Date(0);
      }
      if (partSort.column === 'progress') {
        aVal = a.part.progress || 0;
        bVal = b.part.progress || 0;
      }
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return partSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return partSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  const handlePartHeaderClick = (col: string) => {
    if (partSort.column === col) {
      setPartSort({ column: col, direction: partSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setPartSort({ column: col, direction: 'asc' });
    }
  };
  const handlePartFilterClick = (col: string) => {
    setPartFilterDropdown(col);
  };
  const handlePartFilterSelect = (col: string, value: string) => {
    setPartFilters(prev => {
      const selected = prev[col] || [];
      if (selected.includes(value)) {
        return { ...prev, [col]: selected.filter(v => v !== value) };
      } else {
        return { ...prev, [col]: [...selected, value] };
      }
    });
  };
  const handlePartFilterClear = (col: string) => {
    setPartFilters(prev => ({ ...prev, [col]: [] }));
  };
  
  // --- Calculate dynamic project progress as average of all PO progress (which is average of all parts progress) ---
  const poProgresses = projectPOs.map(po => {
    if (po.parts.length > 0) {
      return po.parts.reduce((sum, part) => sum + (part.progress || 0), 0) / po.parts.length;
    }
    return po.progress || 0;
  });
  const dynamicProjectProgress = poProgresses.length > 0 ? Math.round(poProgresses.reduce((a, b) => a + b, 0) / poProgresses.length) : 0;
  
  // For PO Progress Details table, sort by deadline ascending by default, but use user sort if set
  const sortedFilteredPOsForTable = [...filteredPOsForTable];
  if (!poSort.column) {
    sortedFilteredPOsForTable.sort((a, b) => {
      const aDate = a.deadline ? new Date(a.deadline).getTime() : 0;
      const bDate = b.deadline ? new Date(b.deadline).getTime() : 0;
      return aDate - bDate;
    });
  }
  // For Parts Progress Details table, sort by po.deadline ascending by default, but use user sort if set
  const sortedFilteredPartsForTable = [...filteredPartsForTable];
  if (!partSort.column) {
    sortedFilteredPartsForTable.sort((a, b) => {
      const aDate = a.po.deadline ? new Date(a.po.deadline).getTime() : 0;
      const bDate = b.po.deadline ? new Date(b.po.deadline).getTime() : 0;
      return aDate - bDate;
    });
  }
  
  // Fix filter logic: always use .includes for arrays, never compare string[] to string
  // For the shipment table header, use handleShipmentHeaderClick (define if missing)
  const handleShipmentHeaderClick = (col: string) => {
    if (shipmentSort.column === col) {
      setShipmentSort({ column: col, direction: shipmentSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setShipmentSort({ column: col, direction: 'asc' });
    }
  };
  
  // In the Project Shipments table, fix the sort logic:
  // Apply sorting to filteredShipments before rendering:
  if (shipmentSort.column && shipmentSort.direction) {
    filteredShipments = [...filteredShipments].sort((a, b) => {
      let aVal = a[shipmentSort.column];
      let bVal = b[shipmentSort.column];
      if (shipmentSort.column === 'supplier') {
        aVal = getSupplierName(a.supplierId);
        bVal = getSupplierName(b.supplierId);
      }
      if (shipmentSort.column.endsWith('Date')) {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      }
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return shipmentSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return shipmentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
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
              <span className="font-medium">{dynamicProjectProgress}% Complete</span>
              <span className="text-sm text-muted-foreground">
                Target: {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <Progress value={dynamicProjectProgress} className="h-2" />
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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Parts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Always sort groupedPOs by PO number ascending (numerical/alphabetical) */}
                {Object.entries(groupedPOs)
                  .sort(([poNumberA], [poNumberB]) => poNumberA.localeCompare(poNumberB, undefined, { numeric: true, sensitivity: 'base' }))
                  .map(([poNumber, poList]) => {
                    // Sort poList by deadline ascending (nearest first)
                    const sortedPoList = [...poList].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                    const totalParts = sortedPoList.reduce((sum, po) => sum + po.parts.reduce((s, p) => s + (p.quantity || 0), 0), 0);
                    const uniqueSuppliers = [...new Set(sortedPoList.map(po => getSupplierName(po.supplierId)))].join(", ");
                    const statuses = [...new Set(sortedPoList.map(po => po.status))].join(", ");
                    const issueDates = sortedPoList.map(po => po.issuedDate).sort();
                    const deadlines = sortedPoList.map(po => po.deadline).sort();
                    const descriptions = sortedPoList.map(po => po.description || "No description");
                    const hasMultipleDescriptions = descriptions.filter((v, i, a) => a.indexOf(v) === i).length > 1;
                    const allSameSupplier = sortedPoList.every(p => getSupplierName(p.supplierId) === getSupplierName(sortedPoList[0].supplierId));
                    const allSameIssueDate = sortedPoList.every(p => p.issuedDate === sortedPoList[0].issuedDate);
                    const allSameDeadline = sortedPoList.every(p => p.deadline === sortedPoList[0].deadline);
                    if (!hasMultipleDescriptions) {
                      // Calculate PO progress as average of part progresses (fallback to po.progress)
                      const po = sortedPoList[0];
                      const poProgress = po.parts.length > 0
                        ? Math.round(po.parts.reduce((sum, part) => sum + (part.progress || 0), 0) / po.parts.length)
                        : (po.progress || 0);
                      return (
                        <TableRow key={poNumber} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                          <TableCell className="font-medium">{poNumber}</TableCell>
                          <TableCell>{new Date(issueDates[0]).toLocaleDateString()}</TableCell>
                          <TableCell>{uniqueSuppliers}</TableCell>
                          <TableCell>{descriptions[0]}</TableCell>
                          <TableCell>{totalParts} parts</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getEffectiveStatus(po))}>
                              {getEffectiveStatus(po)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={poProgress} className="h-2 w-[80px]" />
                              <span className="text-xs">{poProgress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(deadlines[0]).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    }
                    // Collapsible row for multiple descriptions
                    return (
                      <CollapsiblePrimitive.Root
                        asChild
                        key={poNumber}
                        open={!!expandedPOs[poNumber]}
                        onOpenChange={() => handleTogglePO(poNumber)}
                      >
                        <>
                          <TableRow>
                            <TableCell className="font-medium">
                              {poNumber} <span className="ml-2 text-xs text-muted-foreground">({sortedPoList.length} variants)</span>
                            </TableCell>
                            <TableCell colSpan={7}></TableCell>
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
                              {sortedPoList.map((po, idx) => {
                                const poProgress = po.parts.length > 0
                                  ? Math.round(po.parts.reduce((sum, part) => sum + (part.progress || 0), 0) / po.parts.length)
                                  : (po.progress || 0);
                                return (
                                <TableRow key={po.id} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                                  {idx === 0 && (
                                    <TableCell rowSpan={sortedPoList.length} className="text-center align-middle font-medium">
                                      {poNumber}
                                    </TableCell>
                                  )}
                                  {allSameIssueDate ? (
                                    idx === 0 ? (
                                      <TableCell rowSpan={sortedPoList.length} className="text-center align-middle">
                                        {new Date(po.issuedDate).toLocaleDateString()}
                                      </TableCell>
                                    ) : null
                                  ) : (
                                    <TableCell>{new Date(po.issuedDate).toLocaleDateString()}</TableCell>
                                  )}
                                  {allSameSupplier ? (
                                    idx === 0 ? (
                                      <TableCell rowSpan={sortedPoList.length} className="text-center align-middle">
                                        {getSupplierName(po.supplierId)}
                                      </TableCell>
                                    ) : null
                                  ) : (
                                    <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                                  )}
                                    <TableCell>{po.description || "No description"}</TableCell>
                                    <TableCell>{po.parts.reduce((s, p) => s + (p.quantity || 0), 0)} parts</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(getEffectiveStatus(po))}>
                                      {getEffectiveStatus(po)}
                                    </Badge>
                                  </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress value={poProgress} className="h-2 w-[80px]" />
                                        <span className="text-xs">{poProgress}%</span>
                                      </div>
                                    </TableCell>
                                  {allSameDeadline ? (
                                    idx === 0 ? (
                                      <TableCell rowSpan={sortedPoList.length} className="text-center align-middle">
                                        {new Date(po.deadline).toLocaleDateString()}
                                      </TableCell>
                                    ) : null
                                  ) : (
                                    <TableCell>{new Date(po.deadline).toLocaleDateString()}</TableCell>
                                  )}
                                </TableRow>
                                );
                              })}
                            </>
                          </CollapsiblePrimitive.CollapsibleContent>
                        </>
                      </CollapsiblePrimitive.Root>
                    );
                  })
                }
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
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { key: 'poNumber', label: 'PO Number' },
                    { key: 'issuedDate', label: 'Issue Date' },
                    { key: 'supplier', label: 'Supplier' },
                    { key: 'description', label: 'Description' },
                    { key: 'status', label: 'Status' },
                    { key: 'progress', label: 'Progress' },
                    { key: 'deadline', label: 'Deadline' },
                  ].map(col => (
                    <TableHead key={col.key} className="relative select-none cursor-pointer group" onClick={() => handlePOHeaderClick(col.key)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        {/* Always show sort icon, highlight if active */}
                        <ChevronUp className={`w-4 h-4 ml-1 ${poSort.column === col.key && poSort.direction === 'asc' ? 'text-blue-500' : 'text-gray-300'}`} />
                        <ChevronDown className={`w-4 h-4 ml-0 -mt-2 ${poSort.column === col.key && poSort.direction === 'desc' ? 'text-blue-500' : 'text-gray-300'}`} />
                        <button
                          type="button"
                          className="ml-1 p-1 rounded hover:bg-muted/30 relative"
                          onClick={e => { e.stopPropagation(); handlePOFilterClick(col.key); }}
                >
                          <Filter className="w-4 h-4" />
                          {/* Show badge with count of selected filters */}
                          {poFilters[col.key] && poFilters[col.key].length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1">{poFilters[col.key].length}</span>
                          )}
                        </button>
              </div>
                      {poFilterDropdown === col.key && (
                        <div
                          ref={poFilterDropdownRef}
                          className="absolute z-50 left-0 mt-2 bg-white border rounded-xl shadow-2xl min-w-[220px] p-4 flex flex-col gap-2"
                          style={{ top: '100%' }}
                >
                          <div className="font-semibold mb-2">Filter {col.label}</div>
                          <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                <input
                                type="checkbox"
                                checked={
                                  !poFilters[col.key] || poFilters[col.key].length === 0 ||
                                  poFilters[col.key].length === getUniquePOValues(col.key).length
                                }
                                onChange={() => handlePOFilterClear(col.key)}
                              />
                              All
                            </label>
                            {getUniquePOValues(col.key).map(val => (
                              <label key={val} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    (!poFilters[col.key] || poFilters[col.key].length === 0 || poFilters[col.key].length === getUniquePOValues(col.key).length)
                                      ? true
                                      : poFilters[col.key].includes(val)
                                  }
                                  onChange={() => handlePOFilterSelect(col.key, val)}
                                />
                                {col.key.endsWith('Date') ? (val ? formatDate(val) : '-') : val}
                              </label>
                            ))}
              </div>
                          <button
                            className="mt-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold self-end transition"
                            onClick={() => handlePOFilterClear(col.key)}
                          >
                            Reset Filters
                          </button>
            </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFilteredPOsForTable.map(po => {
                  // Calculate PO progress as average of part progresses (fallback to po.progress)
                  const poProgress = po.parts.length > 0
                    ? Math.round(po.parts.reduce((sum, part) => sum + (part.progress || 0), 0) / po.parts.length)
                    : (po.progress || 0);
                  return (
                    <TableRow key={po.id}>
                      <TableCell>{po.poNumber}</TableCell>
                      <TableCell>{new Date(po.issuedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                      <TableCell>{po.description || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(getEffectiveStatus(po))}>{getEffectiveStatus(po)}</Badge>
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
                {sortedFilteredPOsForTable.length === 0 && (
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
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                  className="input input-bordered w-full min-w-[180px] px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                  className="input input-bordered w-full min-w-[180px] px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                  className="input input-bordered w-full min-w-[140px] px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                  className="input input-bordered w-full min-w-[120px] px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { key: 'poDescription', label: 'PO Description' },
                    { key: 'partName', label: 'Part Name' },
                    { key: 'quantity', label: 'Quantity' },
                    { key: 'supplier', label: 'Supplier' },
                    { key: 'status', label: 'Status' },
                    { key: 'progress', label: 'Progress' },
                  ].map(col => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFilteredPartsForTable.map(({ part, po }) => (
                  <TableRow key={po.id + '-' + part.id}>
                    <TableCell>{po.description || '-'}</TableCell>
                    <TableCell>{capitalizePartName(part.name)}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(getEffectiveStatus(part))}>{getEffectiveStatus(part)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={part.progress || 0} className="h-2 w-[80px]" />
                        <span className="text-xs">{part.progress || 0}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedFilteredPartsForTable.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No parts found.</TableCell>
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
              <div className="space-y-8">
                {upcomingDeadlines.slice(0, 5).map((po) => {
                  const daysRemaining = calculateDaysRemaining(po.deadline);
                  return (
                    <div key={po.id} className="flex flex-row items-start justify-between border-b pb-6 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base mb-2">
                          {po.poNumber} - {getSupplierName(po.supplierId)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {po.parts.map(part => {
                            const status = getEffectiveStatus(part);
                            const statusColor = getStatusColor(status);
                            // Map status badge class to color
                            let badgeColor = '#3b82f6'; // default blue
                            if (statusColor.includes('status-badge-delayed')) badgeColor = '#ef4444';
                            else if (statusColor.includes('status-badge-completed')) badgeColor = '#22c55e';
                            else if (statusColor.includes('status-badge-po')) badgeColor = '#3b82f6';
                            else if (statusColor.includes('status-badge-manufacturing')) badgeColor = '#3b82f6';
                            else if (statusColor.includes('status-badge-not-started')) badgeColor = '#f59e0b';
                            else if (statusColor.includes('status-badge-preparation')) badgeColor = '#b983ff';
                            else if (statusColor.includes('status-badge-purchasing')) badgeColor = '#bdbdbd';
                            else if (statusColor.includes('status-badge-ready-to-check')) badgeColor = '#10b981';
                            else if (statusColor.includes('status-badge-finished')) badgeColor = '#22c55e';
                            return (
                              <div key={part.id} className="flex items-center gap-0 mb-2">
                                <Badge variant="outline" className="text-sm px-2 py-1 font-medium shadow-none rounded-full">
                                  {capitalizePartName(part.name)}
                                </Badge>
                                <span
                                  className="inline-block"
                                  style={{
                                    height: '2px',
                                    width: '32px',
                                    background: badgeColor,
                                    margin: '0 0.25rem',
                                    flexShrink: 0,
                                  }}
                                />
                                <Badge className={statusColor + " text-xs px-2 py-1 font-semibold rounded-full"}>
                                  {status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-[110px]">
                        <span className="text-sm font-medium mb-1">{new Date(po.deadline).toLocaleDateString()}</span>
                        <Badge className={
                          daysRemaining < 0 ? "bg-red-500 text-white" :
                          daysRemaining < 7 ? "bg-red-500 text-white" :
                          daysRemaining < 14 ? "bg-amber-500 text-white" :
                          "bg-green-500 text-white"
                        }>
                          {daysRemaining < 0 ? `${daysRemaining} days left` : `${daysRemaining} days left`}
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
                  <TableHead className="w-8 text-center">#</TableHead>
                  {[
                    { key: 'type', label: 'Type' },
                    { key: 'supplier', label: 'Supplier' },
                    { key: 'status', label: 'Status' },
                    { key: 'shippedDate', label: 'Shipped Date' },
                    { key: 'etdDate', label: 'ETD' },
                    { key: 'etaDate', label: 'ETA' },
                    { key: 'containerNumber', label: 'Container Number' },
                    { key: 'lockNumber', label: 'Lock Number' },
                  ].map(col => (
                    <TableHead key={col.key} className="relative select-none cursor-pointer group" onClick={() => handleShipmentHeaderClick(col.key)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment, idx) => {
                    let parts: any[] = [];
                    const po_ids = (shipment as any).po_ids;
                    if (Array.isArray(po_ids)) {
                      parts = po_ids
                        .map((poId: string) => {
                          const po = purchaseOrders.find(po => po.id === poId);
                          return po ? po.parts : [];
                        })
                        .flat();
                    } else if (shipment.poId) {
                      const po = purchaseOrders.find(po => po.id === shipment.poId);
                      parts = po && po.parts ? po.parts : [];
                    }
                    if (shipment.part_ids && Array.isArray(shipment.part_ids) && shipment.part_ids.length > 0) {
                      parts = parts.filter(part => shipment.part_ids.includes(part.id));
                    }
                  // Get PO(s) related
                  let relatedPOs: any[] = [];
                  if (Array.isArray(po_ids)) {
                    relatedPOs = po_ids.map((poId: string) => purchaseOrders.find(po => po.id === poId)).filter(Boolean);
                  } else if (shipment.poId) {
                    const po = purchaseOrders.find(po => po.id === shipment.poId);
                    if (po) relatedPOs = [po];
                    }
                    return [
                      <TableRow key={shipment.id}>
                        <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                        <TableCell>{shipment.type}</TableCell>
                        <TableCell>{getSupplierName(shipment.supplierId)}</TableCell>
                        <TableCell>{shipment.status}</TableCell>
                        <TableCell>{formatDate(shipment.shippedDate)}</TableCell>
                        <TableCell>{formatDate(shipment.etdDate)}</TableCell>
                        <TableCell>{formatDate(shipment.etaDate)}</TableCell>
                        <TableCell>{shipment.containerNumber}</TableCell>
                        <TableCell>{shipment.lockNumber}</TableCell>
                        <TableCell className="text-right pr-4">
                          <button onClick={() => handleToggleShipment(shipment.id)} className="focus:outline-none">
                            <ChevronDown className={`transition-transform ${expandedShipments[shipment.id] ? 'rotate-180' : ''}`} />
                          </button>
                        </TableCell>
                      </TableRow>,
                    expandedShipments[shipment.id] && (
                      <TableRow key={shipment.id + '-details'}>
                        <TableCell colSpan={10} className="bg-muted/50 text-base p-6">
                          <div className="font-semibold mb-2">Details:</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="font-medium">PO(s) Related:</div>
                              {relatedPOs.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {relatedPOs.map(po => (
                                    <li key={po.id}>
                                      <span className="font-semibold">{po.poNumber}</span> - {po.description || '-'}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted-foreground">No PO related</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">Tracking Number:</div>
                              <span>{shipment.trackingNumber || '-'}</span>
                            </div>
                            <div>
                              <div className="font-medium">Notes:</div>
                              <span>{shipment.notes || '-'}</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
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
