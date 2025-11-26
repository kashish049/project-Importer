import React, { useState } from 'react';
import Upload from './components/Upload';
import ProductTable from './components/ProductTable';
import WebhookManager from './components/WebhookManager';
import { LayoutGrid } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Acme Product Importer
          </h1>
          <p className="text-gray-600 mt-2">Manage your product catalog and bulk imports.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Upload onUploadComplete={handleUploadComplete} />
            <ProductTable refreshTrigger={refreshTrigger} />
          </div>

          <div className="lg:col-span-1">
            <WebhookManager />

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-6">
              <h3 className="font-semibold text-blue-800 mb-2">System Status</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Backend</span>
                  <span className="font-medium">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker</span>
                  <span className="font-medium">Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Database</span>
                  <span className="font-medium">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
