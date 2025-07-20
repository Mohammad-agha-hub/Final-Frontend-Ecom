"use client";
import React, { useState } from "react";
import { FiUpload, FiX, FiCheck } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

type ProductRow = Record<string, string | number | boolean | null>;

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ProductRow[]>([]);
  const { data: session } = useSession();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();

      if (!["xlsx", "xls", "csv"].includes(fileExt || "")) {
        toast.error("Only Excel/CSV files are allowed (xlsx, xls, csv)");
        return;
      }

      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: ProductRow[] = XLSX.utils.sheet_to_json(sheet);
          setPreviewData(jsonData.slice(0, 5));
        }
      } catch (error) {
        console.error("Preview error:", error);
        toast.error("Failed to preview file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (!file || !session) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/import/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.backendToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Import failed");
      }

      toast.success(
        `Successfully imported ${data.data?.length || 0} products!`
      );
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreviewData([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Import Products</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {!file ? (
          <div>
            <label className="cursor-pointer">
              <div className="flex flex-col items-center justify-center gap-2">
                <FiUpload className="text-3xl text-gray-400" />
                <p className="font-medium">Upload Excel/CSV File</p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx, .xls, .csv formats
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-800"
              >
                <FiX />
              </button>
            </div>

            {previewData.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="text-sm font-medium mb-2">
                  Preview (first 5 rows):
                </h3>
                <table className="min-w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-sm">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="px-4 py-2 text-sm">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  isLoading
                    ? "bg-gray-300 text-gray-500"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isLoading ? (
                  "Importing..."
                ) : (
                  <>
                    <FiCheck /> Import Products
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium mb-2">File Format Requirements:</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>First row should contain column headers</li>
          <li>
            Supported columns: name, slug, price, image, stock, description,
            category, tags
          </li>
          <li>Multiple tags should be comma-separated</li>
          <li>Price and stock should be numbers</li>
        </ul>
      </div>
    </div>
  );
}
