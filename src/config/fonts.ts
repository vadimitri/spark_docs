export const fontRoles = {
  body: "var(--serif)",
  heading: "var(--serif)",
  mono: "var(--mono)",
  display: "var(--display)",
} as const;

export type FontRole = keyof typeof fontRoles;
