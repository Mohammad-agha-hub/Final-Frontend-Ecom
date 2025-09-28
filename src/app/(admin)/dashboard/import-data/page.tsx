"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";

// Dynamic icon imports
const FiUpload = dynamic(() =>
  import("react-icons/fi").then((mod) => mod.FiUpload)
);
const FiX = dynamic(() => import("react-icons/fi").then((mod) => mod.FiX));
const FiCheck = dynamic(() =>
  import("react-icons/fi").then((mod) => mod.FiCheck)
);

type ImportResult = {
  message: string;
  processed: number;
  skipped: number;
  total: number;
};

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { data: session } = useSession();

  const lazyToast = async (type: "success" | "error", message: string) => {
    const { toast } = await import("react-toastify");
    toast[type](message);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();

      if (!["xlsx", "xls", "csv"].includes(fileExt || "")) {
        lazyToast("error", "Only Excel/CSV files are allowed (xlsx, xls, csv)");
        return;
      }

      setFile(selectedFile);
      setImportResult(null); // Clear previous results
    }
  };

  const handleSubmit = async () => {
    if (!file || !session) return;

    setIsLoading(true);
    setImportResult(null);

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

      // Handle the updated response format
      setImportResult({
        message: data.message,
        processed: data.processed || 0,
        skipped: data.skipped || 0,
        total: data.total || 0,
      });

      await lazyToast(
        "success",
        `Import completed! Processed: ${data.processed || 0}, Skipped: ${
          data.skipped || 0
        }`
      );
    } catch (error) {
      console.error("Import error:", error);
      await lazyToast(
        "error",
        error instanceof Error ? error.message : "Import failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setImportResult(null);
  };

  const handleStartNew = () => {
    setFile(null);
    setImportResult(null);
  };

  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Import Products</h2>

      {/* Import Results */}
      {importResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">Import Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-white rounded">
              <div className="text-2xl font-bold text-green-600">
                {importResult.processed}
              </div>
              <div className="text-gray-600">Processed</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {importResult.skipped}
              </div>
              <div className="text-gray-600">Skipped</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-2xl font-bold text-blue-600">
                {importResult.total}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleStartNew}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {!file ? (
          <label className="cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-4">
              <FiUpload className="text-4xl text-gray-400" />
              <div>
                <p className="font-medium text-lg">Upload Excel/CSV File</p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports .xlsx, .xls, .csv formats
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Choose File
              </div>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                title="Remove file"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Importing...
                  </>
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

      {/* File Format Guide */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium mb-3">File Format Requirements:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <strong>Required columns:</strong>
            <code className="ml-2 px-2 py-1 bg-white rounded">
              name, price, category
            </code>
          </div>

          <div>
            <strong>Optional columns:</strong>
            <code className="ml-2 px-2 py-1 bg-white rounded">
              description, discount, stock, mainImage, additionalImages
            </code>
          </div>

          <div>
            <strong>Tags format:</strong>
            <code className="ml-2 px-2 py-1 bg-white rounded">
              Jewelry/Necklace,Electronics/Smartphones
            </code>
          </div>

          <div>
            <strong>Variants format:</strong>
            <code className="ml-2 px-2 py-1 bg-white rounded">
              Size:M,Color:#e1b209|Size:L,Color:#000000
            </code>
          </div>

          <div>
            <strong>Variant stock:</strong>
            <code className="ml-2 px-2 py-1 bg-white rounded">
              20|15 (corresponds to each variant combination)
            </code>
          </div>

          <div>
            <strong>Variant prices:</strong>
            <code className="ml-2 px-2 py-1 bg-white rounded">
              3000|3200 (optional, uses main price if not specified)
            </code>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-400">
          <p className="text-sm font-medium text-blue-800">Tips:</p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• First row must contain column headers</li>
            <li>
              • Use comma (,) to separate multiple items in the same field
            </li>
            <li>• Use pipe (|) to separate different variant combinations</li>
            <li>• Invalid images will be skipped but wont stop the import</li>
            <li>• Products with missing names will be skipped</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
