import type { FluentIconProps } from "./types";
import { fluentIconDefaults } from "./types";

/** Reference order: Blue, Purple, Teal, Orange, Pink, Light Blue, Green */
const FOLDER_PALETTE = [
  { body: "#4A9FE8", tab: "#2B7FD4", front: "#6BB3F0" },
  { body: "#9B6FCE", tab: "#7B4FB0", front: "#B08FDB" },
  { body: "#2DBCA1", tab: "#1A9A82", front: "#4FD4BC" },
  { body: "#F5A623", tab: "#D4890A", front: "#F7BE4D" },
  { body: "#F06292", tab: "#E91E63", front: "#F48FB1" },
  { body: "#64B5F6", tab: "#42A5F5", front: "#90CAF9" },
  { body: "#6BBF59", tab: "#4DA63C", front: "#8FD47E" },
] as const;

export type FluentFolderIconProps = FluentIconProps & {
  colorIndex?: number;
};

export function FluentFolderIcon({
  colorIndex = 0,
  ...props
}: FluentFolderIconProps) {
  const palette = FOLDER_PALETTE[((colorIndex % 7) + 7) % 7];

  return (
    <svg {...fluentIconDefaults(props)}>
      <path
        d="M6 14C6 12.3431 7.34315 11 9 11H18.5L22 8H39C40.6569 8 42 9.34315 42 11V38C42 39.6569 40.6569 41 39 41H9C7.34315 41 6 39.6569 6 38V14Z"
        fill={palette.body}
      />
      <path
        d="M6 14C6 12.3431 7.34315 11 9 11H18.5L22 8H39C40.6569 8 42 9.34315 42 11V16H6V14Z"
        fill={palette.tab}
      />
      <path
        d="M6 20H42V38C42 39.6569 40.6569 41 39 41H9C7.34315 41 6 39.6569 6 38V20Z"
        fill={palette.front}
      />
    </svg>
  );
}

export const FOLDER_COLOR_COUNT = FOLDER_PALETTE.length;
