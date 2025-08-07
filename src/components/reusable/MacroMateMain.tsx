import { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import { Expansion, MacroMateMainProps } from '../../types/MacroMateMain.types.ts';
import {
  fetchShortCuts,
  editExpansion,
  searchShortCut,
  sortExpansions,
  handleExport,
  handleImportClick,
  handleFileChange,
  importExpansions,
  addExpansion,
} from '../../helpers/macromate-clinical';
import AddExpansionSection from './AddExpansionSection.tsx';
import CurrentExpansionsSection from './CurrentExpansionsSection.tsx';
import MacroMateTextArea from './MacroMateTextArea.tsx';

export default function MacroMateMain({ setText, macroMateText }: MacroMateMainProps) {
  const [shortcut, setShortcut] = useState<string>('');
  const AllShortCuts = useRef<Expansion[]>([]);
  const [RenderExpansionData, setRenderExpansionData] = useState<Expansion[]>([]);
  const [expandedText, setExpandedText] = useState<string>('');
  const [listExpandedText, setListExpandedText] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [addExpansionLoading, setAddExpansionLoading] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [expansionsOpen, setExpansionsOpen] = useState<boolean>(false);
  const [AddExpansionsOpen, setAddExpansionsOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchShortCuts(AllShortCuts, setRenderExpansionData);
  }, []);

  const handleImport = () => {
    handleImportClick((event: ChangeEvent<HTMLInputElement>) =>
      handleFileChange(event, (jsonData: Expansion[]) =>
        importExpansions(jsonData, setLoading, AllShortCuts, setRenderExpansionData),
      ),
    );
  };

  const handleAddExpansion = async (e: FormEvent) => {
    e.preventDefault();
    setAddExpansionLoading(true);
    try {
      await addExpansion(shortcut, expandedText, AllShortCuts, setRenderExpansionData);
      setShortcut('');
      setExpandedText('');
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setAddExpansionLoading(false);
    }
  };

  const handleEditExpansion = async (shortcut: string, expandedText: string) => {
    setEditLoading(true);
    try {
      await editExpansion(
        shortcut,
        expandedText,
        true,
        setEditingId,
        AllShortCuts,
        setRenderExpansionData,
      );
      setListExpandedText('');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSort = () => {
    sortExpansions(AllShortCuts.current, sortOrder, setRenderExpansionData, setSortOrder);
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    searchShortCut(AllShortCuts);
    if (setText) {
      setText(e.target.value);
    }
  };

  const handleListExpandedTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setListExpandedText(e.target.value);
  };

  // NEW: handlers to ensure only one expansion section is open at a time
  const handleToggleAddExpansions = () => {
    setAddExpansionsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        // Close the other panel when this one is opened
        setExpansionsOpen(false);
      }
      return newState;
    });
  };

  const handleToggleExpansions = () => {
    setExpansionsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        // Close the other panel when this one is opened
        setAddExpansionsOpen(false);
      }
      return newState;
    });
  };

  return (
    <div className="flex flex-col justify-between w-full bg-white !pt-0 h-full overflow-y-auto mb-8">
      <div className="font-gotham-medium text-sm 2xl:text-base text-primary">
        MacroMate Clinical
      </div>
      <div className="flex-grow h-full ">
        <MacroMateTextArea
          macroMateText={macroMateText}
          onTextChange={handleTextChange}
          onInput={() => {}}
        />
      </div>
      <div className="flex flex-col gap-2">
        <AddExpansionSection
          isOpen={AddExpansionsOpen}
          onToggle={handleToggleAddExpansions}
          shortcut={shortcut}
          expandedText={expandedText}
          onShortcutChange={(e) => setShortcut(e.target.value)}
          onExpandedTextChange={(e) => setExpandedText(e.target.value)}
          onAddExpansion={handleAddExpansion}
          onImport={handleImport}
          addExpansionLoading={addExpansionLoading}
          importLoading={loading}
        />
        <CurrentExpansionsSection
          isOpen={expansionsOpen}
          onToggle={handleToggleExpansions}
          expansions={RenderExpansionData}
          editingId={editingId}
          editText={listExpandedText}
          loading={editLoading}
          onSort={handleSort}
          onExport={() => handleExport()}
          onEdit={(id, expansion) => {
            setEditingId(id);
            setListExpandedText(expansion);
          }}
          onSave={(shortcut, text) => {
            handleEditExpansion(shortcut, text);
          }}
          onCancel={() => {
            setEditingId('');
            setListExpandedText('');
          }}
          onTextChange={handleListExpandedTextChange}
        />
      </div>
    </div>
  );
}
