import React from "react";

type DriveStorageIconProps = {
  className?: string;
};

export function DriveStorageIcon({ className }: DriveStorageIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="driveStorageCloudGrad" x1="2" y1="4" x2="18" y2="16">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M6.5 13.5C4.567 13.5 3 11.933 3 10c0-1.657 1.21-3.033 2.793-3.287C6.148 5.214 7.904 4 10 4c2.347 0 4.31 1.496 4.933 3.585C16.214 7.914 17.5 9.343 17.5 11c0 1.933-1.567 3.5-3.5 3.5h-7.5Z"
        fill="url(#driveStorageCloudGrad)"
      />
      <rect x="8.25" y="10.75" width="3.5" height="3.25" rx="0.75" fill="#1e40af" />
      <path
        d="M9.25 10.75v-1a0.75 0.75 0 0 1 1.5 0v1"
        stroke="#1e40af"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
