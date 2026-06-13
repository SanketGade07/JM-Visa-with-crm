import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentExcelIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/xlsx.svg" {...props} />;
}
