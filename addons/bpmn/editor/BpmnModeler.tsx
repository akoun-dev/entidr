import React, { useEffect, useRef, useState } from 'react';
// bpmn-js modeler
import Modeler from 'bpmn-js/lib/Modeler';
import entidrModdle from './entidr-moddle';

/**
 * React component wrapping bpmn-js modeler with basic palette
 * and property editing for custom attributes.
 */
const BpmnModeler: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<Modeler | null>(null);
  const [selected, setSelected] = useState<any>(null);

  // initialize modeler
  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new Modeler({
      container: containerRef.current,
      keyboard: { bindTo: document },
      moddleExtensions: { entidr: entidrModdle }
    });

    instance.on('selection.changed', (e: any) => {
      setSelected(e.newSelection[0] || null);
    });

    instance.createDiagram();
    setModeler(instance);

    return () => {
      instance.destroy();
    };
  }, []);

  // helper to get/update custom properties
  const updateProp = (prop: string, value: string) => {
    if (!modeler || !selected) return;
    const modeling = modeler.get('modeling');
    modeling.updateProperties(selected, { [`entidr:${prop}`]: value });
    setSelected({ ...selected });
  };

  const getProp = (prop: string): string => {
    return selected?.businessObject?.get(`entidr:${prop}`) || '';
  };

  // import XML file
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modeler) return;
    const text = await file.text();
    try {
      await modeler.importXML(text);
    } catch (err) {
      console.error('import error', err);
    }
  };

  // export current diagram to XML and trigger download
  const handleExport = async () => {
    if (!modeler) return;
    try {
      const { xml } = await modeler.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('export error', err);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Canvas */}
      <div ref={containerRef} className="flex-1 border" />

      {/* Simple properties panel */}
      <div className="w-64 border-l p-3 text-sm space-y-2">
        <div className="font-bold">Propriétés</div>
        {!selected && <div>Sélectionnez un élément</div>}
        {selected && (
          <>
            <label className="block">Assigné à</label>
            <input
              className="w-full border p-1"
              value={getProp('assignee')}
              onChange={(e) => updateProp('assignee', e.target.value)}
            />
            <label className="block">SLA</label>
            <input
              className="w-full border p-1"
              value={getProp('sla')}
              onChange={(e) => updateProp('sla', e.target.value)}
            />
            <label className="block">Script</label>
            <textarea
              className="w-full border p-1"
              value={getProp('script')}
              onChange={(e) => updateProp('script', e.target.value)}
            />
          </>
        )}
        <div className="pt-2 space-x-2 flex">
          <label className="cursor-pointer">
            <span className="mr-2">Importer</span>
            <input type="file" accept=".bpmn,.xml" onChange={handleImport} className="hidden" />
          </label>
          <button className="border px-2" onClick={handleExport}>
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default BpmnModeler;

