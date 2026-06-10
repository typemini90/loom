use super::*;
use std::env;
use std::fs as stdfs;

fn scratch_dir(label: &str) -> PathBuf {
    let dir = env::temp_dir().join(format!(
        "loom-projections-{}-{}",
        label,
        Uuid::new_v4().simple()
    ));
    stdfs::create_dir_all(&dir).expect("scratch dir");
    dir
}

fn make_skill_src(base: &Path) -> PathBuf {
    let skill = base.join("sample-skill");
    stdfs::create_dir_all(&skill).expect("skill dir");
    stdfs::write(skill.join("SKILL.md"), "# sample\n").expect("SKILL.md");
    skill
}

#[test]
fn copy_method_materializes_files() {
    let base = scratch_dir("copy");
    let src = make_skill_src(&base);
    let dst = base.join("dst-copy");
    project_skill_to_target(&src, &dst, ProjectionMethod::Copy).expect("copy ok");
    assert!(dst.join("SKILL.md").is_file(), "SKILL.md must be copied");
    let _ = stdfs::remove_dir_all(&base);
}

#[test]
fn materialize_method_materializes_files() {
    let base = scratch_dir("materialize");
    let src = make_skill_src(&base);
    let dst = base.join("dst-mat");
    project_skill_to_target(&src, &dst, ProjectionMethod::Materialize).expect("materialize ok");
    assert!(dst.join("SKILL.md").is_file());
    let _ = stdfs::remove_dir_all(&base);
}

#[cfg(unix)]
#[test]
fn copy_preserves_symlink_but_materialize_resolves_it() {
    let base = scratch_dir("copy-vs-materialize-symlink");
    let src = make_skill_src(&base);
    let secret = base.join("secret.txt");
    stdfs::write(&secret, "secret contents\n").expect("secret file");
    std::os::unix::fs::symlink(&secret, src.join("secret-link")).expect("source symlink");

    let copy_dst = base.join("dst-copy");
    project_skill_to_target(&src, &copy_dst, ProjectionMethod::Copy).expect("copy ok");
    assert!(
        stdfs::symlink_metadata(copy_dst.join("secret-link"))
            .expect("copy link metadata")
            .file_type()
            .is_symlink(),
        "copy must preserve the symlink instead of dereferencing it"
    );

    let mat_dst = base.join("dst-mat");
    project_skill_to_target(&src, &mat_dst, ProjectionMethod::Materialize).expect("materialize ok");
    assert!(
        stdfs::symlink_metadata(mat_dst.join("secret-link"))
            .expect("materialized link metadata")
            .is_file(),
        "materialize must produce a real file"
    );
    assert_eq!(
        stdfs::read_to_string(mat_dst.join("secret-link")).expect("materialized content"),
        "secret contents\n"
    );

    let _ = stdfs::remove_dir_all(&base);
}

#[test]
fn symlink_method_creates_link_on_unix_tmp() {
    if !cfg!(unix) {
        return;
    }
    let base = scratch_dir("symlink");
    let src = make_skill_src(&base);
    let dst = base.join("dst-symlink");
    project_skill_to_target(&src, &dst, ProjectionMethod::Symlink).expect("symlink ok");
    assert!(
        stdfs::symlink_metadata(&dst)
            .expect("dst exists")
            .file_type()
            .is_symlink(),
        "dst must be a symlink"
    );
    let _ = stdfs::remove_dir_all(&base);
}
