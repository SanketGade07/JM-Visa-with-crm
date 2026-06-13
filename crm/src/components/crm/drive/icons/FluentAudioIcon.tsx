import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentAudioIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/audio.svg" {...props} />;
}
