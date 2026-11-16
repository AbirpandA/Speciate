import Svg, { Path } from "react-native-svg";
import { theme } from "@/utils/theme";

/** Speciate S monogram. Same geometry as assets/brand/logo.svg. */
export const LOGO_PATH = "M642 324.5 A150 125 0 1 0 512 512 A150 125 0 1 1 382 699.5";

export default function AppLogo({
  size = 48,
  color = theme.accent,
}: {
  size?: number;
  color?: string;
}) {
  // Crop the 1024 artboard to the mark's bounds (plus stroke) so `size` is the mark size.
  return (
    <Svg width={size} height={size} viewBox="262 212 500 600">
      <Path d={LOGO_PATH} fill="none" stroke={color} strokeWidth={100} strokeLinecap="round" />
    </Svg>
  );
}
