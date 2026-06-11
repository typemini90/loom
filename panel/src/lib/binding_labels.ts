import type { Binding } from "./types";

export function isMultiBinding(binding: Binding): boolean {
  return binding.skill === "multi" || (binding.ruleCount ?? 0) > 1 || (binding.skillCount ?? 0) > 1;
}
