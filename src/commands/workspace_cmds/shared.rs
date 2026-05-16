use std::path::PathBuf;

use crate::cli::AgentKind;

pub(super) const DEFAULT_SCAN_AGENTS: [AgentKind; 10] = [
    AgentKind::Claude,
    AgentKind::Codex,
    AgentKind::Cursor,
    AgentKind::Windsurf,
    AgentKind::Cline,
    AgentKind::Copilot,
    AgentKind::Aider,
    AgentKind::Opencode,
    AgentKind::GeminiCli,
    AgentKind::Goose,
];

pub(super) fn default_skill_dir(agent: AgentKind, home: &str) -> PathBuf {
    match agent {
        AgentKind::Claude => PathBuf::from(format!("{home}/.claude/skills")),
        AgentKind::Codex => PathBuf::from(format!("{home}/.codex/skills")),
        AgentKind::Cursor => PathBuf::from(format!("{home}/.cursor/skills")),
        AgentKind::Windsurf => PathBuf::from(format!("{home}/.windsurf/skills")),
        AgentKind::Cline => PathBuf::from(format!("{home}/.cline/skills")),
        AgentKind::Copilot => PathBuf::from(format!("{home}/.github/copilot/skills")),
        AgentKind::Aider => PathBuf::from(format!("{home}/.aider/skills")),
        AgentKind::Opencode => PathBuf::from(format!("{home}/.opencode/skills")),
        AgentKind::GeminiCli => PathBuf::from(format!("{home}/.gemini/skills")),
        AgentKind::Goose => PathBuf::from(format!("{home}/.config/goose/skills")),
    }
}
