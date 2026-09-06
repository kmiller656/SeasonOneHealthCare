/* Annexity institution portal — shell and rendering.
 *
 * The mock `DATA` object that used to live here is gone; the numbers come from
 * Supabase now (portal-data.js). What stayed is everything that turns a row into
 * markup, unchanged, which was the point of keeping the data in one object in the
 * first place.
 *
 * `CTX` is filled by each page after `loadContext()` resolves, before `shell()`
 * runs. Nothing here fetches.
 */

let CTX = { institution: null, role: null, email: "" };

const NAV = [
  { group: "Program" },
  { href: "dashboard.html",   icon: "◱", label: "Dashboard" },
  { href: "roster.html",      icon: "☰", label: "Students" },
  { href: "assignments.html", icon: "✎", label: "Lesson plans" },
  { href: "materials.html",   icon: "⬆", label: "Material" },
  { group: "Account" },
  { href: "account.html",     icon: "⚙", label: "Account & billing" },
  { href: "support.html",     icon: "?", label: "Help & support" },
  { href: "legal.html",       icon: "§", label: "Legal & documents" }
];

function initials(name) {
  return (name || "").split(" ").filter(Boolean).slice(0, 2)
    .map(w => w[0]).join("").toUpperCase() || "?";
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Paints the sidebar and top bar. Every page calls this once, after loadContext(). */
function shell(active, title, sub) {
  const inst = CTX.institution || {};
  const side = document.querySelector(".side");
  if (side) {
    side.innerHTML =
      '<div class="side-brand">Annexity<small>' + esc(inst.display_name || inst.name || "") + '</small></div>' +
      NAV.map(n => n.group
        ? '<div class="side-group">' + n.group + '</div>'
        : '<a href="' + n.href + '"' + (n.href === active ? ' class="on"' : '') + '>' +
          '<span class="ic">' + n.icon + '</span>' + n.label + '</a>'
      ).join("") +
      '<div class="side-foot"><a href="#" id="signout" style="color:rgba(255,255,255,.75)">Sign out</a></div>';
    const out = document.getElementById("signout");
    if (out) out.addEventListener("click", e => { e.preventDefault(); signOut(); });
  }
  const top = document.querySelector(".top");
  if (top) {
    top.innerHTML =
      '<div><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>' +
      '<div class="top-right"><div class="who"><span>' + esc(CTX.email) + '</span>' +
      '<span class="avatar">' + initials(CTX.email.split("@")[0].replace(/[._]/g, " ")) + '</span></div></div>';
  }
}

/**
 * The status a coordinator set, or nothing.
 *
 * "No flag" is drawn as plain text rather than a green pill on purpose. A green
 * "On track" badge beside every unflagged student is a claim the software has not
 * earned — it has a lesson count, not a judgement — and it makes the two students
 * who *are* flagged harder to spot, which is the one thing this column is for.
 */
function statusPill(status) {
  if (status === "at_risk")  return '<span class="pill bad">At risk</span>';
  if (status === "tutoring") return '<span class="pill warn">Tutoring</span>';
  if (status === "drs")      return '<span class="pill">DRS</span>';
  if (status === "inactive") return '<span class="pill">Inactive</span>';
  return '<span class="muted">—</span>';
}

function statusLabel(status) { return STATUS_LABELS[status] || status; }

function bar(pct) {
  if (pct == null) return '<span class="muted">No data yet</span>';
  const cls = pct < 60 ? "bad" : pct < 75 ? "warn" : "";
  return '<div class="bar-row"><div class="bar"><i class="' + cls +
         '" style="width:' + Math.max(2, Math.min(100, pct)) + '%"></i></div><span>' + pct + '%</span></div>';
}

function studentRow(s) {
  return '<tr>' +
    '<td><a class="who-cell" href="student.html?id=' + encodeURIComponent(s.id) + '">' +
      '<span class="avatar">' + initials(s.name) + '</span>' +
      '<span><b>' + esc(s.name) + '</b><small>' + esc(s.cohort) + ' · ' + esc(s.stage) + '</small></span></a></td>' +
    '<td class="mono">' + esc(s.studentNumber) + '</td>' +
    '<td class="num">' + s.lessons + '</td>' +
    '<td class="num">' + s.questions.toLocaleString() + '</td>' +
    '<td style="min-width:150px">' + bar(s.accuracy) + '</td>' +
    '<td>' + esc(sinceLabel(s.lastActive)) + '</td>' +
    '<td>' + statusPill(s.status) + '</td>' +
  '</tr>';
}

/** One place to put an unrecoverable page error, rather than a blank screen. */
function pageError(message) {
  const c = document.querySelector(".content");
  if (c) c.innerHTML = '<div class="card"><div class="card-body"><div class="alert">' +
    esc(message) + '</div></div></div>';
}
