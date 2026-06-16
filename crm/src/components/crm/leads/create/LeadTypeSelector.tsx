"use client";

import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { SELECTION_CARD_CLASS, SELECTION_CHEVRON_CLASS } from "./selectionCardStyles";

type LeadTypeSelectorProps = {
  onSelectStudyAbroad: () => void;
  onSelectVisa: () => void;
};

export function LeadTypeSelector({ onSelectStudyAbroad, onSelectVisa }: LeadTypeSelectorProps) {
  return (
    <div className="flex flex-col space-y-4 py-4">
      <button
        id="create-lead-lead-type"
        type="button"
        onClick={onSelectStudyAbroad}
        className={SELECTION_CARD_CLASS}
      >
        <span className="text-sm font-bold text-slate-800 dark:text-white">Study Abroad</span>
        <FaChevronRight className={SELECTION_CHEVRON_CLASS} />
      </button>
      <button type="button" onClick={onSelectVisa} className={SELECTION_CARD_CLASS}>
        <span className="text-sm font-bold text-slate-800 dark:text-white">Visa</span>
        <FaChevronRight className={SELECTION_CHEVRON_CLASS} />
      </button>
    </div>
  );
}
