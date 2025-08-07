import { ChangeEvent, useRef } from 'react';

interface MacroMateTextAreaProps {
  macroMateText?: string;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onInput: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * MacroMate Clinical main text area component
 *
 * @example
 * <MacroMateTextArea
 *   macroMateText={text}
 *   onTextChange={handleTextChange}
 *   onInput={autoResize}
 * />
 */
export default function MacroMateTextArea({
  macroMateText = '',
  onTextChange,
  onInput,
}: MacroMateTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="h-full">
      <div className="flex flex-col h-full p-2 overflow-hidden">
        <textarea
          ref={textareaRef}
          className="w-full p-2.5 my-2.5 border border-input rounded-xl 
          bg-[var(--input-bg)]
          box-border text-base min-h-[50px] resize-none text-secondary 
          font-gotham-normal h-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] 
          focus:border-transparent overflow-y-auto"
          onChange={onTextChange}
          onInput={onInput}
          disabled={false}
          id="inputText"
          placeholder="Type your text here..."
          value={macroMateText}
        />
      </div>
    </div>
  );
}
