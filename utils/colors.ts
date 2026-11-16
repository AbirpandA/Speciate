import { theme } from "./theme";

/** @deprecated use `theme` from utils/theme. Kept for older components. */
const Colors = {
  black: "#000000",
  darkGray: theme.elevated,
  mediumGray: theme.muted,
  lightGray: "#E0E0E0",
  white: "#FFFFFF",
  habitCardBackground: theme.surface,
  habitIconBackground: theme.elevated,
  checkBoxBackground: theme.borderStrong,
  cellColor: "#2F2F2F",
  disabledCellColor: "#2c2c2c",
  checkMarkColor: "#666666",
  borderColor: theme.border,
} as const;

export default Colors;
