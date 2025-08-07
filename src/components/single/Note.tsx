import React, { useState, forwardRef, useImperativeHandle } from 'react';
import MacroMateMain from '../reusable/MacroMateMain.tsx';
import NoteForm from './NoteForm.tsx';
import { NoteProps } from '../../types/Notes.types.ts';
import { Patient } from '../../types/Patient.types.ts';
import { useNavigate } from 'react-router-dom';
import BackCircle from '../../assets/icons/BackCircle.svg?react';
import BackArrow from '../../assets/icons/BackArrow.svg?react';

export type NoteHandle = {
  hasUnsavedChanges: () => boolean;
  discardChanges: () => void;
};

const Note = forwardRef<NoteHandle, NoteProps>(
  (
    {
      patient = {},
      mode = 'add',
      currentPatientNote = {},
      redirectToNotelist = () => {},
      subMode = 'edit',
      onBack: _onBack,
    },
    ref,
  ) => {
    const [macroMateText, setMacroMateText] = useState<string>(
      currentPatientNote?.macro_mate_clinical_text || '',
    );
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleBack = () => {
      if (typeof _onBack === 'function') {
        _onBack();
      } else {
        navigate(-1);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        hasUnsavedChanges: () => unsavedChanges,
        discardChanges: () => setUnsavedChanges(false),
      }),
      [unsavedChanges],
    );

    return (
      <>
        <div className="note-list  pt-2  2xl:pt-6">
          <div className="flex  items-center justify-start gap-2 mb-1">
            <button
              onClick={handleBack}
              type="button"
              aria-label="Go back"
              className="relative w-8 h-9 cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0">
                <BackCircle className="block max-w-none size-full text-secondary" />
              </div>
              <div className="absolute inset-1/4">
                <BackArrow className="block max-w-none size-full text-secondary" />
              </div>
            </button>
            <h2 className="font-gotham-medium text-sm md:text-base lg:text-base xl:text-base 2xl:text-lg text-secondary">
              Clinical Note
            </h2>
          </div>
          <p className="font-gotham text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm text-muted mb-6 note-list-text">
            Document important details to keep the patient's chart updated.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row w-full h-auto macro-container items-start gap-4 ">
          <div className="order-2 lg:order-1 w-full  p-2 2xl:p-4 bg-white rounded-2xl border border-subtle shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.05)] flex-1 h-full ">
            <MacroMateMain
              macroMateText={macroMateText}
              setText={subMode === 'edit' ? setMacroMateText : undefined}
              // onBack={onBack}
            />
          </div>
          <div className="order-1 lg:order-2 w-full  flex-1 h-full">
            <div className="w-full p-2 2xl:p-4 bg-white rounded-2xl border border-subtle shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.05)] flex-1 md:w-full h-full">
              <NoteForm
                patient={patient as Patient}
                mode={mode}
                currentPatientNote={currentPatientNote}
                macroMateText={macroMateText}
                redirectToNotelist={redirectToNotelist}
                subMode={subMode}
                onDirty={() => setUnsavedChanges(true)}
                onSaved={() => setUnsavedChanges(false)}
              />
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default Note;
