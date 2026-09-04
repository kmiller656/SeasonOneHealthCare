/* Season One institution portal — shared shell and mock data.
 *
 * PROTOTYPE. Every figure here is invented. It exists so the screens can be
 * reacted to before the backend is built; see the institution platform plan.
 * When the backend lands, `DATA` is replaced by Supabase queries and nothing
 * about the markup has to change — which is the point of holding it in one
 * object rather than hardcoding numbers into the HTML.
 */

const DATA = {
  institution: {
    name: "Ridgeline University PA Program",
    short: "Ridgeline",
    seats: 62,
    seatsUsed: 58,
    plan: "Program — annual",
    renews: "2027-08-01",
    contact: "Dr. Alicia Moreno",
    email: "amoreno@ridgeline.edu"
  },
  students: [
    { id:"s1", name:"Aisha Bello",      email:"abello@ridgeline.edu",  cohort:"Class of 2027", stage:"Clinical", lessons:78, questions:1240, accuracy:81, streak:12, lastActive:"today",      risk:"ok"   },
    { id:"s2", name:"Daniel Okafor",    email:"dokafor@ridgeline.edu", cohort:"Class of 2027", stage:"Clinical", lessons:71, questions:980,  accuracy:76, streak:4,  lastActive:"yesterday",  risk:"ok"   },
    { id:"s3", name:"Priya Raghunathan",email:"praghu@ridgeline.edu",  cohort:"Class of 2027", stage:"Clinical", lessons:64, questions:1105, accuracy:84, streak:21, lastActive:"today",      risk:"ok"   },
    { id:"s4", name:"Marcus Webb",      email:"mwebb@ridgeline.edu",   cohort:"Class of 2027", stage:"Clinical", lessons:22, questions:210,  accuracy:58, streak:0,  lastActive:"18 days ago",risk:"high" },
    { id:"s5", name:"Sofia Alvarez",    email:"salvarez@ridgeline.edu",cohort:"Class of 2028", stage:"Didactic", lessons:41, questions:520,  accuracy:69, streak:2,  lastActive:"6 days ago", risk:"watch"},
    { id:"s6", name:"Tomas Lindqvist",  email:"tlind@ridgeline.edu",   cohort:"Class of 2028", stage:"Didactic", lessons:53, questions:735,  accuracy:79, streak:9,  lastActive:"today",      risk:"ok"   },
    { id:"s7", name:"Grace Nkemdirim",  email:"gnkem@ridgeline.edu",   cohort:"Class of 2028", stage:"Didactic", lessons:12, questions:95,   accuracy:52, streak:0,  lastActive:"25 days ago",risk:"high" },
    { id:"s8", name:"Elliot Chen",      email:"echen@ridgeline.edu",   cohort:"Class of 2028", stage:"Didactic", lessons:47, questions:610,  accuracy:74, streak:6,  lastActive:"2 days ago", risk:"ok"   }
  ],
  alerts: [
    { level:"high",  who:"Grace Nkemdirim", what:"No activity for 25 days", why:"Cardiology block exam is in 9 days and 3 of 14 lessons are done.", id:"s7" },
    { level:"high",  who:"Marcus Webb",     what:"Accuracy fell to 58%",    why:"Down 14 points over the last 200 questions. EOR in 12 days.",       id:"s4" },
    { level:"watch", who:"Sofia Alvarez",   what:"Assignment overdue",      why:"“Endocrine block — required reading” was due 3 days ago.",          id:"s5" }
  ],
  assignments: [
    { id:"a1", title:"Cardiology block — required conditions", due:"2026-09-18", cohort:"Class of 2028", items:14, done:19, total:31, source:"Built from syllabus PDF" },
    { id:"a2", title:"Endocrine block — required reading",     due:"2026-08-30", cohort:"Class of 2028", items:9,  done:24, total:31, source:"Chosen by hand" },
    { id:"a3", title:"EOR prep — Family Medicine",             due:"2026-10-02", cohort:"Class of 2027", items:22, done:5,  total:27, source:"Built from syllabus PDF" }
  ],
  rotations: ["Family Medicine","Internal Medicine","Emergency Medicine","Pediatrics","Psychiatry","Women's Health","General Surgery","Elective"]
};

const NAV = [
  { group:"Program" },
  { href:"dashboard.html", icon:"◱", label:"Dashboard" },
  { href:"roster.html",    icon:"☰", label:"Roster" },
  { href:"assignments.html", icon:"✎", label:"Lesson plans" },
  { group:"Account" },
  { href:"account.html",   icon:"⚙", label:"Account & billing" },
  { href:"legal.html",     icon:"§", label:"Legal & documents" }
];

function initials(name){
  return name.split(" ").filter(Boolean).slice(0,2).map(w => w[0]).join("").toUpperCase();
}

/** Paints the sidebar and top bar. Every page calls this once. */
function shell(active, title, sub){
  const side = document.querySelector(".side");
  if (side){
    side.innerHTML =
      '<div class="side-brand">Season One<small>' + DATA.institution.short + '</small></div>' +
      NAV.map(n => n.group
        ? '<div class="side-group">' + n.group + '</div>'
        : '<a href="' + n.href + '"' + (n.href === active ? ' class="on"' : '') + '>' +
          '<span class="ic">' + n.icon + '</span>' + n.label + '</a>'
      ).join("") +
      '<div class="side-foot">' + DATA.institution.seatsUsed + ' of ' + DATA.institution.seats +
      ' seats used<br><a href="index.html" style="color:rgba(255,255,255,.75)">Sign out</a></div>';
  }
  const top = document.querySelector(".top");
  if (top){
    top.innerHTML =
      '<div><h1>' + title + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' +
      '<div class="top-right"><div class="who"><span>' + DATA.institution.contact + '</span>' +
      '<span class="avatar">' + initials(DATA.institution.contact.replace("Dr. ","")) + '</span></div></div>';
  }
}

function riskPill(risk){
  if (risk === "high")  return '<span class="pill bad">At risk</span>';
  if (risk === "watch") return '<span class="pill warn">Watch</span>';
  return '<span class="pill ok">On track</span>';
}

function bar(pct){
  const cls = pct < 60 ? "bad" : pct < 75 ? "warn" : "";
  return '<div class="bar-row"><div class="bar"><i class="' + cls +
         '" style="width:' + Math.max(2, Math.min(100, pct)) + '%"></i></div><span>' + pct + '%</span></div>';
}

function studentRow(s){
  return '<tr>' +
    '<td><a class="who-cell" href="student.html?id=' + s.id + '">' +
      '<span class="avatar">' + initials(s.name) + '</span>' +
      '<span><b>' + s.name + '</b><small>' + s.cohort + ' · ' + s.stage + '</small></span></a></td>' +
    '<td class="num">' + s.lessons + '</td>' +
    '<td class="num">' + s.questions.toLocaleString() + '</td>' +
    '<td style="min-width:150px">' + bar(s.accuracy) + '</td>' +
    '<td class="num">' + s.streak + '</td>' +
    '<td>' + s.lastActive + '</td>' +
    '<td>' + riskPill(s.risk) + '</td>' +
  '</tr>';
}
