/* Annexity institution portal — the real data layer.
 *
 * This replaces the `DATA` object that portal.js used to carry. That object was
 * always a placeholder with a plan attached: hold every figure in one place so
 * that when a backend existed, the queries could go in and the markup would not
 * have to change. This is that swap.
 *
 * Everything here runs as the signed-in user against row-level security. There is
 * no service-role key on this page and there must never be one: the anon key
 * identifies the project, the session identifies the person, and Postgres decides
 * what they may see. A faculty member sees their own institution's roster because
 * `is_member_of()` says so, not because this file remembered to filter.
 */

const SUPABASE_URL = "https://gvqfktkkqscgmxlahyyh.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cWZrdGtrcXNjZ214bGFoeXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTQ2MDgsImV4cCI6MjA5NzY3MDYwOH0.KSVEzNo0MC9JQCTwN8mpo9UyngObbmA4F3hnORc8r9k";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true }
});

/* -- session ------------------------------------------------------------- */

/** Sends anyone without a session back to sign-in. Every portal page calls this first. */
async function requireSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    location.replace("index.html");
    return null;
  }
  return session;
}

async function signOut() {
  await sb.auth.signOut();
  location.replace("index.html");
}

/* -- context ------------------------------------------------------------- */

/**
 * Which institution this person staffs, and in what role.
 *
 * A student who signs in here is not an error and is not shown a broken page —
 * they are told plainly that the portal is the staff side and pointed at the app.
 * Someone with no membership at all is a different case again: a real person whose
 * programme has not added them yet.
 */
async function loadContext() {
  const { data: { user } } = await sb.auth.getUser();

  const { data: memberships, error } = await sb
    .from("institution_members")
    .select("institution_id, role, cohort, institutions(id, name, display_name, seats, status)")
    .eq("user_id", user.id)
    .is("left_at", null);

  if (error) throw error;

  const staff = (memberships || []).filter(m => m.role === "owner" || m.role === "faculty");
  const student = (memberships || []).find(m => m.role === "student");

  return {
    user,
    email: user.email,
    membership: staff[0] || null,
    isStudentOnly: !staff.length && !!student,
    hasNoInstitution: !memberships || !memberships.length
  };
}

/* -- roster -------------------------------------------------------------- */

/**
 * The roster, assembled from three tables.
 *
 * Three round trips rather than one embedded query, because PostgREST can only
 * embed across a declared foreign key and `institution_members` and `profiles`
 * both point at `auth.users` rather than at each other. A join could be bought
 * with another migration; for a cohort of sixty it is not worth the schema debt.
 *
 * `progress_reports` is keyed by (institution, user, as_of) — one row per day — so
 * the newest row per student is the current picture. Sorted descending and taken
 * first rather than aggregated in SQL, for the same reason.
 */
async function loadRoster(institutionId) {
  const { data: members, error: mErr } = await sb
    .from("institution_members")
    .select("user_id, role, cohort, status, status_note, student_number, joined_at")
    .eq("institution_id", institutionId)
    .is("left_at", null);
  if (mErr) throw mErr;

  const students = (members || []).filter(m => m.role === "student");
  if (!students.length) return [];

  const ids = students.map(m => m.user_id);

  const [{ data: profiles }, { data: reports }] = await Promise.all([
    sb.from("profiles").select("user_id, first_name, last_name, display_name, stage, email").in("user_id", ids),
    sb.from("progress_reports")
      .select("user_id, as_of, lessons_done, questions_seen, percent_correct, last_active, current_streak")
      .eq("institution_id", institutionId).in("user_id", ids)
      .order("as_of", { ascending: false })
  ]);

  const byUser = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
  const latest = {};
  for (const r of reports || []) if (!latest[r.user_id]) latest[r.user_id] = r;

  return students.map(m => {
    const p = byUser[m.user_id] || {};
    const r = latest[m.user_id] || {};
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim()
      || p.display_name || "Unnamed student";
    return {
      id: m.user_id,
      name,
      firstName: p.first_name || "",
      lastName: p.last_name || "",
      email: p.email || "",
      studentNumber: m.student_number || "—",
      cohort: m.cohort || "—",
      stage: p.stage || "—",
      status: m.status || "none",
      statusNote: m.status_note || "",
      lessons: r.lessons_done || 0,
      questions: r.questions_seen || 0,
      accuracy: r.percent_correct == null ? null : Math.round(r.percent_correct),
      streak: r.current_streak || 0,
      lastActive: r.last_active || null
    };
  }).sort((a, b) => a.lastName.localeCompare(b.lastName) || a.name.localeCompare(b.name));
}

/* -- roster writes ------------------------------------------------------- */

async function setStudentStatus(institutionId, userId, status, note) {
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("institution_members")
    .update({
      status,
      status_note: note || null,
      status_set_by: user.id,
      status_set_at: new Date().toISOString()
    })
    .eq("institution_id", institutionId).eq("user_id", userId);
  if (error) throw error;
}

/** Asks Postgres for the next free number rather than counting rows here — two
 *  coordinators adding a student at once would otherwise pick the same one. */
async function nextStudentNumber(institutionId) {
  const { data, error } = await sb.rpc("next_student_number", { inst: institutionId });
  if (error) throw error;
  return data;
}

async function assignStudentNumber(institutionId, userId, number) {
  const { error } = await sb.from("institution_members")
    .update({ student_number: number })
    .eq("institution_id", institutionId).eq("user_id", userId);
  if (error) throw error;
}

/** Removing a student ends their membership; it does not touch their account or
 *  their study data. `left_at` rather than a delete, so the history survives. */
async function removeFromRoster(institutionId, userId) {
  const { error } = await sb.from("institution_members")
    .update({ left_at: new Date().toISOString() })
    .eq("institution_id", institutionId).eq("user_id", userId);
  if (error) throw error;
}

/** One student, for the profile page. Same shape a roster row has. */
async function loadStudent(institutionId, userId) {
  const roster = await loadRoster(institutionId);
  return roster.find(s => s.id === userId) || null;
}

/** Assignments targeted at one student, newest first. */
async function loadStudentAssignments(institutionId, userId) {
  const { data: targets, error } = await sb
    .from("assignment_targets")
    .select("assignment_id, assignments!inner(id, title, instructions, due_at, lessons_per_day, condition_ids, created_at, institution_id)")
    .eq("user_id", userId);
  if (error) throw error;

  const mine = (targets || [])
    .map(t => t.assignments)
    .filter(a => a && a.institution_id === institutionId);

  const ids = mine.map(a => a.id);
  let progress = {};
  if (ids.length) {
    const { data: rows } = await sb.from("assignment_progress")
      .select("assignment_id, opened_at, completed_at")
      .eq("user_id", userId).in("assignment_id", ids);
    progress = Object.fromEntries((rows || []).map(r => [r.assignment_id, r]));
  }

  return mine
    .map(a => ({
      id: a.id,
      title: a.title,
      instructions: a.instructions || "",
      dueAt: a.due_at,
      lessonsPerDay: a.lessons_per_day,
      itemCount: (a.condition_ids || []).length,
      createdAt: a.created_at,
      openedAt: (progress[a.id] || {}).opened_at || null,
      completedAt: (progress[a.id] || {}).completed_at || null
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function updateProfileName(userId, firstName, lastName) {
  const { error } = await sb.from("profiles").update({
    first_name: firstName,
    last_name: lastName,
    display_name: [firstName, lastName].filter(Boolean).join(" "),
    updated_at: new Date().toISOString()
  }).eq("user_id", userId);
  if (error) throw error;
}

/**
 * Sends the student a password-reset email.
 *
 * Staff never see or set the password — Supabase mails a single-use link to the
 * student's own address and they choose it themselves. A coordinator typing a
 * password for someone else means the coordinator knows it, which is exactly what
 * a reset is supposed to avoid.
 */
async function sendPasswordReset(email) {
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: "https://annexity.com/reset"
  });
  if (error) throw error;
}

/* -- display ------------------------------------------------------------- */

const STATUS_LABELS = {
  none: "No flag",
  at_risk: "At risk",
  tutoring: "Tutoring",
  drs: "Disability Resource Services",
  inactive: "Inactive"
};

/** Days since a date, as something a person reads. */
function sinceLabel(iso) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso + "T00:00:00").getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return days + " days ago";
}
