import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileEdit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import ShipmentForm from '@/components/admin/ShipmentForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function AdminShipments() {
  const { shipments, suppliers, projects, deleteShipment } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<null | string>(null);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Get unique suppliers and statuses for filters
  const supplierOptions = useMemo(() => suppliers, [suppliers]);
  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(shipments.map(s => s.status)));
    return statuses;
  }, [shipments]);

  const projectOptions = useMemo(() => projects, [projects]);
  const typeOptions = ["Ocean Freight", "Air Freight"];

  // Filtered shipments
  const filteredShipments = shipments.filter(shipment => {
    const project = projects.find(p => p.id === shipment.projectId);
    const supplier = suppliers.find(s => s.id === shipment.supplierId);
    const matchesSearch =
      search === "" ||
      (project && project.name.toLowerCase().includes(search.toLowerCase())) ||
      (supplier && supplier.name.toLowerCase().includes(search.toLowerCase())) ||
      (shipment.type && shipment.type.toLowerCase().includes(search.toLowerCase()));
    const matchesSupplier = supplierFilter === "" || shipment.supplierId === supplierFilter;
    const matchesStatus = statusFilter === "" || shipment.status === statusFilter;
    const matchesProject = projectFilter === "" || shipment.projectId === projectFilter;
    const matchesType = typeFilter === "" || shipment.type === typeFilter;
    return matchesSearch && matchesSupplier && matchesStatus && matchesProject && matchesType;
  });

  const handleOpenNewForm = () => {
    setEditingShipment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (shipmentId: string) => {
    setEditingShipment(shipmentId);
    setIsFormOpen(true);
  };

  const handleDeleteShipment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;
    try {
      await deleteShipment(id);
      toast.success('Shipment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete shipment');
    }
  };
  
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-dm-bg text-dm-text transition-colors duration-500">
        {/* Purple glow spot */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-dm-purple to-transparent rounded-full blur-3xl opacity-40 pointer-events-none z-0" />
        <div className="relative z-10 max-w-6xl mx-auto pt-8 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Manage Shipments</h1>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Shipments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-3 py-2 w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="border rounded px-3 py-2 w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Projects</option>
                {projectOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={supplierFilter}
                onChange={e => setSupplierFilter(e.target.value)}
                className="border rounded px-3 py-2 w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Suppliers</option>
                {supplierOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="border rounded px-3 py-2 w-[130px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Types</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 w-[130px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button
                onClick={handleOpenNewForm}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
              >
                + Add Shipment
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-0 sm:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Shipment List</h2>
            </div>
            <div>
              <Card className="bg-white text-dm-text rounded-xl shadow-none border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="hidden">All Shipments</CardTitle>
                  <CardDescription className="hidden">Manage shipments for all projects</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredShipments.length === 0 ? (
                    <div className="text-center py-6 text-dm-text-muted">
                      No shipments found. Add a shipment to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Type</TableHead>
                          <TableHead className="font-bold">Project</TableHead>
                          <TableHead className="font-bold">Supplier</TableHead>
                          <TableHead className="font-bold">Shipped Date</TableHead>
                          <TableHead className="font-bold">ETA</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredShipments.map((shipment) => (
                          <React.Fragment key={shipment.id}>
                            <TableRow>
                              <TableCell className="py-6 text-base">{shipment.type}</TableCell>
                              <TableCell className="py-6 text-base">{getProjectName(shipment.projectId)}</TableCell>
                              <TableCell className="py-6 text-base">{getSupplierName(shipment.supplierId)}</TableCell>
                              <TableCell className="py-6 text-base">{format(new Date(shipment.shippedDate), 'MMM dd, yyyy')}</TableCell>
                              <TableCell className="py-6 text-base">{format(new Date(shipment.etaDate), 'MMM dd, yyyy')}</TableCell>
                              <TableCell className="py-6 text-base">{shipment.status}</TableCell>
                              <TableCell className="py-6 text-base">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-white border border-gray-200 hover:bg-gray-100 shadow-none"
                                    onClick={() => handleOpenEditForm(shipment.id)}
                                  >
                                    <FileEdit className="h-5 w-5 text-black" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="bg-red-500 hover:bg-red-600 text-white shadow-none"
                                    onClick={() => handleDeleteShipment(shipment.id)}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {/* Expanded details row */}
                            <TableRow className="bg-gray-50">
                              <TableCell colSpan={7} className="py-4 px-6 text-sm text-gray-700">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                  <div><span className="font-semibold">Shipped Date:</span> {format(new Date(shipment.shippedDate), 'MMM dd, yyyy')}</div>
                                  <div><span className="font-semibold">ETD:</span> {shipment.etdDate ? format(new Date(shipment.etdDate), 'MMM dd, yyyy') : '-'}</div>
                                  <div><span className="font-semibold">ETA:</span> {format(new Date(shipment.etaDate), 'MMM dd, yyyy')}</div>
                                  <div><span className="font-semibold">Container No.:</span> {shipment.containerNumber || '-'}</div>
                                  <div><span className="font-semibold">Container Size:</span> {shipment.containerSize || '-'}</div>
                                  <div><span className="font-semibold">Container Type:</span> {shipment.containerType || '-'}</div>
                                  <div><span className="font-semibold">Lock No.:</span> {shipment.lockNumber || '-'}</div>
                                  <div className="sm:col-span-4"><span className="font-semibold">Notes:</span> {shipment.notes || '-'}</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-3xl bg-dm-bg-secondary text-dm-text">
              <DialogHeader>
                <DialogTitle>{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</DialogTitle>
              </DialogHeader>
              <ShipmentForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                shipmentId={editingShipment}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ThemeProvider>
  );
}
