"use client";

import React from "react";
import { FiGlobe } from "react-icons/fi";
import { SearchableFilterSelect, destinationFilterOptions } from "@/components/ui/FormInputs";

type LeadManagementToolbarProps = {
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
};

export function LeadManagementToolbar({
  countryFilter,
  onCountryFilterChange,
}: LeadManagementToolbarProps) {
  return (
    <div className="lead-mgmt-toolbar">
      <div className="lead-mgmt-toolbar__destination">
        <span className="lead-mgmt-toolbar__destination-label">Destination</span>
        <div className="lead-mgmt-toolbar__destination-control">
          <FiGlobe className="lead-mgmt-toolbar__destination-icon" aria-hidden="true" />
          <SearchableFilterSelect
            value={countryFilter}
            onChange={onCountryFilterChange}
            options={destinationFilterOptions}
            placeholder="All Countries"
            portalId="lead-destination-filter-portal"
          />
        </div>
      </div>
    </div>
  );
}
