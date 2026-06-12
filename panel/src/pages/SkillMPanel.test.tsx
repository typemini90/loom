import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SkillMPanel } from "./SkillMPanel";

const panelData = vi.hoisted(() => ({
  refetch: vi.fn(),
  firstRun: {
    live: true,
    apiReachable: true,
    loading: false,
    error: null,
    mode: "first-run",
    setupRequired: true,
    lastUpdated: "2026-06-12T00:00:00.000Z",
    registryRoot: "/tmp/loom-registry",
    agentDirs: [],
    remote: null,
    warnings: [],
    health: { service: "loom-panel" },
    counts: {},
    skills: [],
    targets: [],
    bindings: [],
    ops: [],
    projections: [],
    queuedWriteCount: 0,
  },
}));

vi.mock("../lib/api/usePanelData", () => ({
  usePanelData: () => ({
    ...panelData.firstRun,
    refetch: panelData.refetch,
  }),
}));

afterEach(() => {
  cleanup();
  panelData.refetch.mockReset();
});

describe("SkillMPanel", () => {
  it("shows the real first-run initialization flow when registry state is missing", async () => {
    render(<SkillMPanel />);

    expect(await screen.findByRole("heading", { name: "Initialize Registry" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Initialize" })).toBeTruthy();
    expect(screen.queryByText("Skill 真实统计")).toBeNull();
  });
});
