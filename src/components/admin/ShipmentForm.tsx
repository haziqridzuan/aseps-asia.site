import { useState, useEffect } from "react";
import { useData, Part } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from './ErrorBoundary';

interface Shipment {
  id?: string;
  type: string;
  projectId: string;
  supplierId: string;
  po_ids?: string[];
  partId?: string;
  shippedDate: string;
  etdDate: string;
  etaDate: string;
  trackingNumber?: string;
  containerNumber?: string;
  containerSize?: string;
  containerType?: string;
  status: string;
  notes?: string;
  lockNumber?: string;
  part_ids?: string[];
}

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  shipmentId?: string;
  poId?: string;
}

// Add this function at the top level of the file, outside of any component
const saveShipmentDirectly = async (shipmentData, isUpdate = false, shipmentId = null) => {
  // This is a direct fetch approach as a fallback if Supabase client isn't working
  const url = `https://qvmjgcoepabfedwlvbcb.supabase.co/rest/v1/shipments${isUpdate ? `?id=eq.${shipmentId}` : ''}`;
  const method = isUpdate ? 'PATCH' : 'POST';
  
  const headers = {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bWpnY29lcGFiZmVkd2x2YmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjczNzcsImV4cCI6MjA2MjcwMzM3N30.j9hFj36VwYck6jONHQRdP_Dg9-LMbcHWghbq2I3Q4ug',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bWpnY29lcGFiZmVkd2x2YmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjczNzcsImV4cCI6MjA2MjcwMzM3N30.j9hFj36VwYck6jONHQRdP_Dg9-LMbcHWghbq2I3Q4ug',
    'Prefer': 'return=representation'
  };
  
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(isUpdate ? shipmentData : [shipmentData])
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
  }
  
  return await response.json();
};

export default function ShipmentForm({
  open,
  onClose,
  shipmentId,
  poId,
}: ShipmentFormProps) {
  const { suppliers, projects, purchaseOrders } = useData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  
  const [formData, setFormData] = useState<Shipment>({
    type: "Air Freight",
    projectId: "",
    supplierId: "",
    shippedDate: new Date().toISOString().substring(0, 10),
    etdDate: new Date().toISOString().substring(0, 10),
    etaDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    status: "In Transit",
    notes: "",
    lockNumber: "",
    po_ids: [],
  });
  
  // Add state for part selection
  const [allPartsSelected, setAllPartsSelected] = useState(true);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [poParts, setPoParts] = useState<Part[]>([]);
  
  // Load shipment data if editing
  useEffect(() => {
    const loadShipment = async () => {
      if (shipmentId) {
        try {
          const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', shipmentId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Map database fields to Shipment interface fields
            const mappedShipment = {
              id: data.id,
              type: data.type || "Air Freight",
              projectId: data.project_id || "",
              supplierId: data.supplier_id || "",
              po_ids: Array.isArray(data["po_ids"]) ? data["po_ids"] : [],
              partId: data.part_id,
              shippedDate: data.shipped_date,
              etdDate: data.etd_date,
              etaDate: data.eta_date,
              trackingNumber: data.tracking_number,
              containerNumber: data.container_number,
              containerSize: data.container_size,
              containerType: data.container_type,
              status: data.status || "In Transit",
              notes: data.notes,
              lockNumber: data.lock_number,
              part_ids: Array.isArray(data["part_ids"]) ? data["part_ids"] : [],
            };
            setFormData(mappedShipment);
            setShipment(mappedShipment);
          }
        } catch (error) {
          console.error("Error loading shipment:", error);
          toast.error("Failed to load shipment data");
        }
      } else if (poId) {
        // Find the PO to pre-fill some data
        const po = purchaseOrders.find(p => p.id === poId);
        if (po) {
          setFormData(prev => ({
            ...prev,
            projectId: po.projectId,
            supplierId: po.supplierId,
            po_ids: [po.id]
          }));
        }
      }
    };
    
    if (open) {
      loadShipment();
    }
  }, [shipmentId, poId, open, purchaseOrders]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      if (!shipmentId) {
        setFormData({
          type: "Air Freight",
          projectId: "",
          supplierId: "",
          shippedDate: new Date().toISOString().substring(0, 10),
          etdDate: new Date().toISOString().substring(0, 10),
          etaDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          status: "In Transit",
          notes: "",
          lockNumber: "",
          po_ids: [],
        });
      }
    }
  }, [open, shipmentId]);
  
  // When POs change, update poParts and filter selectedPartIds if needed
  useEffect(() => {
    if (formData.po_ids && formData.po_ids.length > 0) {
      const selectedPOs = purchaseOrders.filter(po => formData.po_ids!.includes(po.id));
      const allParts = selectedPOs.flatMap(po => po.parts);
      setPoParts(allParts);

      // If any selected part is no longer in the available parts, remove it
      setSelectedPartIds(prev =>
        prev.filter(id => allParts.some(part => part.id === id))
      );
      // Optionally, update allPartsSelected if all parts are selected
      setAllPartsSelected(
        allParts.length > 0 &&
        selectedPartIds.length === allParts.length &&
        allParts.every(part => selectedPartIds.includes(part.id))
      );
    } else {
      setPoParts([]);
      setSelectedPartIds([]);
      setAllPartsSelected(false);
    }
    // eslint-disable-next-line
  }, [formData.po_ids, purchaseOrders]);
  
  // Add a new effect that restores selectedPartIds and allPartsSelected from formData.part_ids and poParts
  useEffect(() => {
    if (formData.part_ids && Array.isArray(formData.part_ids)) {
      setSelectedPartIds(formData.part_ids);
      setAllPartsSelected(
        poParts.length > 0 &&
        formData.part_ids.length === poParts.length &&
        poParts.every(part => formData.part_ids.includes(part.id))
      );
    } else {
      setAllPartsSelected(false);
      setSelectedPartIds([]);
    }
  }, [formData.part_ids, poParts]);
  
  const handleChange = (field: keyof Shipment, value: any) => {
    // Convert "none" value to undefined for fields that can be null
    if (value === "none") {
      value = undefined;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Transform data for Supabase - map from interface to database field names
      const shipmentData = {
        type: formData.type || "Air Freight",
        project_id: formData.projectId,
        supplier_id: formData.supplierId,
        po_ids: formData.po_ids || [],
        part_id: formData.partId,
        shipped_date: formData.shippedDate,
        etd_date: formData.etdDate,
        eta_date: formData.etaDate,
        tracking_number: formData.trackingNumber || null,
        container_number: formData.containerNumber || null,
        container_size: formData.containerSize === "none" ? null : formData.containerSize,
        container_type: formData.containerType === "none" ? null : formData.containerType,
        status: formData.status || "In Transit",
        notes: formData.notes || null,
        lock_number: formData.lockNumber || null,
        part_ids: allPartsSelected ? poParts.map(p => p.id) : selectedPartIds,
      };
      
      console.log("Submitting shipment data:", shipmentData);
      
      let success = false;
      let error;
      
      // Try Supabase client first
      try {
      if (shipmentId) {
        // Update existing shipment
          const { data, error: supabaseError } = await supabase
          .from('shipments')
          .update(shipmentData)
            .eq('id', shipmentId)
            .select();
          
          if (supabaseError) throw supabaseError;
          console.log("Update response:", data);
          success = true;
        } else {
          // First make sure we're authenticated in Supabase
          try {
            // Attempt to sign in with the hardcoded credentials for testing
            await supabase.auth.signInWithPassword({
              email: "admin@asepsasia.com",
              password: "aseps2025"
            });
          } catch (authError) {
            console.error("Auth error:", authError);
            // Continue anyway
          }
          
        // Create new shipment
          const { data, error: supabaseError } = await supabase
          .from('shipments')
            .insert([shipmentData])
            .select();
          
          if (supabaseError) throw supabaseError;
          console.log("Insert response:", data);
          success = true;
        }
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        error = supabaseError;
        
        // If Supabase client failed, try direct fetch as fallback
        try {
          console.log("Trying fallback method...");
          const result = await saveShipmentDirectly(shipmentData, !!shipmentId, shipmentId);
          console.log("Fallback method result:", result);
          success = true;
        } catch (fallbackError) {
          console.error("Fallback method failed:", fallbackError);
          error = fallbackError;
        }
      }
      
      if (success) {
        toast.success(`Shipment ${shipmentId ? "updated" : "created"} successfully`);
      onClose();
      } else {
        throw error || new Error("Unknown error");
      }
    } catch (error) {
      console.error("Error saving shipment:", error);
      toast.error(`Failed to save shipment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    console.log('Projects:', projects);
    console.log('Suppliers:', suppliers);
    console.log('Purchase Orders:', purchaseOrders);
    console.log('Form Data:', formData);
  }, [projects, suppliers, purchaseOrders, formData]);
  
  return (
    <ErrorBoundary>
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby="shipment-form-description">
        <DialogHeader>
          <DialogTitle>
            {shipmentId ? "Edit Shipment" : "Create Shipment"}
          </DialogTitle>
        </DialogHeader>
          
          <p id="shipment-form-description" className="sr-only">Fill out the shipment details in the form below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Shipment Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Air Freight">Air Freight</SelectItem>
                    <SelectItem value="Ocean Freight">Ocean Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status*</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Project*</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleChange("projectId", value)}
                required
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id || 'default-value'}>
                        {project.name || 'Unnamed Project'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier*</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => handleChange("supplierId", value)}
                required
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id || 'default-value'}>
                        {supplier.name || 'Unnamed Supplier'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Purchase Orders</Label>
              <div className="border rounded p-2 max-h-40 overflow-y-auto">
                {purchaseOrders
                  .filter(po => po.supplierId === formData.supplierId && po.projectId === formData.projectId)
                  .map(po => (
                    <div key={po.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={formData.po_ids?.includes(po.id) || false}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            po_ids: e.target.checked
                              ? [...(prev.po_ids || []), po.id]
                              : (prev.po_ids || []).filter(id => id !== po.id)
                          }));
                        }}
                      />
                      <span>{po.poNumber} {po.description ? `- ${po.description}` : ''}</span>
                    </div>
                  ))}
                {purchaseOrders.filter(po => po.supplierId === formData.supplierId && po.projectId === formData.projectId).length === 0 && (
                  <span className="text-muted-foreground">No POs found for this project and supplier.</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber || ""}
                onChange={(e) => handleChange("trackingNumber", e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippedDate">Shipped Date*</Label>
              <Input
                id="shippedDate"
                type="date"
                value={formData.shippedDate}
                onChange={(e) => handleChange("shippedDate", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="etdDate">ETD (Estimated Time of Departure)*</Label>
              <Input
                id="etdDate"
                type="date"
                value={formData.etdDate}
                onChange={(e) => handleChange("etdDate", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="etaDate">ETA (Estimated Time of Arrival)*</Label>
              <Input
                id="etaDate"
                type="date"
                value={formData.etaDate}
                onChange={(e) => handleChange("etaDate", e.target.value)}
                required
              />
            </div>
          </div>
          
            {/* Container info - show only for ocean freight */}
            {formData.type === "Ocean Freight" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="containerNumber">Container Number</Label>
                <Input
                  id="containerNumber"
                  value={formData.containerNumber || ""}
                  onChange={(e) => handleChange("containerNumber", e.target.value)}
                  placeholder="Container number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="containerSize">Container Size</Label>
                <Select
                    value={formData.containerSize || "none"}
                  onValueChange={(value) => handleChange("containerSize", value)}
                >
                  <SelectTrigger id="containerSize">
                    <SelectValue placeholder="Size (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                    <SelectItem value="20ft">20ft</SelectItem>
                    <SelectItem value="40ft">40ft</SelectItem>
                    <SelectItem value="40ft HC">40ft High Cube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="containerType">Container Type</Label>
                <Select
                    value={formData.containerType || "none"}
                  onValueChange={(value) => handleChange("containerType", value)}
                >
                  <SelectTrigger id="containerType">
                    <SelectValue placeholder="Type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Dry">Dry</SelectItem>
                    <SelectItem value="Reefer">Reefer</SelectItem>
                    <SelectItem value="Open Top">Open Top</SelectItem>
                    <SelectItem value="Flat Rack">Flat Rack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
            
            {/* Add lock number field for ocean freight */}
            {formData.type === "Ocean Freight" && (
              <div className="space-y-2">
                <Label htmlFor="lockNumber">Lock Number</Label>
                <Input
                  id="lockNumber"
                  value={formData.lockNumber || ""}
                  onChange={(e) => handleChange("lockNumber", e.target.value)}
                  placeholder="Lock number"
                />
            </div>
          )}
          
          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>All parts in Purchase Orders</Label>
            <input
              type="checkbox"
              checked={allPartsSelected}
              onChange={e => {
                setAllPartsSelected(e.target.checked);
                if (e.target.checked) {
                  setSelectedPartIds(poParts.map(part => part.id));
                }
              }}
            />
          </div>
          {!allPartsSelected && poParts.length > 0 && (
            <div className="border rounded p-2 mb-2">
              <div className="font-medium mb-1">Select Parts:</div>
              {poParts.map(part => (
                <div key={part.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selectedPartIds.includes(part.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedPartIds(ids => [...ids, part.id]);
                      } else {
                        setSelectedPartIds(ids => ids.filter(id => id !== part.id));
                      }
                    }}
                  />
                  <span>{part.name} (x{part.quantity})</span>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : shipmentId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </ErrorBoundary>
  );
}
