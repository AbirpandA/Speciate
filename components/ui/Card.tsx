import React from "react";
import { View, ViewProps } from "react-native";

export default function Card({ className = "", style, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface rounded-3xl border border-line p-4 ${className}`}
      style={style}
      {...rest}
    />
  );
}
