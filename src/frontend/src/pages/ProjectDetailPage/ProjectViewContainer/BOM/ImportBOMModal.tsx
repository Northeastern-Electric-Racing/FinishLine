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
  Autocomplete,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { NERButton } from '../../../../components/NERButton';
import NERSuccessButton from '../../../../components/NERSuccessButton';
import { Assembly, MaterialStatus } from 'shared';
import { Decimal } from 'decimal.js';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useCreateMaterial, useCreateManufacturer } from '../../../../hooks/bom.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import InfoIcon from '@mui/icons-material/Info';

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
  warnings: string[];
  additionalDetails: string;
}

interface MaterialWithMetadata extends ParsedMaterial {
  selected: boolean;
  materialType: string;
  unit: string;
  assemblyId: string;
}

interface ImportBOMModalProps {
  open: boolean;
  onHide: () => void;
  wbsNum: { carNumber: number; projectNumber: number; workPackageNumber: number };
  allMaterialTypes: { name: string }[];
  allUnits: { name: string }[];
  assemblies: Assembly[];
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
  recognizedHeaders: Set<string>;
}

interface CSVRow {
  [key: string]: string;
}

// Create header mapping
const createHeaderMapping = (headers: string[]): HeaderMapping => {
  const recognizedHeaders = new Set<string>();

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
    unitPrice: null,
    recognizedHeaders
  };

  headers.forEach((header) => {
    const normalized = header.toLowerCase().replace(/[_\s]/g, '');

    if (/^name$/i.test(normalized) || /^partname$/i.test(normalized)) {
      map.name = header;
      recognizedHeaders.add(header);
    } else if (/^description$/i.test(normalized) || /^desc$/i.test(normalized)) {
      map.description = header;
      recognizedHeaders.add(header);
    } else if (/^designator$/i.test(normalized) || /^refdes$/i.test(normalized) || /^reference$/i.test(normalized)) {
      map.designator = header;
      recognizedHeaders.add(header);
    } else if (/^quantity$/i.test(normalized) || /^qty$/i.test(normalized) || /^quan$/i.test(normalized)) {
      map.quantity = header;
      recognizedHeaders.add(header);
    } else if (/^manufacturer1?$/i.test(normalized) || /^mfr1?$/i.test(normalized)) {
      map.manufacturer = header;
      recognizedHeaders.add(header);
    } else if (
      /^manufacturer.*part.*number1?$/i.test(normalized) ||
      /^mpn1?$/i.test(normalized) ||
      /^mfrpartnumber1?$/i.test(normalized)
    ) {
      map.manufacturerPartNumber = header;
      recognizedHeaders.add(header);
    } else if (/^manufacturer.*lifecycle1?$/i.test(normalized) || /^lifecycle1?$/i.test(normalized)) {
      map.lifecycle = header;
      recognizedHeaders.add(header);
    } else if (/^supplier1?$/i.test(normalized) || /^dist1?$/i.test(normalized) || /^distributor1?$/i.test(normalized)) {
      map.supplier = header;
      recognizedHeaders.add(header);
    } else if (/^supplier.*part.*number1?$/i.test(normalized) || /^spn1?$/i.test(normalized)) {
      map.supplierPartNumber = header;
      recognizedHeaders.add(header);
    } else if (
      /^supplier.*unit.*price1?$/i.test(normalized) ||
      /^unitprice1?$/i.test(normalized) ||
      /^price1?$/i.test(normalized)
    ) {
      map.unitPrice = header;
      recognizedHeaders.add(header);
    }
  });

  return map;
};

// Parse a single material row
const parseMaterialRow = (row: CSVRow, headerMap: HeaderMapping, allHeaders: string[]): ParsedMaterial => {
  const warnings: string[] = [];

  const name = (headerMap.name && row[headerMap.name]) || '';
  const description = (headerMap.description && row[headerMap.description]) || '';
  const designatorStr = (headerMap.designator && row[headerMap.designator]) || '';
  const quantityStr = (headerMap.quantity && row[headerMap.quantity]) || '';
  const manufacturer = (headerMap.manufacturer && row[headerMap.manufacturer]) || '';
  const manufacturerPartNumber = (headerMap.manufacturerPartNumber && row[headerMap.manufacturerPartNumber]) || '';
  const lifecycle = (headerMap.lifecycle && row[headerMap.lifecycle]) || '';
  const supplier = (headerMap.supplier && row[headerMap.supplier]) || '';
  const supplierPartNumber = (headerMap.supplierPartNumber && row[headerMap.supplierPartNumber]) || '';
  const unitPriceStr = (headerMap.unitPrice && row[headerMap.unitPrice]) || '';

  // Collect additional details
  const additionalDetailsParts: string[] = [];
  allHeaders.forEach((header) => {
    if (!headerMap.recognizedHeaders.has(header) && row[header]) {
      additionalDetailsParts.push(`${header}: ${row[header]}`);
    }
  });
  const additionalDetails = additionalDetailsParts.join('\n');

  const quantity = parseInt(quantityStr) || 0;
  if (quantity === 0) warnings.push('Quantity is 0 or invalid');

  const unitPrice = parseFloat(unitPriceStr) || 0;

  const designators = designatorStr
    .split(',')
    .map((d: string) => d.trim())
    .filter((d: string) => d.length > 0);

  if (!name && !manufacturerPartNumber) warnings.push('Missing name and MPN');

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
    warnings,
    additionalDetails
  };
};

const parseAltiumBOM = (fileContent: string): { materials: ParsedMaterial[]; errors: string[] } => {
  const errors: string[] = [];
  const materials: ParsedMaterial[] = [];

  try {
    const lines = fileContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      errors.push('File appears to be empty or has no data rows');
      return { materials, errors };
    }

    const [firstLine] = lines;
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
    const headerMap = createHeaderMapping(headers);

    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

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
        values.push(currentValue.trim());

        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const material = parseMaterialRow(row, headerMap, headers);
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

const ImportBOMModal: React.FC<ImportBOMModalProps> = ({ open, onHide, wbsNum, allMaterialTypes, allUnits, assemblies }) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [materials, setMaterials] = useState<MaterialWithMetadata[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toast = useToast();
  const { mutateAsync: createMaterial } = useCreateMaterial(wbsNum);
  const { mutateAsync: createManufacturer } = useCreateManufacturer();

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

      const materialsWithMetadata: MaterialWithMetadata[] = parsedMaterials.map((m) => ({
        ...m,
        selected: true,
        materialType: '',
        unit: '',
        assemblyId: ''
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
          if (material.manufacturer) {
            try {
              await createManufacturer({ name: material.manufacturer });
            } catch (error) {}
          }

          await createMaterial({
            name: material.name,
            status: MaterialStatus.NotReadyToOrder,
            materialTypeName: material.materialType,
            manufacturerName: material.manufacturer || undefined,
            manufacturerPartNumber: material.manufacturerPartNumber || undefined,
            quantity: new Decimal(material.quantity),
            price: material.unitPrice,
            unitName: material.unit || undefined,
            assemblyId: material.assemblyId || undefined,
            linkUrl: '',
            notes: [
              material.description,
              material.designators.length > 0 ? `Designators: ${material.designators.join(', ')}` : null,
              material.lifecycle ? `Lifecycle: ${material.lifecycle}` : null,
              material.supplier ? `Supplier: ${material.supplier}` : null,
              material.supplierPartNumber ? `Supplier PN: ${material.supplierPartNumber}` : null,
              material.additionalDetails || null
            ]
              .filter(Boolean)
              .join('\n')
          });
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to create material ${material.name}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} material${successCount !== 1 ? 's' : ''}!`, 4000);
      }
      if (failCount > 0) {
        toast.warning(`Failed to import ${failCount} material${failCount !== 1 ? 's' : ''}`, 4000);
      }

      if (successCount > 0) {
        handleClose();
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
    onHide();
  };

  const toggleSelectAll = () => {
    const allSelected = materials.every((m) => m.selected);
    setMaterials(materials.map((m) => ({ ...m, selected: !allSelected })));
  };

  const toggleSelect = (index: number) => {
    setMaterials(materials.map((m, i) => (i === index ? { ...m, selected: !m.selected } : m)));
  };

  const updateMaterial = (index: number, field: keyof MaterialWithMetadata, value: string | number | null) => {
    setMaterials(
      materials.map((m, i) => {
        if (i === index) {
          const updated = { ...m, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? Number(value) : m.quantity;
            const price = field === 'unitPrice' ? Number(value) : m.unitPrice;
            updated.subtotal = Math.round(qty * price);
          }
          return updated;
        }
        return m;
      })
    );
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
              Supports CSV and TSV formats
            </Typography>
            <Typography color="text.secondary" textAlign="center" fontSize="small" sx={{ mt: 1 }}>
              For Excel files: Save as CSV in Excel, then upload
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
                    <TableCell>Assembly</TableCell>
                    <TableCell>Additional Details</TableCell>
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
                        <TextField
                          size="small"
                          fullWidth
                          value={material.name}
                          onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                          variant="outlined"
                          sx={{ minWidth: '200px' }}
                        />
                        {material.description && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {material.description.substring(0, 50)}
                            {material.description.length > 50 ? '...' : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(index, 'quantity', parseInt(e.target.value) || 0)}
                          variant="outlined"
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={material.manufacturer || ''}
                          onChange={(e) => updateMaterial(index, 'manufacturer', e.target.value || null)}
                          variant="outlined"
                          placeholder="Optional"
                          sx={{ minWidth: '120px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={material.manufacturerPartNumber || ''}
                          onChange={(e) => updateMaterial(index, 'manufacturerPartNumber', e.target.value || null)}
                          variant="outlined"
                          placeholder="Optional"
                          sx={{ minWidth: '150px' }}
                        />
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
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={assemblies}
                          getOptionLabel={(option) => option.name}
                          value={assemblies.find((a) => a.assemblyId === material.assemblyId) || null}
                          onChange={(_, value) => updateMaterial(index, 'assemblyId', value?.assemblyId || '')}
                          renderInput={(params) => <TextField {...params} placeholder="None" />}
                          sx={{ minWidth: '150px' }}
                        />
                      </TableCell>
                      <TableCell>
                        {material.additionalDetails ? (
                          <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{material.additionalDetails}</Box>} arrow>
                            <Chip
                              icon={<InfoIcon sx={{ fontSize: 14 }} />}
                              label={material.additionalDetails.split('\n').length}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={(material.unitPrice / 100).toFixed(2)}
                          onChange={(e) => updateMaterial(index, 'unitPrice', Math.round(parseFloat(e.target.value) * 100))}
                          variant="outlined"
                          sx={{ width: '100px' }}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" sx={{ mr: 0.5 }}>
                                $
                              </Box>
                            )
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          ${(material.subtotal / 100).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {material.warnings.length > 0 ? (
                          <Tooltip
                            title={
                              <Box>
                                {material.warnings.map((warning, wIdx) => (
                                  <Typography key={wIdx} variant="caption" display="block">
                                    • {warning}
                                  </Typography>
                                ))}
                              </Box>
                            }
                            arrow
                          >
                            <Chip
                              icon={<WarningIcon sx={{ fontSize: 14 }} />}
                              label={material.warnings.length}
                              size="small"
                              color="warning"
                              title={material.warnings.join(', ')}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
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
