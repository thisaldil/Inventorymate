/**
 * ExcelImport.tsx
 * Standalone bulk-import component for all resource types.
 * Uses SheetJS (xlsx) to parse Excel files client-side,
 * then POSTs to /api/{endpoint}/bulk-import.
 */

import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { resourceApi, type ListParams } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportTarget = {
  label: string;
  endpoint: string;         // e.g. 'tools' → POST /api/tools/bulk-import
  requiredColumns: string[];
  templateRows: Record<string, string | number>[];
};

type ImportResult = {
  inserted: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
};

// ─── Target definitions ───────────────────────────────────────────────────────
// requiredColumns are validated client-side before sending.
// templateRows power the downloadable sample Excel.

const TARGETS: ImportTarget[] = [
  {
    label: 'Tools',
    endpoint: 'tools',
    requiredColumns: ['toolId', 'toolName', 'condition', 'status'],
    templateRows: [
      {
        toolId: 'TL-001',
        toolName: 'Torque Wrench',
        toolType: 'Hand Tool',
        category: 'Mechanical',
        brand: 'Snap-on',
        serialNumber: 'SN-12345',
        condition: 'Good',
        status: 'Available',
        purchaseDate: '2024-01-15',
        purchaseCost: 250,
        notes: '',
      },
    ],
  },
  {
    label: 'Spare Parts',
    endpoint: 'spare-parts',
    requiredColumns: ['partNumber', 'partName', 'category', 'quantity', 'status'],
    templateRows: [
      {
        partNumber: 'SP-001',
        partName: 'Oil Filter',
        category: 'Filters',
        subCategory: 'Engine',
        brand: 'Bosch',
        quantity: 50,
        reorderLevel: 10,
        unitCost: 8.5,
        sellingPrice: 15,
        partCondition: 'New',
        status: 'In Stock',
        notes: '',
      },
    ],
  },
  {
    label: 'Vehicles',
    endpoint: 'vehicles',
    requiredColumns: ['vehicleId', 'make', 'model', 'condition', 'status'],
    templateRows: [
      {
        vehicleId: 'VH-001',
        make: 'Toyota',
        model: 'Hilux',
        year: 2022,
        vehicleType: 'Truck',
        registrationNumber: 'WP-1234',
        fuelType: 'Diesel',
        mileage: 45000,
        color: 'White',
        condition: 'Good',
        status: 'Available',
        purchasePrice: 35000,
        notes: '',
      },
    ],
  },
  {
    label: 'Technicians',
    endpoint: 'technicians',
    requiredColumns: ['employeeId', 'name', 'email', 'status'],
    templateRows: [
      {
        employeeId: 'EMP-001',
        name: 'Kamal Perera',
        email: 'kamal@example.com',
        phone: '+94771234567',
        designation: 'Senior Technician',
        department: 'Mechanical',
        status: 'Active',
        hireDate: '2022-06-01',
        address: 'Colombo 03',
        emergencyContact: '+94779876543',
      },
    ],
  },
  {
    label: 'Suppliers',
    endpoint: 'suppliers',
    requiredColumns: ['supplierCode', 'name', 'status'],
    templateRows: [
      {
        supplierCode: 'SUP-001',
        name: 'Lanka Auto Parts Ltd',
        email: 'info@lankaparts.lk',
        phone: '+94112345678',
        website: 'https://lankaparts.lk',
        address: 'No. 45, Baseline Rd, Colombo 09',
        status: 'Active',
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Download a sample Excel file for the selected target */
function downloadTemplate(target: ImportTarget) {
  const ws = XLSX.utils.json_to_sheet(target.templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, target.label);
  XLSX.writeFile(wb, `ulss_${target.endpoint}_template.xlsx`);
}

/** Validate that all required columns are present in the parsed rows */
function validateColumns(
  rows: Record<string, unknown>[],
  required: string[],
): string[] {
  if (rows.length === 0) return ['The file is empty or has no data rows.'];
  const headers = Object.keys(rows[0]);
  return required
    .filter((col) => !headers.includes(col))
    .map((col) => `Missing required column: "${col}"`);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExcelImport({ token }: { token: string }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [targetIdx, setTargetIdx] = useState(0);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fatalError, setFatalError] = useState('');

  const target = TARGETS[targetIdx];

  // ── File pick ──────────────────────────────────────────────────────────────

  const handleFile = (file: File) => {
    setResult(null);
    setFatalError('');
    setValidationErrors([]);
    setRows(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: '',       // empty cells → ''
          raw: false,       // dates → strings
        });

        const colErrors = validateColumns(parsed, target.requiredColumns);
        if (colErrors.length) {
          setValidationErrors(colErrors);
          return;
        }

        setRows(parsed);
      } catch {
        setFatalError('Could not parse the file. Make sure it is a valid .xlsx or .csv file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';           // allow re-selecting same file
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── Import ─────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!rows?.length) return;
    setImporting(true);
    setFatalError('');
    setResult(null);

    try {
      // Calls POST /api/{endpoint}/bulk-import with { records: [...] }
      const res = await resourceApi.create<ImportResult>(
        token,
        `${target.endpoint}/bulk-import`,
        { records: rows },
      );
      setResult(res.data);
    } catch (e: any) {
      setFatalError(e.message || 'Import failed. Check the server logs.');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setRows(null);
    setFileName('');
    setValidationErrors([]);
    setResult(null);
    setFatalError('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bulk Import{' '}
          <span className="text-ulss-gold/60 text-lg font-normal">from Excel</span>
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Upload an .xlsx or .csv file to import multiple records at once.
        </p>
      </div>

      {/* Target selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-ulss-gold/60">Import into</label>
        <div className="relative w-56">
          <select
            value={targetIdx}
            onChange={(e) => {
              setTargetIdx(Number(e.target.value));
              reset();
            }}
            className="w-full appearance-none rounded-lg border border-ulss-gold/20 bg-white/5 text-white px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
          >
            {TARGETS.map((t, i) => (
              <option key={t.endpoint} value={i} className="bg-[#0f0f0f]">
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
        </div>
      </div>

      {/* Template download */}
      <button
        onClick={() => downloadTemplate(target)}
        className="flex items-center gap-2 text-sm text-ulss-gold/70 hover:text-ulss-gold transition-colors"
      >
        <Download size={15} />
        Download sample template ({target.label})
      </button>

      {/* Required columns hint */}
      <div className="rounded-lg border border-ulss-gold/10 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
        <span className="text-ulss-gold/50 font-medium">Required columns: </span>
        {target.requiredColumns.join(', ')}
      </div>

      {/* Drop zone */}
      {!rows && !result && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ulss-gold/20 bg-white/[0.02] py-12 cursor-pointer hover:border-ulss-gold/40 hover:bg-white/[0.04] transition-colors"
        >
          <FileSpreadsheet size={32} className="text-ulss-gold/40" />
          <div className="text-center">
            <p className="text-sm text-white/60">
              Drop your file here, or{' '}
              <span className="text-ulss-gold underline">browse</span>
            </p>
            <p className="text-xs text-white/30 mt-1">.xlsx or .csv, max 5 MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 space-y-1">
          {validationErrors.map((e) => (
            <p key={e} className="flex items-center gap-2 text-sm text-red-400">
              <AlertTriangle size={14} /> {e}
            </p>
          ))}
          <button
            onClick={reset}
            className="text-xs text-red-300 underline mt-1"
          >
            Try again
          </button>
        </div>
      )}

      {/* Fatal error */}
      {fatalError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle size={15} /> {fatalError}
        </div>
      )}

      {/* Preview & confirm */}
      {rows && !result && (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="flex items-center justify-between rounded-lg border border-ulss-gold/15 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <FileSpreadsheet size={16} className="text-ulss-gold/60" />
              <span className="font-medium">{fileName}</span>
              <span className="text-white/30">·</span>
              <span className="text-white/40">{rows.length} rows detected</span>
            </div>
            <button onClick={reset} className="p-1 rounded hover:bg-white/10 text-white/30">
              <X size={15} />
            </button>
          </div>

          {/* Mini preview table — first 5 rows */}
          <div className="rounded-xl border border-ulss-gold/15 bg-white/[0.02] overflow-hidden">
            <p className="px-4 py-2 text-xs text-ulss-gold/40 border-b border-ulss-gold/10">
              Preview — first {Math.min(5, rows.length)} of {rows.length} rows
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-ulss-gold/10 bg-white/[0.02]">
                    {Object.keys(rows[0]).map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left text-ulss-gold/40 font-medium whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-ulss-gold/5">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-3 py-2 text-white/50 whitespace-nowrap">
                          {String(val) || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm button */}
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 rounded-lg bg-ulss-gold px-5 py-2.5 text-sm font-semibold text-ulss-black hover:bg-ulss-gold/90 disabled:opacity-50 transition-colors"
            >
              {importing ? (
                <><Loader2 size={15} className="animate-spin" /> Importing…</>
              ) : (
                <><Upload size={15} /> Import {rows.length} rows</>
              )}
            </button>
            <button
              onClick={reset}
              disabled={importing}
              className="rounded-lg border border-ulss-gold/20 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-ulss-gold/15 bg-white/[0.03] px-5 py-4 flex items-start gap-4">
            <CheckCircle size={20} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-white text-sm">Import complete</p>
              <p className="text-sm text-white/50 mt-0.5">
                <span className="text-emerald-400 font-medium">{result.inserted} inserted</span>
                {result.failed > 0 && (
                  <>, <span className="text-red-400 font-medium">{result.failed} failed</span></>
                )}
              </p>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 space-y-1 max-h-48 overflow-y-auto">
              <p className="text-xs text-red-400 font-medium mb-2">Row errors:</p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-300">
                  Row {err.row}: {err.message}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={reset}
            className="rounded-lg border border-ulss-gold/20 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
          >
            Import another file
          </button>
        </div>
      )}
    </div>
  );
}