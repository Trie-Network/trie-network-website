import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Skeleton } from '@/components/ui';
import { getNetworkColor } from '../../config/colors';

interface TableViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: 'csv' | 'tsv';
}

interface ParsedData {
  headers: string[];
  rows: string[][];
}

export function TableViewer({ fileUrl, fileName, fileType }: TableViewerProps) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndParseFile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the file content
        const response = await axios.get(fileUrl, {
          responseType: 'text',
        });

        const fileContent = response.data;

        // Parse CSV/TSV
        const delimiter = fileType === 'csv' ? ',' : '\t';

        Papa.parse(fileContent, {
          delimiter: delimiter,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const headers = results.data[0] as string[];
              const rows = results.data.slice(1) as string[][];

              setData({
                headers,
                rows,
              });
            } else {
              setError('No data found in the file');
            }
            setLoading(false);
          },
          error: (error) => {
            setError(`Failed to parse file: ${error.message}`);
            setLoading(false);
          },
        });
      } catch (err) {
        setError('Failed to load file. Please try again.');
        setLoading(false);
      }
    };

    fetchAndParseFile();
  }, [fileUrl, fileType]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e1e3e5] p-6">
        <div className="mb-4">
          <Skeleton className="w-48 h-6 mb-2" />
          <Skeleton className="w-64 h-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#e1e3e5] p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading File</h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e1e3e5] p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Empty File</h3>
          <p className="text-gray-500 text-sm">This file doesn't contain any data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#e1e3e5] bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {data.rows.length} rows × {data.headers.length} columns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: getNetworkColor() }}
            >
              {fileType.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Table Container with Scrollbars */}
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Row number column */}
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-100 border-r border-gray-200 sticky left-0 z-20"
                style={{ minWidth: '60px' }}
              >
                #
              </th>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  style={{ minWidth: '150px' }}
                >
                  {header || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Row number cell */}
                <td className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
                  {rowIndex + 1}
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {cell || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with info */}
      <div className="px-6 py-3 border-t border-[#e1e3e5] bg-gray-50">
        <p className="text-xs text-gray-500">
          Displaying all {data.rows.length} rows. Scroll horizontally and vertically to view more data.
        </p>
      </div>
    </div>
  );
}
