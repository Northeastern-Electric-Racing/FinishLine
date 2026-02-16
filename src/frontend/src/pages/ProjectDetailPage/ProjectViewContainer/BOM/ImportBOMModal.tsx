import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  TextField,
  Autocomplete
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { NERButton } from '../../../../components/NERButton';
import NERSuccessButton from '../../../../components/NERSuccessButton';
import { MaterialStatus } from 'shared';
import { Decimal } from 'decimal.js';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useCreateMaterial } from '../../../../hooks/bom.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';

interface ParsedMaterial {
  name: string;
  quantity: number;
  manufacturer: string | null;
  manufacturerPartNumber: string | null;
  unitPrice: number; // in cents
  subtotal: number; // in cents
  description: string | null;
  designators: string[];
  lifecycle: string | null;
  supplier: string | null;
  supplierPartNumber: string | null;
  isGeneric: boolean;
  warnings: string[];
}

interface MaterialWithMetadata extends ParsedMaterial {
  selected: boolean;
  materialType: string;
  unit: string;
}

interface ImportBOMModalProps {
  open: boolean;
  onHide: () => void;
  wbsNum: { carNumber: number; projectNumber: number; workPackageNumber: number };
  allMaterialTypes: { name: string }[];
  allUnits: { name: string }[];
}

interface HeaderMapping {
  name: string | null;
  description: string | null;
  designator: string | null;
  quantity: string | null;
  manufacturer: string | null;
  manufacturerPartNumber: string | null;
  lifecycle: string | null;
  supplier: string | null;
  supplierPartNumber: string | null;
  unitPrice: string | null;
}

interface CSVRow {
  [key: string]: string;
}

// Header mapping function
const createHeaderMapping = (headers: string[]) => {
  const map: HeaderMapping = {
    name: null,
    description: null,
    designator: null,
    quantity: null,
    manufacturer: null,
    manufacturerPartNumber: null,
    lifecycle: null,
    supplier: null,
    supplierPartNumber: null,
    unitPrice: null
  };

  headers.forEach((header) => {
    const normalized = header.toLowerCase().replace(/[_\s]/g, '');

    if (/^name$/i.test(normalized) || /^partname$/i.test(normalized)) {
      map.name = header;
    } else if (/^description$/i.test(normalized) || /^desc$/i.test(normalized)) {
      map.description = header;
    } else if (/^designator$/i.test(normalized) || /^refdes$/i.test(normalized)) {
      map.designator = header;
    } else if (/^quantity$/i.test(normalized) || /^qty$/i.test(normalized)) {
      map.quantity = header;
    } else if (/^manufacturer1?$/i.test(normalized) || /^mfr1?$/i.test(normalized)) {
      map.manufacturer = header;
    } else if (/^manufacturer.*part.*number1?$/i.test(normalized) || /^mpn1?$/i.test(normalized)) {
      map.manufacturerPartNumber = header;
    } else if (/^manufacturer.*lifecycle1?$/i.test(normalized) || /^lifecycle1?$/i.test(normalized)) {
      map.lifecycle = header;
    } else if (/^supplier1?$/i.test(normalized) || /^dist1?$/i.test(normalized)) {
      map.supplier = header;
    } else if (/^supplier.*part.*number1?$/i.test(normalized) || /^spn1?$/i.test(normalized)) {
      map.supplierPartNumber = header;
    } else if (
      /^supplier.*unit.*price1?$/i.test(normalized) ||
      /^unitprice1?$/i.test(normalized) ||
      /^price1?$/i.test(normalized)
    ) {
      map.unitPrice = header;
    }
  });

  return map;
};

const parseMaterialRow = (row: CSVRow, headerMap: HeaderMapping): ParsedMaterial => {
  const warnings: string[] = [];

  const name = row[headerMap.name!] || '';
  const description = row[headerMap.description!] || '';
  const designatorStr = row[headerMap.designator!] || '';
  const quantityStr = row[headerMap.quantity!] || '';
  const manufacturer = row[headerMap.manufacturer!] || '';
  const manufacturerPartNumber = row[headerMap.manufacturerPartNumber!] || '';
  const lifecycle = row[headerMap.lifecycle!] || '';
  const supplier = row[headerMap.supplier!] || '';
  const supplierPartNumber = row[headerMap.supplierPartNumber!] || '';
  const unitPriceStr = row[headerMap.unitPrice!] || '';

  const quantity = parseInt(quantityStr) || 0;
  if (quantity === 0) warnings.push('Quantity is 0 or invalid');

  const unitPrice = parseFloat(unitPriceStr) || 0;

  const designators = designatorStr
    .split(',')
    .map((d: string) => d.trim())
    .filter((d: string) => d.length > 0);

  const isGeneric = /generic|placeholder|tbd|tba|unknown/i.test(name) || /generic|placeholder/i.test(description);
  if (isGeneric) warnings.push('Generic or placeholder part');
  if (!name && !manufacturerPartNumber) warnings.push('Missing name and MPN');
  if (!manufacturer && manufacturerPartNumber) warnings.push('MPN without manufacturer');

  const subtotal = Math.round(unitPrice * quantity * 100);

  return {
    name: name || manufacturerPartNumber || 'Unnamed Part',
    quantity,
    manufacturer: manufacturer || null,
    manufacturerPartNumber: manufacturerPartNumber || null,
    lifecycle: lifecycle || null,
    supplier: supplier || null,
    supplierPartNumber: supplierPartNumber || null,
    unitPrice: Math.round(unitPrice * 100),
    subtotal,
    description: description || null,
    designators,
    isGeneric,
    warnings
  };
};

const parseAltiumBOM = (fileContent: string): { materials: ParsedMaterial[]; errors: string[] } => {
  const errors: string[] = [];
  const materials: ParsedMaterial[] = [];

  try {
    // Split into lines
    const lines = fileContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      errors.push('File appears to be empty or has no data rows');
      return { materials, errors };
    }

    // Detect delimiter (tab or comma)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    // Parse header
    const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
    const headerMap = createHeaderMapping(headers);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        // CSV parser that handles quoted values
        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === delimiter && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim()); // Push last value

        // Create row
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const material = parseMaterialRow(row, headerMap);
        materials.push(material);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Fatal error: ${error.message}`);
    }
  }

  return { materials, errors };
};

const ImportBOMModal: React.FC<ImportBOMModalProps> = ({ open, onHide, wbsNum, allMaterialTypes, allUnits }) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [materials, setMaterials] = useState<MaterialWithMetadata[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [_, setEditingIndex] = useState<number | null>(null);

  const toast = useToast();
  const { mutateAsync: createMaterial } = useCreateMaterial(wbsNum);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const fileContent = await file.text();
      const { materials: parsedMaterials, errors: parseErrors } = parseAltiumBOM(fileContent);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        toast.error(`Found ${parseErrors.length} error(s) while parsing`, 5000);
      }

      if (parsedMaterials.length === 0) {
        toast.error('No materials found in BOM file', 3000);
        setIsProcessing(false);
        return;
      }

      // Add metadata for editing
      const materialsWithMetadata: MaterialWithMetadata[] = parsedMaterials.map((m) => ({
        ...m,
        selected: true,
        materialType: '',
        unit: ''
      }));

      setMaterials(materialsWithMetadata);
      setStep('review');
      toast.success(`Successfully parsed ${parsedMaterials.length} materials`, 3000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`, 5000);
      }
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    const selectedMaterials = materials.filter((m) => m.selected);

    if (selectedMaterials.length === 0) {
      toast.error('No materials selected', 3000);
      return;
    }

    // Validate required fields
    const missingTypes = selectedMaterials.filter((m) => !m.materialType);
    if (missingTypes.length > 0) {
      toast.error(`${missingTypes.length} material(s) missing Material Type`, 4000);
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const material of selectedMaterials) {
        try {
          await createMaterial({
            name: material.name,
            status: MaterialStatus.NotReadyToOrder,
            materialTypeName: material.materialType,
            manufacturerName: material.manufacturer || undefined,
            manufacturerPartNumber: material.manufacturerPartNumber || undefined,
            quantity: new Decimal(material.quantity),
            price: material.unitPrice,
            subtotal: material.subtotal,
            unitName: material.unit || undefined,
            linkUrl: '',
            notes: [
              material.description,
              material.designators.length > 0 ? `Designators: ${material.designators.join(', ')}` : null,
              material.lifecycle ? `Lifecycle: ${material.lifecycle}` : null,
              material.supplier ? `Supplier: ${material.supplier}` : null,
              material.supplierPartNumber ? `Supplier PN: ${material.supplierPartNumber}` : null
            ]
              .filter(Boolean)
              .join('\n')
          });
          handleClose();
          toast.success(`Successfully imported ${successCount} material${successCount !== 1 ? 's' : ''}!`, 4000);
        } catch (error) {
          toast.warning(`Failed to import ${failCount} material${failCount !== 1 ? 's' : ''}`, 4000);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Import failed: ${error.message}`, 5000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setMaterials([]);
    setErrors([]);
    setEditingIndex(null);
    onHide();
  };

  const toggleSelectAll = () => {
    const allSelected = materials.every((m) => m.selected);
    setMaterials(materials.map((m) => ({ ...m, selected: !allSelected })));
  };

  const toggleSelect = (index: number) => {
    setMaterials(materials.map((m, i) => (i === index ? { ...m, selected: !m.selected } : m)));
  };

  const updateMaterial = (index: number, field: keyof MaterialWithMetadata, value: string) => {
    setMaterials(materials.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const selectedCount = materials.filter((m) => m.selected).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Import BOM from Altium</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {step === 'upload' && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={4}>
            <CloudUploadIcon sx={{ fontSize: 64, color: '#1976d2' }} />
            <Typography variant="h6">Upload Altium BOM File</Typography>
            <Typography color="text.secondary" textAlign="center">
              Supports CSV and TSV formats exported from Altium Designer
            </Typography>

            <label>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                disabled={isProcessing}
                style={{ display: 'none' }}
              />
              <NERSuccessButton variant="contained" component="span" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Choose File'}
              </NERSuccessButton>
            </label>

            {errors.length > 0 && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Found {errors.length} error(s):
                </Typography>
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {errors.slice(0, 10).map((error, idx) => (
                    <Typography key={idx} variant="body2">
                      • {error}
                    </Typography>
                  ))}
                  {errors.length > 10 && (
                    <Typography variant="body2" color="text.secondary">
                      + {errors.length - 10} more errors
                    </Typography>
                  )}
                </Box>
              </Alert>
            )}
          </Box>
        )}

        {step === 'review' && (
          <Box>
            {/* Summary Stats */}
            <Box display="flex" gap={2} mb={3}>
              <Chip icon={<CheckCircleIcon />} label={`${selectedCount} selected`} color="primary" variant="outlined" />
              <Chip label={`${materials.length} total`} variant="outlined" />
              <Chip
                icon={<WarningIcon />}
                label={`${materials.filter((m) => m.warnings.length > 0).length} with warnings`}
                color="warning"
                variant="outlined"
              />
            </Box>

            {/* Materials Table */}
            <TableContainer component={Paper} sx={{ maxHeight: '500px' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={materials.every((m) => m.selected)} onChange={toggleSelectAll} />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Manufacturer</TableCell>
                    <TableCell>MPN</TableCell>
                    <TableCell>Material Type*</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell>Warnings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={material.selected} onChange={() => toggleSelect(index)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {material.name}
                        </Typography>
                        {material.description && (
                          <Typography variant="caption" color="text.secondary">
                            {material.description.substring(0, 50)}
                            {material.description.length > 50 ? '...' : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{material.manufacturer || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {material.manufacturerPartNumber || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={allMaterialTypes.map((t) => t.name)}
                          value={material.materialType || null}
                          onChange={(_, value) => updateMaterial(index, 'materialType', value || '')}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Required" error={!material.materialType} />
                          )}
                          sx={{ minWidth: '150px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={allUnits.map((u) => u.name)}
                          value={material.unit || null}
                          onChange={(_, value) => updateMaterial(index, 'unit', value || '')}
                          renderInput={(params) => <TextField {...params} placeholder="Optional" />}
                          sx={{ minWidth: '120px' }}
                        />
                      </TableCell>
                      <TableCell align="right">${(material.unitPrice / 100).toFixed(2)}</TableCell>
                      <TableCell align="right">${(material.subtotal / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        {material.warnings.length > 0 && (
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: 14 }} />}
                            label={material.warnings.length}
                            size="small"
                            color="warning"
                            title={material.warnings.join(', ')}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Material Type is required for all materials. All materials will be created with status
                "Not Ready to Order".
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === 'upload' && (
          <NERButton variant="outlined" onClick={handleClose}>
            Cancel
          </NERButton>
        )}
        {step === 'review' && (
          <>
            <NERButton variant="outlined" onClick={() => setStep('upload')}>
              Back
            </NERButton>
            <NERButton variant="outlined" onClick={handleClose}>
              Cancel
            </NERButton>
            <NERSuccessButton variant="contained" onClick={handleImport} disabled={isProcessing || selectedCount === 0}>
              {isProcessing ? <LoadingIndicator /> : `Import ${selectedCount} Material${selectedCount !== 1 ? 's' : ''}`}
            </NERSuccessButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportBOMModal;
