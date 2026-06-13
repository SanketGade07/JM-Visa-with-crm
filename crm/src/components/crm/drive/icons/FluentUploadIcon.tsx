import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentUploadIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/upload.svg" {...props} />;
}
