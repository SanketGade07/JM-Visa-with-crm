"use client";

import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { SELECTION_CARD_CLASS, SELECTION_CHEVRON_CLASS, VISA_SUBTYPE_OPTIONS } from "./selectionCardStyles";

type VisaSubtypeSelectorProps = {
  onSelect: (visaSubtype: string) => void;
};

export function VisaSubtypeSelector({ onSelect }: VisaSubtypeSelectorProps) {
  return (
    <div className="flex flex-col space-y-4 py-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Select Visa Type
      </p>
      {VISA_SUBTYPE_OPTIONS.map((visaOpt) => (
        <button
          key={visaOpt}
          type="button"
          onClick={() => onSelect(`${visaOpt} Visa`)}
          className={SELECTION_CARD_CLASS}
        >
          <span className="text-sm font-bold text-slate-800 dark:text-white">{visaOpt} Visa</span>
          <FaChevronRight className={SELECTION_CHEVRON_CLASS} />
        </button>
      ))}
    </div>
  );
}
