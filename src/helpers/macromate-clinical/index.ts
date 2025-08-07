import { getTokenFromLocalStorage } from '..';
import { toast } from 'react-toastify';
import { BASE_API_URL, TOAST_CONFIG } from '../../constants/index.ts';
import { Expansion, RefObject, SetStateFunction } from '../../types/MacroMateMain.types.ts';

const fetchShortCuts = async (
  AllShortCuts: RefObject<Expansion[]>,
  setRenderExpansionData: SetStateFunction<Expansion[]>,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/text/text-expander`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });
    if (response.ok) {
      const data = await response.json();
      AllShortCuts.current = data;
      setRenderExpansionData(data);
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const editExpansion = async (
  sc: string,
  exp: string,
  edit = true,
  setEditingId: SetStateFunction<string>,
  AllShortCuts: RefObject<Expansion[]>,
  setRenderExpansionData: SetStateFunction<Expansion[]>,
) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({ shortcut: sc, expansion: exp, edit }),
  };
  try {
    const response = await fetch(BASE_API_URL + '/text/text-expander', requestOptions);
    const data = await response.json();
    if (response.ok) {
      toast.success('Edited Successfully!', TOAST_CONFIG.SUCCESS);
      setEditingId('');
      fetchShortCuts(AllShortCuts, setRenderExpansionData);
    } else {
      toast.error(data.message, TOAST_CONFIG.ERROR);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error.message);
    }
  }
};

interface TextAreaEvent extends React.ChangeEvent<HTMLTextAreaElement> {
  target: HTMLTextAreaElement;
}

const autoResize = (e: TextAreaEvent) => {
  const textarea = e.target;
  const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
  if (textarea.scrollHeight > textarea.clientHeight) {
    textarea.style.height = textarea.scrollHeight + 'px';
    window.scrollTo(0, scrollPos);
  }
};

const searchShortCut = async (
  // text: string,
  AllShortCuts: RefObject<Expansion[]>,
) => {
  const textarea = document.getElementById('inputText') as HTMLTextAreaElement;
  const cursorPosition = textarea.selectionStart;
  let textBeforeCursor = textarea.value.substring(0, cursorPosition);
  const textAfterCursor = textarea.value.substring(cursorPosition);
  // console.log("text", text);

  AllShortCuts.current.forEach((sc: Expansion) => {
    if (textBeforeCursor.endsWith(sc.shortcut)) {
      textBeforeCursor =
        textBeforeCursor.substring(0, textBeforeCursor.length - sc.shortcut.length) + sc.expansion;
      textarea.value = (textBeforeCursor + textAfterCursor).replace(/<br>/g, '\n');
      textarea.selectionStart = textarea.selectionEnd = textBeforeCursor.length;
    }
  });
};

const sortExpansions = (
  shortcuts: Expansion[],
  sortOrder: 'asc' | 'desc',
  setRenderExpansionData: SetStateFunction<Expansion[]>,
  setSortOrder: SetStateFunction<'asc' | 'desc'>,
) => {
  const sortedExpansions = [...shortcuts].sort((a, b) => {
    const comparison = a.shortcut.localeCompare(b.shortcut);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  setRenderExpansionData(sortedExpansions);
  setSortOrder((prevOrder: 'asc' | 'desc') => (prevOrder === 'asc' ? 'desc' : 'asc'));
};

const handleExport = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/text/export-expansions`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'text_expansions.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

type FileChangeHandler = (_event: React.ChangeEvent<HTMLInputElement>) => void;

const handleImportClick = (handleFileChange: FileChangeHandler) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.onchange = (event: Event) => {
    handleFileChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
  };
  fileInput.click();
};

type ImportExpansionsFunction = (_jsonData: Expansion[]) => void;

const handleFileChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  importExpansions: ImportExpansionsFunction,
) => {
  const file = event.target.files?.[0];
  if (file) {
    readJsonFile(file, importExpansions);
  }
};

const readJsonFile = (file: File, importExpansions: ImportExpansionsFunction) => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    if (event.target?.result) {
      const jsonData = JSON.parse(event.target.result as string);
      importExpansions(jsonData);
    }
  };
  reader.readAsText(file);
};

const importExpansions = async (
  jsonData: Expansion[],
  setLoading: SetStateFunction<boolean>,
  AllShortCuts: RefObject<Expansion[]>,
  setRenderExpansionData: SetStateFunction<Expansion[]>,
) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify(jsonData),
  };

  try {
    setLoading(true);
    const response = await fetch(BASE_API_URL + '/text/import-expansions', requestOptions);
    const data = await response.json();
    if (response.ok) {
      toast.success(data.message, TOAST_CONFIG.SUCCESS);
      fetchShortCuts(AllShortCuts, setRenderExpansionData);
    } else {
      toast.error(data.message, TOAST_CONFIG.ERROR);
      console.error('Error:', data.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  } finally {
    setLoading(false);
  }
};

const deleteExpansion = async (
  id: string,
  AllShortCuts: RefObject<Expansion[]>,
  setRenderExpansionData: SetStateFunction<Expansion[]>,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/text/text-expander/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });
    if (response.ok) {
      const data = await response.json();
      toast.success(data.message, TOAST_CONFIG.SUCCESS);
      fetchShortCuts(AllShortCuts, setRenderExpansionData);
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const addExpansion = async (
  shortcut: string,
  expandedText: string,
  AllShortCuts: RefObject<Expansion[]>,
  setRenderExpansionData: SetStateFunction<Expansion[]>,
) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({ shortcut, expansion: expandedText, edit: false }),
  };

  try {
    const response = await fetch(`${BASE_API_URL}/text/text-expander`, requestOptions);
    const data = await response.json();

    if (response.ok) {
      toast.success('Added Successfully!', TOAST_CONFIG.SUCCESS);
      fetchShortCuts(AllShortCuts, setRenderExpansionData);
    } else {
      toast.error(data.message, TOAST_CONFIG.ERROR);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error.message);
    }
  }
};

export {
  fetchShortCuts,
  editExpansion,
  autoResize,
  searchShortCut,
  sortExpansions,
  handleExport,
  handleImportClick,
  handleFileChange,
  importExpansions,
  deleteExpansion,
  addExpansion,
};
