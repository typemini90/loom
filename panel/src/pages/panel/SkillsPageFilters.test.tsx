import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RegistryProjection } from "../../generated/RegistryProjection";
import type { Binding, Skill, Target } from "../../lib/types";
import { SkillsPage } from "./SkillsPage";

vi.mock("../../lib/api/client", () => ({
  api: {
    skillHistory: vi.fn(),
    skillDiagnose: vi.fn(),
    skillDiff: vi.fn(),
    capture: vi.fn(),
    skillSave: vi.fn(),
    skillSnapshot: vi.fn(),
    skillRelease: vi.fn(),
    skillRollback: vi.fn(),
    skillTrashList: vi.fn(),
    skillTrashAdd: vi.fn(),
    skillTrashRestore: vi.fn(),
    skillTrashPurge: vi.fn(),
    project: vi.fn(),
  },
}));

// Import after mock registration so we get the mocked version.
// eslint-disable-next-line import/first
import { api } from "../../lib/api/client";

const baseSkill: Skill = {
  id: "ready",
  name: "ready-skill",
  description: "Ready skill",
  tag: "latest",
  sourceStatus: "present",
  releaseTags: ["v1"],
  snapshotTags: [],
  latestRev: "abc12345",
  ruleCount: 1,
  bindingCount: 1,
  projectionCount: 1,
  changed: "1h ago",
  targets: ["target-1"],
};

const target: Target = {
  id: "target-1",
  agent: "claude",
  profile: "home",
  path: "~/.claude/skills",
  ownership: "managed",
  skills: 1,
  lastSync: "now",
};

const binding: Binding = {
  id: "binding-1",
  skill: "ready-skill",
  target: "target-1",
  matcher: "path_prefix:/repo",
  method: "copy",
  policy: "auto",
};

const projection: RegistryProjection = {
  instance_id: "projection-1",
  skill_id: "ready-skill",
  binding_id: "binding-1",
  target_id: "target-1",
  materialized_path: "/tmp/target/ready-skill",
  method: "copy",
  last_applied_rev: "abc12345",
  health: "healthy",
};

function renderFixture() {
  const attentionSkill: Skill = {
    ...baseSkill,
    id: "attention",
    name: "attention-skill",
    sourceStatus: "missing",
    releaseTags: [],
    bindingCount: 0,
    projectionCount: 0,
    targets: [],
  };
  render(
    <SkillsPage
      skills={[baseSkill, attentionSkill]}
      targets={[target]}
      bindings={[binding]}
      projections={[projection]}
      selectedSkill="ready"
      onSelectSkill={() => {}}
      onMutation={() => {}}
      readOnly={false}
    />,
  );
}

describe("SkillsPage filters and detail tabs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (api.skillHistory as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: { skill: "ready-skill", count: 0, events: [] },
    });
  });

  it("filters by source status, target, attention state, and tags", () => {
    renderFixture();
    const list = () => within(screen.getByRole("table"));

    fireEvent.change(screen.getByLabelText("Source status filter"), { target: { value: "missing" } });
    expect(list().getByText("attention-skill")).toBeInTheDocument();
    expect(list().queryByText("ready-skill")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Source status filter"), { target: { value: "all" } });
    fireEvent.change(screen.getByLabelText("Target filter"), { target: { value: "target-1" } });
    expect(list().getByText("ready-skill")).toBeInTheDocument();
    expect(list().queryByText("attention-skill")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Target filter"), { target: { value: "all" } });
    fireEvent.change(screen.getByLabelText("Attention filter"), { target: { value: "attention" } });
    expect(list().getByText("attention-skill")).toBeInTheDocument();
    expect(list().queryByText("ready-skill")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Attention filter"), { target: { value: "all" } });
    fireEvent.change(screen.getByLabelText("Tag filter"), { target: { value: "tagged" } });
    expect(list().getByText("ready-skill")).toBeInTheDocument();
    expect(list().queryByText("attention-skill")).not.toBeInTheDocument();
  });

  it("renders real detail tabs without source or files tabs", () => {
    renderFixture();
    expect(screen.queryByRole("button", { name: "Source" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Files" })).not.toBeInTheDocument();

    for (const name of ["Overview", "Lifecycle", "Diagnose", "History", "Diff", "Projections (1)", "Trash state"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    expect(screen.getByText("healthy 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Projections (1)" }));
    expect(screen.getByText("/tmp/target/ready-skill")).toBeInTheDocument();
    expect(screen.getByText("copy · abc12345")).toBeInTheDocument();
  });
});
