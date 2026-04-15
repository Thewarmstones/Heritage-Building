import type { ChangeEvent } from 'react';
import type { ViewpointDataset } from '../types';

export function JsonImporter({ onLoad }: { onLoad: (data: ViewpointDataset) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = JSON.parse(String(reader.result)) as ViewpointDataset;
      onLoad(parsed);
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <label className="ve-button ve-button-primary">
      导入真实 JSON
      <input hidden type="file" accept="application/json,.json" onChange={handleChange} />
    </label>
  );
}
