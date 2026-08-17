"use client";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Select, {
  components,
  type ClearIndicatorProps,
  type ControlProps,
  type StylesConfig,
} from 'react-select';
import {
  COUNTRY_DROPDOWN_MAX_HEIGHT,
  FILTER_DROPDOWN_MAX_HEIGHT,
  PHONE_DROPDOWN_LIST_MAX_HEIGHT,
  PHONE_DROPDOWN_MENU_MAX_HEIGHT,
} from '@/utils/dropdownConstants';
import { ThinScrollMenuList } from '@/components/ui/ThinScrollMenuList';
import { CRM_DROPDOWN_SCROLL_CLASS } from '@/utils/dropdownScrollStyles';
import { useDropdownPortal } from '@/utils/useDropdownPortal';
import { LEAD_STATUS_ORDER, getStatusLabel } from '@/utils/leadStatusConfig';

type FilterOption = { value: string; label: string };

function PremiumClearIndicator(props: ClearIndicatorProps<FilterOption>) {
  const { innerProps } = props;
  return (
    <div
      {...innerProps}
      className={`filter-clear-btn${innerProps.className ? ` ${innerProps.className}` : ""}`}
      title="Reset filter"
      aria-label="Reset filter"
    >
      <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="filter-clear-icon">
        <path
          d="M3.25 3.25l5.5 5.5M8.75 3.25l-5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
import { getNames } from 'country-list';
import { defaultCountries, parseCountry, FlagImage } from 'react-international-phone';
import 'react-international-phone/style.css';
import { validatePhone } from '@/utils/validatePhone';

const countryMapping: Record<string, { value: string; label: string }> = {
  "United States": { value: "USA", label: "United States of America (the)" },
  "United States of America": { value: "USA", label: "United States of America (the)" },
  "United States of America (the)": { value: "USA", label: "United States of America (the)" },
  "United Kingdom": { value: "UK", label: "United Kingdom" },
  "United Kingdom of Great Britain and Northern Ireland": { value: "UK", label: "United Kingdom" },
  "United Arab Emirates": { value: "UAE", label: "United Arab Emirates" },
};

const uniqueOptionsMap = new Map<string, string>();
getNames().forEach(name => {
  const mapped = countryMapping[name] ?? { value: name, label: name };
  uniqueOptionsMap.set(mapped.value, mapped.label);
});

const countryOptions = Array.from(uniqueOptionsMap.entries())
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const destinationFilterOptions = [
  { value: "All", label: "All Countries" },
  ...countryOptions,
];

export const leadStatusFilterOptions = [
  { value: "All", label: "All Statuses" },
  ...LEAD_STATUS_ORDER.map((status) => ({
    value: status,
    label: getStatusLabel(status),
  })),
];

/** Individual statuses for lead-management quick tabs (excludes "All"). */
export const leadQuickTabStatuses = leadStatusFilterOptions
  .filter((option) => option.value !== "All")
  .map((option) => option.value);

function getMenuPortalTarget(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.body;
}

function FilterControl(props: ControlProps<FilterOption, false>) {
  return (
    <components.Control
      {...props}
      innerProps={{
        ...props.innerProps,
        style: { ...props.innerProps.style, cursor: "pointer" },
      }}
    />
  );
}

const filterSelectStyles: StylesConfig<FilterOption> = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
    overflow: "visible",
    pointerEvents: "auto",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 10px",
    overflow: "hidden",
  }),
  input: (base, props) => ({
    ...base,
    margin: 0,
    padding: 0,
    border: "none",
    outline: "none",
    boxShadow: "none",
    background: "transparent",
    color: "var(--form-text)",
    opacity: props.selectProps.menuIsOpen ? 1 : 0,
    width: props.selectProps.menuIsOpen ? "100%" : 0,
    minWidth: props.selectProps.menuIsOpen ? "2px" : 0,
    caretColor: "var(--form-focus)",
  }),
  placeholder: (base) => ({ ...base, margin: 0, fontSize: "11px" }),
  singleValue: (base, props) => ({
    ...base,
    display: props.selectProps.menuIsOpen ? "none" : "block",
    margin: 0,
    paddingLeft: 0,
    color: "var(--form-text)",
    fontSize: "11px",
    maxWidth: "calc(100% - 20px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    paddingRight: "4px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "2px 4px",
    cursor: "pointer",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 0,
    marginRight: "2px",
    cursor: "pointer",
  }),
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--form-bg)",
    borderColor: state.isFocused ? "var(--form-focus)" : "var(--form-border)",
    color: "var(--form-text)",
    borderRadius: "0.5rem",
    minHeight: "30px",
    minWidth: "155px",
    fontSize: "11px",
    overflow: "visible",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    boxShadow: state.isFocused ? "0 0 0 1px var(--form-focus)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--form-focus)" : "var(--form-border)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--form-bg)",
    border: "1px solid var(--form-border)",
    borderRadius: "0.5rem",
    overflow: "hidden",
    padding: "4px",
    zIndex: 99999,
    minWidth: "155px",
    width: "max-content",
    maxWidth: "280px",
    boxSizing: "border-box",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: `${FILTER_DROPDOWN_MAX_HEIGHT}px`,
    overflowX: "hidden",
    overflowY: "auto",
    boxSizing: "border-box",
    paddingRight: "2px",
    paddingBottom: "4px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "var(--form-selected-bg)" : "var(--form-bg)",
    color: state.isSelected ? "var(--form-selected-text)" : "var(--form-text)",
    cursor: "pointer",
    borderRadius: "0.375rem",
    fontSize: "11px",
    lineHeight: "1.35",
    padding: "8px 10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    ":active": {
      backgroundColor: "var(--form-selected-bg)",
    },
  }),
};

export function SearchableFilterSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  portalId: _portalId = "filter-select-portal",
  clearValue = "All",
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  portalId?: string;
  clearValue?: string;
}) {
  const menuPortalTarget = getMenuPortalTarget();
  const selected = options.find((o) => o.value === value) ?? null;
  const showClear = value !== clearValue;

  return (
    <>
      <style>{`
        :root {
          --form-bg: #020617;
          --form-border: #1e293b;
          --form-text: #e2e8f0;
          --form-focus: var(--color-violet-500, #3b82f6);
          --form-hover: #0f172a;
          --form-selected-bg: #1e293b;
          --form-selected-text: #a78bfa;
        }
        html.light {
          --form-bg: #ffffff;
          --form-border: #cbd5e1;
          --form-text: #0f172a;
          --form-hover: #f1f5f9;
          --form-selected-bg: #e2e8f0;
          --form-selected-text: var(--color-violet-600, #2563eb);
        }
        .filter-react-select input,
        .filter-react-select input:focus,
        .filter-react-select input:focus-visible,
        .filter-select__input,
        .filter-select__input:focus,
        .filter-select__input:focus-visible,
        html.light .filter-react-select input,
        html.light .filter-react-select input:focus,
        html.light .filter-select__input,
        html.light .filter-select__input:focus {
          background: transparent !important;
          border: none !important;
          border-color: transparent !important;
          box-shadow: none !important;
          outline: none !important;
          -webkit-appearance: none;
          appearance: none;
        }
        .filter-select__value-container {
          padding: 2px 10px !important;
        }
        .filter-select__input-container,
        .filter-select__input-container:focus,
        .filter-select__input-container:focus-within {
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: transparent !important;
        }
        .filter-select__control--menu-is-open .filter-select__single-value {
          display: none !important;
        }
        .filter-select__control:not(.filter-select__control--menu-is-open) .filter-select__input-container {
          position: absolute !important;
          width: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .filter-select__single-value {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .filter-select__control {
          cursor: pointer !important;
        }
        .filter-select__control--is-disabled {
          cursor: not-allowed !important;
        }
        .filter-select__dropdown-indicator {
          cursor: pointer !important;
        }
        .filter-select__clear-indicator {
          padding: 0 !important;
        }
        .filter-select__option {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          max-width: 100% !important;
        }
        .filter-clear-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;
          flex-shrink: 0;
        }
        .filter-clear-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #dc2626;
          transform: scale(1.06);
        }
        .filter-clear-btn:active {
          transform: scale(0.95);
        }
        .filter-clear-icon {
          width: 11px;
          height: 11px;
          display: block;
        }
        html.light .filter-clear-btn {
          background: #fee2e2;
          color: #ef4444;
        }
        html.light .filter-clear-btn:hover {
          background: #fecaca;
          color: #dc2626;
        }
      `}</style>
      {menuPortalTarget && (
        <Select
          className="filter-react-select"
          classNamePrefix="filter-select"
          instanceId={_portalId}
          options={options}
          value={selected}
          isSearchable
          isClearable={showClear}
          components={{
            ClearIndicator: PremiumClearIndicator,
            MenuList: ThinScrollMenuList,
            Control: FilterControl,
          }}
          menuPortalTarget={menuPortalTarget}
          menuPosition="fixed"
          menuPlacement="auto"
          menuShouldScrollIntoView={false}
          openMenuOnClick
          styles={filterSelectStyles}
          maxMenuHeight={FILTER_DROPDOWN_MAX_HEIGHT}
          placeholder={placeholder}
          onChange={(val) => {
            const option = !val || Array.isArray(val) ? null : (val as FilterOption);
            onChange(option?.value ?? clearValue);
          }}
        />
      )}
    </>
  );
}

export function SearchableCountrySelect({ name, value, onChange, required, inputId }: { name?: string, value?: string, onChange?: (val: string) => void, required?: boolean, inputId?: string }) {
  const menuPortalTarget = getMenuPortalTarget();

  return (
    <>
      <style>{`
        :root {
          --form-bg: #020617;
          --form-border: #1e293b;
          --form-text: #e2e8f0;
          --form-focus: var(--color-violet-500, #3b82f6);
          --form-hover: #0f172a;
          --form-selected-bg: #1e293b;
          --form-selected-text: #a78bfa;
        }
        html.light {
          --form-bg: #f8fafc;
          --form-border: #e2e8f0;
          --form-text: #0f172a;
          --form-hover: #f1f5f9;
          --form-selected-bg: #e2e8f0;
          --form-selected-text: var(--color-violet-600, #2563eb);
        }
        .custom-react-select input,
        .custom-react-select input:focus,
        .custom-react-select input:focus-visible,
        .country-select__input,
        .country-select__input:focus,
        .country-select__input:focus-visible,
        html.light .custom-react-select input,
        html.light .custom-react-select input:focus,
        html.light .country-select__input,
        html.light .country-select__input:focus {
          background: transparent !important;
          border: none !important;
          border-color: transparent !important;
          box-shadow: none !important;
          outline: none !important;
          -webkit-appearance: none;
          appearance: none;
        }
        .country-select__input-container,
        .country-select__input-container:focus,
        .country-select__input-container:focus-within {
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: transparent !important;
        }
        .country-select__control--menu-is-open .country-select__single-value {
          display: none !important;
        }
        .country-select__control:not(.country-select__control--menu-is-open) .country-select__input-container {
          position: absolute !important;
          width: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .country-select__option {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          max-width: 100% !important;
        }
      `}</style>
      {menuPortalTarget && (
        <Select
          className="custom-react-select"
          classNamePrefix="country-select"
          instanceId={inputId ?? "country-select"}
          inputId={inputId}
          components={{ MenuList: ThinScrollMenuList }}
          options={countryOptions}
          name={name}
          required={required}
          menuPortalTarget={menuPortalTarget}
          menuPosition="fixed"
          menuPlacement="auto"
          menuShouldScrollIntoView={false}
          openMenuOnClick
          styles={{
            menuPortal: base => ({ ...base, zIndex: 99999 }),
            valueContainer: base => ({ ...base, padding: '0 8px' }),
            input: (base, props) => ({
              ...base,
              margin: 0,
              padding: 0,
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              background: 'transparent',
              color: 'var(--form-text)',
              opacity: props.selectProps.menuIsOpen ? 1 : 0,
              width: props.selectProps.menuIsOpen ? '100%' : 0,
              minWidth: props.selectProps.menuIsOpen ? '2px' : 0,
              caretColor: 'var(--form-focus)',
            }),
            placeholder: base => ({ ...base, margin: '0px', fontSize: '12px' }),
            singleValue: (base, props) => ({
              ...base,
              display: props.selectProps.menuIsOpen ? 'none' : 'block',
              margin: '0px',
              color: 'var(--form-text)',
              fontSize: '12px',
            }),
            control: (base, state) => ({
               ...base,
               backgroundColor: 'var(--form-bg)',
               borderColor: state.isFocused ? 'var(--form-focus)' : 'var(--form-border)',
               color: 'var(--form-text)',
               borderRadius: '0.75rem',
               minHeight: '40px',
               height: '40px',
               fontSize: '12px',
               boxShadow: state.isFocused ? '0 0 0 1px var(--form-focus)' : 'none',
               '&:hover': {
                  borderColor: state.isFocused ? 'var(--form-focus)' : 'var(--form-border)'
               }
            }),
            menu: base => ({
              ...base,
              backgroundColor: 'var(--form-bg)',
              border: '1px solid var(--form-border)',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              padding: '4px',
              zIndex: 99999,
              minWidth: '100%',
              width: 'max-content',
              maxWidth: '280px',
              boxSizing: 'border-box',
            }),
            menuList: base => ({
              ...base,
              maxHeight: `${COUNTRY_DROPDOWN_MAX_HEIGHT}px`,
              overflowX: 'hidden',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }),
            option: (base, state) => ({ 
              ...base, 
              backgroundColor: state.isFocused ? 'var(--form-selected-bg)' : 'var(--form-bg)', 
              color: state.isSelected ? 'var(--form-selected-text)' : 'var(--form-text)',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              ':active': {
                backgroundColor: 'var(--form-selected-bg)'
              }
            })
          }}
          maxMenuHeight={COUNTRY_DROPDOWN_MAX_HEIGHT}
          onChange={(val) => {
            const option = !val || Array.isArray(val) ? null : (val as FilterOption);
            onChange?.(option?.value ?? "");
          }}
          value={value ? { value, label: value } : null}
          placeholder="Select Country"
        />
      )}
    </>
  )
}

const countriesList = defaultCountries.map((c) => {
  const parsed = parseCountry(c);
  return {
    name: parsed.name,
    iso2: parsed.iso2,
    dialCode: `+${parsed.dialCode}`,
  };
});

const DEFAULT_COUNTRY = countriesList.find((c) => c.iso2 === 'in') || countriesList[0];

type PhoneCountry = (typeof countriesList)[number];

function parseE164Phone(e164: string): { country: PhoneCountry; nationalNumber: string } {
  if (!e164.trim()) {
    return { country: DEFAULT_COUNTRY, nationalNumber: '' };
  }

  const cleaned = e164.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    return { country: DEFAULT_COUNTRY, nationalNumber: cleaned.replace(/\D/g, '') };
  }

  const sortedCountries = [...countriesList].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const matched = sortedCountries.find((c) => cleaned.startsWith(c.dialCode));
  if (matched) {
    return {
      country: matched,
      nationalNumber: cleaned.substring(matched.dialCode.length),
    };
  }

  return { country: DEFAULT_COUNTRY, nationalNumber: cleaned.replace(/^\+/, '') };
}

function buildE164Phone(country: PhoneCountry, nationalNumber: string): string {
  const digitsOnly = nationalNumber.replace(/\D/g, '');
  return digitsOnly ? `${country.dialCode}${digitsOnly}` : '';
}

export type PhoneInputProps = {
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  /** Full E.164 value (e.g. +919876543210). When set, the input is controlled. */
  value?: string;
  /** Called with the full E.164 string whenever the phone value changes. */
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function PhoneInput({ id, name, required, placeholder, value, onChange, onBlur }: PhoneInputProps) {
  const isControlled = value !== undefined;

  const [uncontrolledCountry, setUncontrolledCountry] = useState<PhoneCountry>(DEFAULT_COUNTRY);
  const [uncontrolledNationalNumber, setUncontrolledNationalNumber] = useState('');
  const [uncontrolledE164, setUncontrolledE164] = useState('');
  /** Preserves country selection in controlled mode when value is still empty. */
  const [controlledCountry, setControlledCountry] = useState<PhoneCountry>(() =>
    isControlled && value?.trim() ? parseE164Phone(value).country : DEFAULT_COUNTRY
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  React.useEffect(() => {
    if (!isControlled || !value?.trim()) return;
    setControlledCountry(parseE164Phone(value).country);
  }, [value, isControlled]);

  const parsedFromValue =
    isControlled && value?.trim() ? parseE164Phone(value) : null;
  const selectedCountry = isControlled
    ? (parsedFromValue?.country ?? controlledCountry)
    : uncontrolledCountry;
  const phoneNumber = isControlled
    ? (parsedFromValue?.nationalNumber ?? '')
    : uncontrolledNationalNumber;
  const validation = validatePhone(selectedCountry.dialCode, phoneNumber, selectedCountry.iso2);
  const errorMsg = prefixError ?? validation.error;

  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const portalNode = useDropdownPortal('phone-dropdown-portal');

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const visibleInputRef = React.useRef<HTMLInputElement>(null);

  const applyPhoneUpdate = (country: PhoneCountry, nationalNumber: string) => {
    const full = buildE164Phone(country, nationalNumber);
    if (isControlled) {
      setControlledCountry(country);
      onChange?.(full);
    } else {
      setUncontrolledCountry(country);
      setUncontrolledNationalNumber(nationalNumber);
      setUncontrolledE164(full);
    }
  };

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOnButton = buttonRef.current?.contains(target);
      const clickedInDropdown = dropdownRef.current?.contains(target);

      if (!clickedOnButton && !clickedInDropdown) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (visibleInputRef.current) {
      visibleInputRef.current.setCustomValidity(errorMsg ?? '');
    }
  }, [errorMsg]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let nextCountry = selectedCountry;

    if (val.trim().startsWith('+')) {
      const cleaned = val.replace(/[^\d+]/g, '');
      const sortedCountries = [...countriesList].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const matched = sortedCountries.find((c) => cleaned.startsWith(c.dialCode));
      if (matched) {
        nextCountry = matched;
        val = cleaned.substring(matched.dialCode.length);
      }
    }

    setPrefixError(null);
    const filtered = val.replace(/[^\d\s\-\(\)]/g, '');
    applyPhoneUpdate(nextCountry, filtered);
  };

  const filteredCountries = countriesList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.iso2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  return (
    <div className="w-full relative">
      {name ? (
        <input type="hidden" name={name} value={isControlled ? (value ?? '') : uncontrolledE164} />
      ) : null}
      <style>{`
        :root {
          --form-bg: #020617;
          --form-border: #1e293b;
          --form-text: #e2e8f0;
          --form-focus: var(--color-violet-500, #3b82f6);
          --form-hover: #0f172a;
          --form-selected-bg: #1e293b;
          --form-selected-text: #a78bfa;
        }
        html.light {
          --form-bg: #f8fafc;
          --form-border: #e2e8f0;
          --form-text: #0f172a;
          --form-hover: #f1f5f9;
          --form-selected-bg: #e2e8f0;
          --form-selected-text: var(--color-violet-600, #2563eb);
        }
        .phone-input-container {
          display: flex;
          width: 100%;
          min-width: 0;
          position: relative;
          overflow: visible;
          border: 1px solid var(--form-border);
          border-radius: 0.75rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .phone-input-container:focus-within {
          border-color: var(--form-focus);
          box-shadow: 0 0 0 1px var(--form-focus);
        }
        .phone-input-trigger {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background-color: var(--form-bg);
          border: none;
          border-right: 1px solid var(--form-border);
          color: var(--form-text);
          border-radius: 0.75rem 0 0 0.75rem;
          padding: 0 0.6rem;
          height: 40px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: border-color 0.2s;
          user-select: none;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .phone-input-trigger:focus {
          outline: none;
        }
        .phone-input-container:focus-within .phone-input-trigger {
          border-right-color: var(--form-focus);
        }
        .phone-input-field {
          flex: 1;
          min-width: 0;
          background-color: var(--form-bg);
          border: none;
          color: var(--form-text);
          border-radius: 0 0.75rem 0.75rem 0;
          padding: 0 0.75rem;
          height: 40px;
          font-size: 12px;
          outline: none;
          width: 100%;
          background: transparent;
        }
        
        .phone-dropdown-menu {
          position: fixed;
          background-color: var(--form-bg);
          border: 1px solid var(--form-border);
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
          z-index: 99999;
          width: 300px;
          max-height: ${PHONE_DROPDOWN_MENU_MAX_HEIGHT}px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          pointer-events: auto;
        }
        .phone-dropdown-search-container {
          padding: 8px;
          border-bottom: 1px solid var(--form-border);
          background-color: var(--form-bg);
        }
        .phone-dropdown-search-input {
          width: 100%;
          background-color: var(--form-hover);
          border: 1px solid var(--form-border);
          color: var(--form-text);
          border-radius: 0.5rem;
          padding: 6px 12px;
          font-size: 0.75rem;
          outline: none;
          box-sizing: border-box;
        }
        .phone-dropdown-search-input:focus {
          border-color: var(--form-focus);
        }
        .phone-dropdown-list {
          overflow-x: hidden;
          overflow-y: auto;
          flex: 1;
          max-height: ${PHONE_DROPDOWN_LIST_MAX_HEIGHT}px;
          padding: 4px;
          background-color: var(--form-bg);
        }
        .phone-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: var(--form-text);
          font-size: 0.75rem;
          cursor: pointer;
          border-radius: 0.5rem;
          text-align: left;
          transition: background-color 0.15s;
          pointer-events: auto;
        }
        .phone-dropdown-item:hover {
          background-color: var(--form-hover);
        }
        .phone-dropdown-item-selected {
          background-color: var(--form-selected-bg);
          color: var(--form-selected-text);
        }
        .phone-dropdown-no-results {
          padding: 16px;
          text-align: center;
          color: var(--form-text);
          opacity: 0.5;
          font-size: 0.75rem;
        }
      `}</style>

      <div className="phone-input-container">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggleDropdown}
          className="phone-input-trigger"
        >
          <FlagImage iso2={selectedCountry.iso2} style={{ width: '18px', height: '14px', borderRadius: '2px', objectFit: 'cover' }} />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCountry.iso2.toUpperCase()}</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">{selectedCountry.dialCode}</span>
          <span className="text-[9px] text-slate-400 dark:text-slate-600 ml-0.5">▼</span>
        </button>
        <input
          ref={visibleInputRef}
          id={id}
          type="tel"
          required={required}
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={(e) => {
            setIsTouched(true);
            onBlur?.(e);
          }}
          placeholder={placeholder || "9876543210"}
          className="phone-input-field"
        />
      </div>

      {isTouched && errorMsg && phoneNumber && (
        <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
          {errorMsg}
        </span>
      )}

      {isOpen && portalNode && coords && createPortal(
        <div
          ref={dropdownRef}
          className="phone-dropdown-menu"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            pointerEvents: 'auto',
          }}
        >
          <div className="phone-dropdown-search-container">
            <input
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="phone-dropdown-search-input"
              autoFocus
            />
          </div>
          <div className={`phone-dropdown-list ${CRM_DROPDOWN_SCROLL_CLASS}`}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPrefixError(null);
                    applyPhoneUpdate(c, phoneNumber);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`phone-dropdown-item ${selectedCountry.iso2 === c.iso2 ? 'phone-dropdown-item-selected' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <FlagImage iso2={c.iso2} style={{ width: '16px', height: '12px', borderRadius: '1px', objectFit: 'cover' }} />
                    <span className="truncate max-w-[160px]">{c.name}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">{c.dialCode}</span>
                </button>
              ))
            ) : (
              <div className="phone-dropdown-no-results">
                No countries found
              </div>
            )}
          </div>
        </div>,
        portalNode
      )}
    </div>
  );
}
