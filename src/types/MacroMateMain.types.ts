export interface Expansion {
  id: string;
  shortcut: string;
  expansion: string;
  current?: ExpansionRecord[];
}

export interface ExpansionRecord {
  id: number;
  shortcut: string;
  expansion: string;
  created_at: string;
  updated_at: string;
}

export interface MacroMateMainProps {
  setText?: (_text: string) => void;
  macroMateText?: string;
  onBack?: () => void;
}

export type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;
export type RefObject<T> = React.MutableRefObject<T>;
