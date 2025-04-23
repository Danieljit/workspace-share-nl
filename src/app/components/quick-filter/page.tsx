'use client';

import { useState } from 'react';
import { QuickFilter } from '@/components/ui/quick-filter';

export default function QuickFilterDemo() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Quick Filter Component</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Categories</h2>
        <div className="border rounded-lg p-4 bg-card">
          <QuickFilter 
            onFilterChange={(filterId) => setActiveFilter(filterId)} 
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Filter</h2>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-lg">Currently selected: <span className="font-medium">{activeFilter}</span></p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <div className="bg-muted p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            {`import { QuickFilter } from '@/components/ui/quick-filter';

export default function MyComponent() {
  return (
    <QuickFilter 
      onFilterChange={(filterId) => {
        // Handle filter change
        console.log('Selected filter:', filterId);
      }} 
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
