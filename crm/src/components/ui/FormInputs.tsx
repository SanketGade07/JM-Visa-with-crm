"use client";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { getNames } from 'country-list';
import { defaultCountries, parseCountry, FlagImage } from 'react-international-phone';
import 'react-international-phone/style.css';
import { PhoneNumberUtil } from 'google-libphonenumber';

const countryOptions = getNames().map(name => ({ value: name, label: name })).sort((a, b) => a.label.localeCompare(b.label));

export function SearchableCountrySelect({ name, value, onChange, required }: { name?: string, value?: string, onChange?: (val: string) => void, required?: boolean }) {
  const [portalNode, setPortalNode] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // Create a dedicated div for the portal, appended to body
    const el = document.createElement('div');
    el.setAttribute('id', 'country-select-portal');
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '0';
    el.style.height = '0';
    el.style.zIndex = '99999';
    document.body.appendChild(el);
    setPortalNode(el);
    return () => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    };
  }, []);

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
        html.light .custom-react-select input,
        html.light .custom-react-select input:focus,
        .custom-react-select input,
        .custom-react-select input:focus {
          background-color: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
          outline: none !important;
        }
        /* Portal menu styles - ensure it renders above everything */
        #country-select-portal .css-26l3qy-menu,
        #country-select-portal [class*="-menu"] {
          z-index: 99999 !important;
        }
      `}</style>
      {portalNode && (
        <Select
          className="custom-react-select"
          options={countryOptions}
          name={name}
          required={required}
          menuPortalTarget={portalNode}
          menuPosition="fixed"
          menuShouldScrollIntoView={false}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 99999 }),
            valueContainer: base => ({ ...base, padding: '0 8px' }),
            input: base => ({ ...base, margin: '0px', padding: '0px', color: 'var(--form-text)' }),
            placeholder: base => ({ ...base, margin: '0px' }),
            singleValue: base => ({ ...base, margin: '0px', color: 'var(--form-text)' }),
            control: (base, state) => ({
               ...base,
               backgroundColor: 'var(--form-bg)',
               borderColor: state.isFocused ? 'var(--form-focus)' : 'var(--form-border)',
               color: 'var(--form-text)',
               borderRadius: '0.75rem',
               minHeight: '40px',
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
            }),
            menuList: base => ({ ...base, maxHeight: '400px' }),
            option: (base, state) => ({ 
              ...base, 
              backgroundColor: state.isFocused ? 'var(--form-selected-bg)' : 'var(--form-bg)', 
              color: state.isSelected ? 'var(--form-selected-text)' : 'var(--form-text)',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              ':active': {
                backgroundColor: 'var(--form-selected-bg)'
              }
            })
          }}
          maxMenuHeight={400}
          onChange={val => onChange?.(val?.value || '')}
          defaultValue={value ? { value, label: value } : null}
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
const phoneUtil = PhoneNumberUtil.getInstance();

function validatePhone(dialCode: string, nationalNumber: string, iso2: string) {
  if (!nationalNumber) return { isValid: true, error: null };
  
  const digitsOnly = nationalNumber.replace(/\D/g, '');
  if (digitsOnly.length === 0) return { isValid: true, error: null };

  try {
    const fullNumber = dialCode + digitsOnly;
    const parsed = phoneUtil.parseAndKeepRawInput(fullNumber, iso2.toUpperCase());
    
    const parsedDialCode = `+${parsed.getCountryCode()}`;
    if (parsedDialCode !== dialCode) {
      return { isValid: false, error: 'invalid' };
    }

    const isValid = phoneUtil.isValidNumber(parsed);
    if (!isValid) {
      return { isValid: false, error: 'invalid number' };
    }
    
    return { isValid: true, error: null };
  } catch (error: any) {
    const msg = error.toString().toLowerCase();
    if (msg.includes('country code') || msg.includes('calling code') || msg.includes('missing or invalid')) {
      return { isValid: false, error: 'invalid' };
    }
    return { isValid: false, error: 'invalid number' };
  }
}

export function PhoneInput({ name, required, placeholder }: { name: string, required?: boolean, placeholder?: string }) {
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const visibleInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'phone-dropdown-portal');
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '0';
    el.style.height = '0';
    el.style.zIndex = '99999';
    document.body.appendChild(el);
    setPortalNode(el);
    return () => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    };
  }, []);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
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
      const target = event.target as HTMLElement;
      const clickedOnButton = buttonRef.current?.contains(target);
      const clickedInDropdown = document.getElementById('phone-dropdown-portal')?.contains(target);
      
      if (!clickedOnButton && !clickedInDropdown) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('resize', updateCoords);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', updateCoords);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  React.useEffect(() => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const full = digitsOnly ? `${selectedCountry.dialCode}${digitsOnly}` : '';
    setPhone(full);

    const validation = validatePhone(selectedCountry.dialCode, phoneNumber, selectedCountry.iso2);
    setErrorMsg(validation.error);
  }, [selectedCountry, phoneNumber]);

  React.useEffect(() => {
    if (visibleInputRef.current) {
      if (errorMsg) {
        visibleInputRef.current.setCustomValidity(errorMsg);
      } else {
        visibleInputRef.current.setCustomValidity('');
      }
    }
  }, [errorMsg]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    if (val.trim().startsWith('+')) {
      const cleaned = val.replace(/[^\d+]/g, '');
      const sortedCountries = [...countriesList].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const matched = sortedCountries.find((c) => cleaned.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
        val = cleaned.substring(matched.dialCode.length);
      } else {
        const hasPrefix = countriesList.some((c) => c.dialCode.startsWith(cleaned));
        if (!hasPrefix && cleaned.length > 2) {
          setErrorMsg('invalid');
        }
      }
    }
    
    const filtered = val.replace(/[^\d\s\-\(\)]/g, '');
    setPhoneNumber(filtered);
  };

  const filteredCountries = countriesList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.iso2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  return (
    <div className="w-full relative">
      <input type="hidden" name={name} value={phone} />
      <style>{`
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
          font-size: 0.7rem;
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
          font-size: 0.75rem;
          outline: none;
          width: 100%;
          background: transparent;
        }
        
        .phone-dropdown-menu {
          position: absolute;
          background-color: var(--form-bg);
          border: 1px solid var(--form-border);
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
          z-index: 99999;
          width: 300px;
          max-height: 300px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
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
          overflow-y: auto;
          flex: 1;
          max-height: 240px;
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
          type="tel"
          required={required}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder || "9876543210"}
          className="phone-input-field"
        />
      </div>

      {errorMsg && phoneNumber && (
        <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
          {errorMsg}
        </span>
      )}

      {isOpen && portalNode && coords && createPortal(
        <div 
          className="phone-dropdown-menu"
          style={{
            top: `${coords.top + 4}px`,
            left: `${coords.left}px`,
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
          <div className="phone-dropdown-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(c);
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
