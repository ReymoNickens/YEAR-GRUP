import { writeFileSync } from "node:fs";
import { planCollection } from "../src/lib/hub/money.ts";

const q = (s) => (s === null || s === undefined ? "null" : `'${String(s).replaceAll("'", "''")}'`);
const jq = (o) => `${q(JSON.stringify(o))}::jsonb`;
const lines = [];
const emit = (s) => lines.push(s);

const ORG = "org_2007";
const houses = [
  { key: "balmer", name: "Balmer-Acquaah", dorms: [["upper", "Upper"], ["lower", "Lower"]] },
  { key: "freeman", name: "Freeman-Aggrey", dorms: [["upper", "Upper"], ["lower", "Lower"]] },
  { key: "lockhart", name: "Lockhart-Schweitzer", dorms: [["upper", "Upper"], ["lower", "Lower"]] },
  { key: "pickard", name: "Pickard-Parker", dorms: [["upper", "Upper"], ["lower", "Lower"]] },
  { key: "sarbah", name: "Sarbah-Picot", dorms: [["upper", "Upper"], ["lower", "Lower"]] },
  { key: "bartels", name: "Bartels-Sneath", dorms: [["upper", "Upper"], ["middle", "Middle"], ["lower", "Lower"], ["extension", "Extension"]] },
];
const programmes = [
  { key: "sci", name: "Science", classes: ["S1", "S2", "S3", "S4", "S5"] },
  { key: "vis", name: "Visual Arts", classes: ["V1", "V2", "V3"] },
  { key: "arts", name: "General Arts", classes: ["A1", "A2", "A3", "A4", "A5"] },
];

const people = [
  ["Kwame Mensah", "Killer", "balmer", "upper", 3, "sci", "s1", "Accra", "Civil engineer", 10, 12, "I still measure a room by eye before I trust the tape."],
  ["Yaw Boateng", "Professor", "balmer", "upper", 3, "sci", "s2", "Kumasi", "Lecturer", 3, 2, "I teach structures and I still quote our old physics master."],
  ["Kofi Asante", "Shatta", "balmer", "lower", 1, "sci", "s1", "Accra", "Events producer", 7, 19, "If the sound is wrong, the hall is wrong."],
  ["Kojo Owusu", "Lawyer", "balmer", "lower", 5, "arts", "a2", "Accra", "Barrister", 1, 8, "I argue for a living and I still lose to my cot."],
  ["Kwesi Appiah", "Doctor", "balmer", "upper", 7, "sci", "s3", "Tema", "Medical officer", 11, 4, "Night shifts, then the group chat."],
  ["Kobby Nunoo", "Radar", "balmer", "lower", 2, "sci", "s1", "Accra", "Telecoms engineer", 10, 28, "I keep the lines up."],
  ["Ebo Hanson", "Pilot", "balmer", "upper", null, "arts", "a1", "Takoradi", "Airline officer", 5, 16, "I boarded, but I cannot swear to the cot number."],
  ["Kwabena Darko", "Boss", "freeman", "upper", 2, "sci", "s4", "Accra", "Building contractor", 5, 21, "We pour on Saturdays. Call before Friday."],
  ["Fiifi Hammond", "Captain", "freeman", "upper", 2, "sci", "s1", "Cape Coast", "Marine officer", 10, 2, "Home is still the coast."],
  ["Ekow Quaye", "Engine", "freeman", "lower", 4, "sci", "s5", "Takoradi", "Mechanical engineer", 10, 9, "If it turns, I want to know why."],
  ["Paa Kwesi Arthur", "Banker", "freeman", "lower", 6, "arts", "a1", "Accra", "Banker", 2, 14, "I count cedis slowly and I sleep well."],
  ["Nana Yaw Osei", "Chief", "freeman", "upper", 8, "vis", "v1", "Accra", "Architect", 9, 30, "Light, shade, and a good verandah."],
  ["Kojo Baah", "Mixer", "freeman", "lower", 1, "arts", "a3", "Kumasi", "Radio producer", 8, 3, "I still edit on Sundays."],
  ["Papa Yaw Mensah", "Stones", "freeman", "upper", 5, "sci", "s2", "Accra", "Quarry manager", 4, 27, "Aggregate, delivered."],
  ["Kobina Mills", "Pastor", "lockhart", "upper", 1, "arts", "a3", "Kumasi", "Minister", 12, 25, "Chapel first, then the rest of the day."],
  ["Egya Atta", "Net", "lockhart", "lower", 2, "arts", "a4", "Elmina", "Fish exporter", 6, 11, "The boats go out before the messages start."],
  ["Kuuku Dadzie", "Press", "lockhart", "upper", 4, "arts", "a1", "Accra", "Journalist", 4, 18, "I write short and I keep my notes."],
  ["Paa Joe", "Chisel", "lockhart", "lower", 3, "vis", "v2", "Winneba", "Furniture maker", 8, 7, "Odum, if you can get it."],
  ["Kweku Annan", "Bench", "lockhart", "upper", 6, "arts", "a5", "Accra", "Magistrate", 10, 15, "I listen longer than I talk."],
  ["Fiifi Dawson", "Lines", "lockhart", "lower", 8, "sci", "s4", "Tema", "Grid engineer", 1, 29, "Outages annoy me personally."],
  ["Kwame Adu", "Pepper", "pickard", "upper", 1, "sci", "s1", "Accra", "Pharmacist", 10, 6, "Ask me before you mix anything."],
  ["Yaw Frimpong", "Coach", "pickard", "upper", 3, "arts", "a2", "Kumasi", "School coach", 7, 1, "Training is at five. No debate."],
  ["Kofi Mensima", "Gold", "pickard", "lower", 2, "sci", "s3", "Obuasi", "Mining engineer", 3, 22, "I come up for air on weekends."],
  ["Kojo Sekyi", "Silk", "pickard", "lower", 4, "vis", "v3", "Accra", "Textile trader", 11, 11, "Second shop opens next month."],
  ["Ekow Bennett", "Books", "pickard", "upper", 6, "arts", "a4", "Accra", "Publisher", 2, 2, "I still read the old school magazine."],
  ["Nana Kojo", "Harbour", "pickard", "lower", 7, "sci", "s5", "Tema", "Port supervisor", 9, 9, "The tide does not take excuses."],
  ["Panyin Moore", "Twin", "pickard", "upper", 5, "sci", "s2", "Accra", "Data analyst", 6, 6, "My brother did not come to our school. I remind him."],
  ["Kwesi Blankson", "Sugar", "sarbah", "upper", 2, "arts", "a1", "Accra", "Hotelier", 10, 20, "If you need rooms in Osu, say so early."],
  ["Ato Hammond", "Wave", "sarbah", "lower", 3, "sci", "s1", "Cape Coast", "Fish processor", 5, 5, "Ice, always ice."],
  ["Kojo Van-Lare", "Brush", "sarbah", "upper", 1, "vis", "v1", "Accra", "Painter", 8, 18, "Commissions open for house colours, done properly."],
  ["Yaw Sarpong", "Choir", "sarbah", "lower", 5, "arts", "a5", "Kumasi", "Music teacher", 12, 3, "Bring the hymn, not the speaker."],
  ["Kobby Eyiah", "Drill", "sarbah", "upper", 8, "sci", "s4", "Tarkwa", "Driller", 4, 4, "I am underground more than I like."],
  ["Paa Nii", "Lights", "sarbah", "lower", 6, "sci", "s2", "Accra", "Electrician", 7, 23, "I will not wire a house over WhatsApp."],
  ["Kwabena Safo", "Iron", "bartels", "upper", 1, "sci", "s3", "Tema", "Steel trader", 1, 17, "Rods, sheets, and a fair price."],
  ["Fiifi Buckman", "Middle", "bartels", "middle", 4, "arts", "a2", "Accra", "Insurance broker", 10, 1, "Read the exclusion list. I mean it."],
  ["Ekow Dadson", "Ext", "bartels", "extension", 2, "sci", "s5", "Accra", "Software lead", 3, 14, "We shipped a small payments tool this year."],
  ["Nana Quayson", "Lower", "bartels", "lower", 7, "arts", "a3", "Winneba", "Lecturer", 9, 2, "General paper, still."],
  ["Kojo Impraim", "Keeper", "bartels", "upper", 3, "vis", "v2", "Accra", "Goalkeeper coach", 6, 28, "Hands, then feet. In that order."],
  ["Yaw Ottu", "Market", "bartels", "middle", 1, "arts", "a4", "Kumasi", "Commodities trader", 11, 30, "Maize and nerves of iron."],
  ["Kofi Lamptey", "Day", null, null, null, "sci", "s2", "Accra", "Dentist", 10, 7, "I was a day student. I still claim the year."],
];

const mid = (i) => `mem_${String(i + 1).padStart(2, "0")}`;
const gifts = [
  [0, 100000, false, true],
  [1, 50000, false, false],
  [2, 20000, true, false],
  [3, 75000, false, false],
  [4, 30000, false, false],
  [7, 200000, false, false],
  [8, 50000, false, true],
  [9, 40000, false, false],
  [10, 150000, false, false],
  [11, 25000, true, false],
  [14, 60000, false, false],
  [15, 15000, false, false],
  [16, 80000, false, false],
  [17, 20000, false, false],
  [20, 100000, false, false],
  [21, 45000, false, true],
  [22, 300000, true, false],
  [23, 35000, false, false],
  [24, 70000, false, false],
  [25, 55000, false, false],
  [27, 90000, false, false],
  [28, 20000, false, false],
  [29, 40000, false, false],
  [30, 15000, false, false],
  [31, 120000, false, false],
  [33, 25000, false, false],
  [34, 40000, false, false],
  [35, 60000, false, false],
];

emit(`-- Fictional sample cohort for an empty school. Not real old boys.`);
emit(`insert into organisation (id, slug, name, type, terminology, branding, verification_rule, min_givers, enabled_modules, payment_mode, gateway_fee_bps, platform_fee_bps, reverse_platform_fee_on_refund, expense_two_approver_pesewas, listed) values (
  ${q(ORG)}, 'mfantsipim-2007', 'Mfantsipim 2007', 'school_year',
  ${jq({ member: "old boy", members: "old boys", house: "House", dorm: "Dorm", cot: "Cot", programme: "Programme", class: "Class", year: "Year group" })},
  ${jq({ motto: "Dwin Hwe Kan", crest: "/orgs/mfantsipim-2007/crest.png", shortName: "Mfantsipim 2007", place: "Cape Coast", founded: "1876", cohort: "2007", paper: "#F3EEE6", ink: "#1C1412", crimson: "#7A1C2E", gold: "#6F5424" })},
  'two_cot_peers_or_executive', 5,
  ${jq(["people", "structure", "circles", "money", "events", "directory", "governance", "welfare", "store", "impact", "photos", "asks", "polls", "trivia", "mentoring", "capsules", "elections"])},
  'test', 195, 100, false, 200000, true
);`);

emit(`insert into structure_dimension (id, organisation_id, key, name, sort) values
  ('dim_res', ${q(ORG)}, 'residence', 'Residence', 1),
  ('dim_acad', ${q(ORG)}, 'academic', 'Academic', 2);`);

let nodeSort = 0;
for (const house of houses) {
  const hid = `h_${house.key}`;
  emit(`insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values (${q(hid)}, ${q(ORG)}, 'dim_res', null, 'house', ${q(house.name)}, null, ${q(house.key)}, ${++nodeSort});`);
  house.dorms.forEach(([key, name], di) => {
    const did = `d_${house.key}_${key}`;
    emit(`insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values (${q(did)}, ${q(ORG)}, 'dim_res', ${q(hid)}, 'dorm', ${q(name)}, 8, ${q(`${house.key}.${key}`)}, ${di + 1});`);
    for (let c = 1; c <= 8; c++) {
      const cid = `c_${house.key}_${key}_${c}`;
      emit(`insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values (${q(cid)}, ${q(ORG)}, 'dim_res', ${q(did)}, 'cot', ${q(`Cot ${c}`)}, null, ${q(`${house.key}.${key}.${c}`)}, ${c});`);
    }
  });
}
for (const prog of programmes) {
  const pid = `p_${prog.key}`;
  emit(`insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values (${q(pid)}, ${q(ORG)}, 'dim_acad', null, 'programme', ${q(prog.name)}, null, ${q(prog.key)}, ${++nodeSort});`);
  prog.classes.forEach((label, i) => {
    const key = label.toLowerCase();
    emit(`insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values (${q(`cl_${prog.key}_${key}`)}, ${q(ORG)}, 'dim_acad', ${q(pid)}, 'class', ${q(label)}, null, ${q(`${prog.key}.${key}`)}, ${i + 1});`);
  });
}

emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values
  ('cir_year', ${q(ORG)}, 'derived', 'open', null, 'Class of 2007', 'The whole year group.', 'year');`);
for (const prog of programmes) {
  emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values (${q(`cir_p_${prog.key}`)}, ${q(ORG)}, 'derived', 'open', ${q(`p_${prog.key}`)}, ${q(prog.name)}, ${q(`${prog.name} programme.`)}, ${q(`prog-${prog.key}`)});`);
  prog.classes.forEach((label) => {
    const key = label.toLowerCase();
    emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values (${q(`cir_cl_${prog.key}_${key}`)}, ${q(ORG)}, 'derived', 'open', ${q(`cl_${prog.key}_${key}`)}, ${q(`${prog.name} ${label}`)}, ${q(`Class ${label}.`)}, ${q(`class-${prog.key}-${key}`)});`);
  });
}
for (const house of houses) {
  emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values (${q(`cir_h_${house.key}`)}, ${q(ORG)}, 'derived', 'open', ${q(`h_${house.key}`)}, ${q(house.name)}, ${q(`${house.name} house.`)}, ${q(`house-${house.key}`)});`);
  for (const [key, name] of house.dorms) {
    emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values (${q(`cir_d_${house.key}_${key}`)}, ${q(ORG)}, 'derived', 'open', ${q(`d_${house.key}_${key}`)}, ${q(`${name} ${house.name}`)}, ${q(`${name} dorm.`)}, ${q(`dorm-${house.key}-${key}`)});`);
  }
}
emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values
  ('cir_accra', ${q(ORG)}, 'voluntary', 'listed', null, 'Accra', 'Old boys who live or work in Accra.', 'accra'),
  ('cir_bankers', ${q(ORG)}, 'voluntary', 'listed', null, 'Bankers', 'Finance, banking and insurance.', 'bankers'),
  ('cir_builders', ${q(ORG)}, 'voluntary', 'listed', null, 'Builders', 'Sites, design and the trades.', 'builders'),
  ('cir_football', ${q(ORG)}, 'voluntary', 'listed', null, 'Saturday football', 'A game, not a committee.', 'football'),
  ('cir_methodist', ${q(ORG)}, 'voluntary', 'hidden', null, 'Methodist fellowship', 'A hidden faith circle. Only members can see it.', 'methodist');`);

const cotSeen = new Set();
for (const p of people) {
  const [, , house, dorm, cot] = p;
  if (!house || !dorm || !cot) continue;
  const id = `cir_c_${house}_${dorm}_${cot}`;
  if (cotSeen.has(id)) continue;
  cotSeen.add(id);
  const houseName = houses.find((h) => h.key === house).name;
  const dormName = houses.find((h) => h.key === house).dorms.find((d) => d[0] === dorm)[1];
  emit(`insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values (${q(id)}, ${q(ORG)}, 'derived', 'open', ${q(`c_${house}_${dorm}_${cot}`)}, ${q(`Cot ${cot}, ${dormName} ${houseName}`)}, 'Opened because a cot mate is here.', ${q(`cot-${house}-${dorm}-${cot}`)});`);
}

people.forEach((p, i) => {
  const [name, nick, house, dorm, cot, prog, cls, city, job, month, day, bio] = p;
  const houseId = house ? `h_${house}` : null;
  const dormId = house && dorm ? `d_${house}_${dorm}` : null;
  const cotId = house && dorm && cot ? `c_${house}_${dorm}_${cot}` : null;
  const escape = house ? null : "day";
  emit(`insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    ${q(mid(i))}, ${q(ORG)}, null, true, 'verified', ${q(name)}, ${q(nick)}, ${q(`+23320000${String(1000 + i).slice(-4)}`)}, ${q(city)}, ${q(job)}, ${q(bio)},
    ${q(houseId)}, ${q(dormId)}, ${q(cotId)}, ${q(`p_${prog}`)}, ${q(`cl_${prog}_${cls}`)}, ${q(escape)}, ${month}, ${day}, ${i === 14 ? "true" : "false"}
  );`);
});

function addMember(circleId, i, source) {
  emit(`insert into circle_member (organisation_id, circle_id, membership_id, source) values (${q(ORG)}, ${q(circleId)}, ${q(mid(i))}, ${q(source)});`);
}
people.forEach((p, i) => {
  const [, , house, dorm, cot, prog, cls, city, job] = p;
  addMember("cir_year", i, "derived");
  addMember(`cir_p_${prog}`, i, "derived");
  addMember(`cir_cl_${prog}_${cls}`, i, "derived");
  if (house) addMember(`cir_h_${house}`, i, "derived");
  if (house && dorm) addMember(`cir_d_${house}_${dorm}`, i, "derived");
  if (house && dorm && cot) addMember(`cir_c_${house}_${dorm}_${cot}`, i, "derived");
  if (city === "Accra") addMember("cir_accra", i, "joined");
  if (/bank|insurance/i.test(job)) addMember("cir_bankers", i, "joined");
  if (/contract|architect|civil|furniture|steel|electric/i.test(job)) addMember("cir_builders", i, "joined");
  if ([21, 37, 8].includes(i)) addMember("cir_football", i, "joined");
  if ([14, 30, 4].includes(i)) addMember("cir_methodist", i, "joined");
});

const roles = [
  ["role_capt_balmer", 0, "house_captain", "node", "h_balmer", "balmer"],
  ["role_cot_balmer", 0, "cot_leader", "node", "c_balmer_upper_3", "balmer.upper.3"],
  ["role_capt_freeman", 8, "house_captain", "node", "h_freeman", "freeman"],
  ["role_treasurer", 10, "treasurer", "organisation", null, null],
  ["role_secretary", 16, "secretary", "organisation", null, null],
  ["role_exec", 18, "executive", "organisation", null, null],
  ["role_class_s1", 20, "class_representative", "node", "cl_sci_s1", "sci.s1"],
];
for (const [id, i, role, scope, scopeId, path] of roles) {
  emit(`insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values (${q(id)}, ${q(ORG)}, ${q(mid(i))}, ${q(role)}, ${q(scope)}, ${q(scopeId)}, ${q(path)});`);
}

emit(`insert into purpose (id, organisation_id, type, title, story, target_pesewas, status, hero) values
  ('pur_library', ${q(ORG)}, 'campaign', 'The 2007 library', 'A quiet room and new shelves for the school library at Kwabotwe. House and class totals are shown. Names of givers are not.', 15000000, 'open', true),
  ('pur_dues', ${q(ORG)}, 'dues', 'Year group dues', 'The small amount that keeps the year group able to meet, write and show up.', 5000000, 'open', false),
  ('pur_dinner', ${q(ORG)}, 'event', 'Founders dinner ticket', '5 December, Accra. One ticket, one seat.', 0, 'open', false),
  ('pur_store', ${q(ORG)}, 'other', 'Year group store', 'Jerseys, hoodies and the tie.', 0, 'open', false);`);

emit(`insert into pledge (id, organisation_id, purpose_id, membership_id, total_pesewas, anonymous, status) values
  ('pl_boss', ${q(ORG)}, 'pur_library', ${q(mid(7))}, 300000, false, 'open');`);
emit(`insert into instalment (id, organisation_id, pledge_id, due_on, amount_pesewas, paid_pesewas, seq) values
  ('in_boss_1', ${q(ORG)}, 'pl_boss', '2026-10-20', 100000, 0, 1),
  ('in_boss_2', ${q(ORG)}, 'pl_boss', '2026-11-20', 100000, 0, 2),
  ('in_boss_3', ${q(ORG)}, 'pl_boss', '2026-12-20', 100000, 0, 3);`);

gifts.forEach(([index, gift, anon, cover], n) => {
  const plan = planCollection({ gift, gatewayBps: 195, platformBps: 100, coverFees: cover });
  const intent = `pi_${String(n + 1).padStart(2, "0")}`;
  const ref = `seed_${intent}`;
  emit(`insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    ${q(intent)}, ${q(ORG)}, 'pur_library', ${q(mid(index))}, null, ${plan.gift}, ${plan.charge}, ${plan.gatewayFee}, ${plan.platformFee}, ${cover}, ${anon}, 'succeeded', ${q(ref)}, now() - interval '${30 - n} days'
  );`);
  emit(`insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values (${q(`ge_${intent}`)}, ${q(ORG)}, ${q(intent)}, 'test', ${q(ref)}, ${jq({ provider: "test", reference: ref, gift })});`);
  plan.lines.forEach((line, li) => {
    emit(`insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      ${q(`le_${intent}_${li}`)}, ${q(ORG)}, ${q(`${intent}:${line.txn}`)}, ${q(line.account)}, ${q(line.direction)}, ${line.amount}, 'pur_library', ${q(mid(index))}, ${q(intent)}, ${q(`Test gateway ${line.txn}`)}
    );`);
  });
  emit(`insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    ${q(`rc_${intent}`)}, ${q(ORG)}, ${q(`MF2007-${String(n + 1).padStart(4, "0")}`)}, ${q(intent)}, 'The 2007 library', ${plan.charge}, '2026-09-01', false
  );`);
});

const posts = [
  ["cir_h_balmer", 0, "Upper Balmer, Saturday at Labadi. Bring the old house jersey if you still have it.", 2],
  ["cir_h_freeman", 8, "Freeman, the one-week plan is on the board. Cape Coast, not a hotel lobby.", 1],
  ["cir_year", 16, "The dinner is 5 December in Accra. Ticket is in Give. Come as you are, nickname and all.", 3],
  ["cir_h_pickard", 21, "Training game Sunday 6am, El-Wak outer field. No speech, just boots.", 4],
  ["cir_c_balmer_upper_3", 1, "Cot 3, I kept the list. Two of us are still missing from the roll.", 5],
  ["cir_h_sarbah", 27, "If you are passing through Osu this month, the hotel can hold a small table.", 6],
  ["cir_builders", 7, "I need a site engineer for three weeks in East Legon. Old boy first.", 2],
  ["cir_year", 11, "The library shelves are the point. Give quietly if you prefer. The house still gets the credit.", 7],
];
posts.forEach(([circle, i, body, days], n) => {
  emit(`insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values (${q(`post_${n + 1}`)}, ${q(ORG)}, ${q(circle)}, ${q(mid(i))}, ${q(body)}, now() - interval '${days} days');`);
});

emit(`insert into hub_event (id, organisation_id, circle_id, title, place, starts_at, story, price_pesewas, purpose_id, capacity) values
  ('ev_cot', ${q(ORG)}, 'cir_c_balmer_upper_3', 'Cot 3 reunion', 'Labadi, Accra', '2026-11-14 15:00+00', 'A Saturday for Cot 3, Upper Balmer-Acquaah. No agenda past the first hour.', null, null, 24),
  ('ev_dinner', ${q(ORG)}, 'cir_year', 'Founders dinner', 'Accra', '2026-12-05 18:00+00', 'One sitting for the year group. Pay for a ticket, then your seat is kept.', 25000, 'pur_dinner', 120),
  ('ev_freeman', ${q(ORG)}, 'cir_h_freeman', 'Freeman planning afternoon', 'Cape Coast', '2026-10-25 13:00+00', 'The house meets on the hill, not in a group chat.', null, null, 40),
  ('ev_walk', ${q(ORG)}, 'cir_h_pickard', 'Pickard walk', 'Aburi', '2026-11-02 07:00+00', 'A slow walk. Bring water.', null, null, 30);`);

[[0, "ev_cot", "going"], [1, "ev_cot", "going"], [8, "ev_freeman", "going"], [21, "ev_walk", "maybe"], [16, "ev_dinner", "going"]].forEach(([i, ev, status]) => {
  emit(`insert into rsvp (event_id, membership_id, status) values (${q(ev)}, ${q(mid(i))}, ${q(status)});`);
});

const businesses = [
  [7, "Darko Sites", "Building", "Accra", "+233200000007", "Residential blocks. Old boys get a straight estimate."],
  [11, "Osei Verandah", "Architecture", "Accra", "+233200000011", "Houses that breathe. Small commissions welcome."],
  [23, "Silk & Stitch", "Textile", "Accra", "+233200000023", "Cloth, school colours done properly, no plastic crests."],
  [20, "Pepper Pharmacy", "Health", "Accra", "+233200000020", "A neighbourhood pharmacy. Ask for Kwame."],
  [27, "Sugar Rooms", "Hospitality", "Accra", "+233200000027", "Short stays in Osu when the dinner comes around."],
  [17, "Chisel Workshop", "Furniture", "Winneba", "+233200000017", "Tables and doors in odum."],
  [0, "Mensah Measure", "Engineering", "Accra", "+233200000000", "Civil works and careful quantities."],
  [35, "Ext Software", "Technology", "Accra", "+233200000035", "Small tools for Ghanaian businesses."],
];
businesses.forEach(([i, name, cat, city, contact, blurb], n) => {
  emit(`insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values (${q(`biz_${n + 1}`)}, ${q(ORG)}, ${q(mid(i))}, ${q(name)}, ${q(cat)}, ${q(city)}, ${q(contact)}, ${q(blurb)});`);
});
[[1, 2], [1, 8], [2, 0], [3, 11], [5, 7], [8, 16]].forEach(([b, i]) => {
  emit(`insert into business_support (business_id, membership_id) values (${q(`biz_${b}`)}, ${q(mid(i))});`);
});

const asks = [
  [7, "supplier", "Who supplies good dumas in Accra?", "I need a steady supplier for a site canteen. Someone we know.", "cir_builders"],
  [0, "employment", "Site engineer for three weeks", "East Legon. Old boy if we can. Experience with concrete, not a title.", "cir_builders"],
  [20, "mentoring", "A pharmacist to talk to a cousin", "He is choosing courses. Not a job. Twenty minutes.", "cir_year"],
  [28, "housing", "A clean room for three months", "East Legon or Adjiringanor. He is a cousin, not a crowd.", "cir_accra"],
];
asks.forEach(([i, cat, title, body, circle], n) => {
  emit(`insert into ask (id, organisation_id, membership_id, category, title, body, circle_id, created_at) values (${q(`ask_${n + 1}`)}, ${q(ORG)}, ${q(mid(i))}, ${q(cat)}, ${q(title)}, ${q(body)}, ${q(circle)}, now() - interval '${n + 1} days');`);
});
emit(`insert into ask_reply (id, ask_id, membership_id, body, recommended) values
  ('ar_1', 'ask_1', ${q(mid(13))}, 'Stones can point you to the woman at Madina market. Tell her Freeman sent you.', true),
  ('ar_2', 'ask_2', ${q(mid(9))}, 'I can do two of the three weeks. Engine, Freeman.', false);`);

const albums = [
  ["House one-week", 2006, "The week the houses took the hill.", "field"],
  ["Cape Coast Saturday", 2005, "Town, then back before prep.", "cape"],
  ["The bench", 2006, "NSMQ season. We watched more than we played.", "class"],
  ["Dining hall", 2004, "The queue, the bell, the same stew.", "dorm"],
  ["Founders day", 2007, "The last founders day we attended as boys.", "chapel"],
  ["House jerseys", 2007, "Six houses, one hill.", "jersey"],
];
albums.forEach(([title, year, caption, motif], n) => {
  emit(`insert into album (id, organisation_id, title, year, caption, motif) values (${q(`alb_${n + 1}`)}, ${q(ORG)}, ${q(title)}, ${year}, ${q(caption)}, ${q(motif)});`);
  emit(`insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values (${q(`ph_${n + 1}`)}, ${q(ORG)}, ${q(`alb_${n + 1}`)}, ${q(caption)}, ${q(motif)}, ${q(mid(n))});`);
});
emit(`insert into photo_tag (photo_id, membership_id) values ('ph_1', ${q(mid(0))}), ('ph_6', ${q(mid(8))});`);

emit(`insert into poll (id, organisation_id, circle_id, question, closes_on) values
  ('poll_city', ${q(ORG)}, 'cir_year', 'Where should the 2027 reunion sit?', '2026-11-30');`);
["Accra", "Cape Coast", "Kumasi"].forEach((label, i) => {
  emit(`insert into poll_option (id, poll_id, label, sort) values (${q(`po_${i + 1}`)}, 'poll_city', ${q(label)}, ${i + 1});`);
});
const votes = [0, 1, 2, 3, 7, 8, 10, 16, 20, 21, 27, 11, 35, 4, 18, 24, 28];
const optionFor = [1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 2, 1, 3, 2, 1, 3, 2];
votes.forEach((i, n) => {
  emit(`insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', ${q(`po_${optionFor[n]}`)}, ${q(mid(i))});`);
});

emit(`insert into announcement (id, organisation_id, author_membership_id, audience, body) values
  ('an_1', ${q(ORG)}, ${q(mid(16))}, 'Class of 2007', 'Register so your house is not empty on the roll. The founders dinner is 5 December in Accra.');`);

emit(`insert into outbox (id, organisation_id, membership_id, template_key, payload, idempotency_key, status, channel, attempts, last_error) values
  ('ob_1', ${q(ORG)}, ${q(mid(16))}, 'announcement', ${jq({ title: "Dinner" })}, 'seed-ob-1', 'delivered', 'in_app', 1, null),
  ('ob_2', ${q(ORG)}, ${q(mid(0))}, 'receipt', ${jq({ number: "MF2007-0001" })}, 'seed-ob-2', 'held_no_provider', 'sms', 0, 'SMS provider is not connected');`);

emit(`insert into welfare_request (id, organisation_id, membership_id, category, body, status) values
  ('wf_1', ${q(ORG)}, ${q(mid(15))}, 'medical', 'A medical bill in the family. I have sent the papers to the secretary. Please keep this off the board.', 'open');`);

emit(`insert into mentor_offer (id, organisation_id, membership_id, field, kind, note) values
  ('mn_1', ${q(ORG)}, ${q(mid(0))}, 'Civil engineering', 'offer', 'I can take one younger cousin through a site visit.'),
  ('mn_2', ${q(ORG)}, ${q(mid(20))}, 'Pharmacy', 'offer', 'Course choice, not a job placement.'),
  ('mn_3', ${q(ORG)}, ${q(mid(35))}, 'Software', 'seek', 'Looking for a product person who has shipped in Ghana.');`);

emit(`insert into election (id, organisation_id, role_name, blurb, status, closes_on) values
  ('el_1', ${q(ORG)}, 'Assistant secretary', 'A two-year seat beside the secretary. Nominations are open. The ballot is secret.', 'open', '2026-12-20');`);
emit(`insert into nomination (id, election_id, membership_id, statement) values
  ('nom_1', 'el_1', ${q(mid(12))}, 'I will keep the minutes short and the dates honest.'),
  ('nom_2', 'el_1', ${q(mid(24))}, 'I already chase RSVPs. I may as well be asked.');`);
[0, 1, 8, 21, 27].forEach((i, n) => {
  emit(`insert into ballot (election_id, voter_membership_id, nomination_id) values ('el_1', ${q(mid(i))}, ${q(n % 2 ? "nom_2" : "nom_1")});`);
});

emit(`insert into product (id, organisation_id, name, blurb, price_pesewas, stock, motif) values
  ('prd_jersey', ${q(ORG)}, 'Year jersey', 'Crimson, with 2007 on the chest. Not a replica of a match kit.', 18000, 80, 'jersey'),
  ('prd_hoodie', ${q(ORG)}, 'Hoodie', 'Heavy enough for Accra rain. Quiet mark, no slogan.', 24000, 40, 'hoodie'),
  ('prd_tie', ${q(ORG)}, 'Crest tie', 'For the dinner. A year-group mark, not the school arms.', 8000, 60, 'tie');`);

const trivia = [
  ["Mfantsipim stands in which town?", ["Cape Coast", "Kumasi", "Accra", "Takoradi"], 0],
  ["Which year was the school founded?", ["1876", "1901", "1927", "1854"], 0],
  ["Dwin Hwe Kan means?", ["Think and look ahead", "Forward ever", "Knowledge is power", "Unity is strength"], 0],
  ["Old boys call it?", ["The School", "The College", "The Yard", "The Academy"], 0],
  ["It is remembered as the first secondary school in?", ["Ghana", "Nigeria", "Sierra Leone", "Liberia"], 0],
];
trivia.forEach(([prompt, choices, answer], i) => {
  emit(`insert into trivia_question (id, organisation_id, prompt, choices, answer_index, sort) values (${q(`tq_${i + 1}`)}, ${q(ORG)}, ${q(prompt)}, ${jq(choices)}, ${answer}, ${i + 1});`);
});
[[0, 1, 0], [8, 1, 0], [8, 2, 0], [21, 1, 1], [14, 3, 0], [27, 4, 0], [7, 1, 0]].forEach(([i, qn, choice], n) => {
  const correct = choice === 0;
  emit(`insert into trivia_answer (question_id, membership_id, choice, correct) values (${q(`tq_${qn}`)}, ${q(mid(i))}, ${choice}, ${correct});`);
});

emit(`insert into capsule (id, organisation_id, membership_id, circle_id, title, body, seals_until) values
  ('cap_1', ${q(ORG)}, ${q(mid(1))}, 'cir_year', 'For the 25-year reunion', 'If you are reading this in 2032, check the library shelves before you check the photos. We said we would finish them.', '2032-04-08'),
  ('cap_2', ${q(ORG)}, ${q(mid(11))}, 'cir_h_freeman', 'A note from 2017', 'Freeman, do not let the house become a WhatsApp group only. Meet once a year on the hill.', '2026-01-01');`);

emit(`insert into milestone (id, organisation_id, membership_id, kind, body) values
  ('ms_1', ${q(ORG)}, ${q(mid(35))}, 'work', 'Ext Software took its first paying client outside the family.'),
  ('ms_2', ${q(ORG)}, ${q(mid(23))}, 'business', 'Silk and Stitch opened a second shop.'),
  ('ms_3', ${q(ORG)}, ${q(mid(7))}, 'work', 'Darko Sites handed over a small block in East Legon.');`);

emit(`insert into spotlight (id, organisation_id, membership_id, story, consented, published) values
  ('sp_1', ${q(ORG)}, ${q(mid(11))}, 'Nana Yaw Osei, Chief, draws houses that keep their verandahs. He agreed to be featured. The secretary wrote this, he did not.', true, true);`);

emit(`insert into expense (id, organisation_id, requester_membership_id, amount_pesewas, memo, status) values
  ('ex_1', ${q(ORG)}, ${q(mid(7))}, 45000, 'Printing the reunion cards', 'submitted'),
  ('ex_2', ${q(ORG)}, ${q(mid(16))}, 350000, 'Bus to Cape Coast for the house afternoon', 'submitted');`);

emit(`insert into refund (id, organisation_id, intent_id, amount_pesewas, reason, status, requester_membership_id) values
  ('rf_1', ${q(ORG)}, 'pi_04', 10000, 'Kojo asked to reduce his gift after a duplicate transfer.', 'awaiting_approval', ${q(mid(10))});`);

const imports = [
  ["imported", "Kweku Boateng", "Row kept exactly as uploaded."],
  ["normalised", "Yaw Acquaah", "House name matched Balmer-Acquaah from an alias."],
  ["suspected_duplicate", "Kwame Mensah", "Close to a verified Kwame Mensah. Needs a human decision."],
  ["needs_review", "Ato Blank", "Class cell was empty."],
  ["approved", "Fiifi Cole", "Accepted. No claim link sent yet."],
  ["invited", "Paa Kwesi Dodoo", "Claim link is waiting. SMS is not connected, so it sits in the outbox."],
];
imports.forEach(([status, name, note], i) => {
  emit(`insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values (${q(`imp_${i + 1}`)}, ${q(ORG)}, ${jq({ name, status })}, ${q(name)}, ${q(`+23324000${100 + i}`)}, ${q(status)}, ${q(note)});`);
});

emit(`insert into audit_log (id, organisation_id, actor_membership_id, action, detail) values
  ('au_1', ${q(ORG)}, ${q(mid(16))}, 'import_approved', 'Fiifi Cole accepted from the cohort sheet.'),
  ('au_2', ${q(ORG)}, ${q(mid(18))}, 'role_assigned', 'Sample officers seated for the preview. They are not real accounts.');`);

emit(`insert into usage_event (id, organisation_id, membership_id, stage, name, detail) values
  ('us_1', ${q(ORG)}, null, 'acquisition', 'registration_completed', 'sample baseline'),
  ('us_2', ${q(ORG)}, ${q(mid(0))}, 'money', 'payment_completed', 'library'),
  ('us_3', ${q(ORG)}, ${q(mid(8))}, 'community', 'first_post', 'freeman');`);

emit(`insert into report (id, organisation_id, post_id, membership_id, reason, status) values
  ('rp_1', ${q(ORG)}, 'post_4', ${q(mid(24))}, 'This is a time and a place, not a complaint. Left here so the queue is not empty.', 'open');`);

writeFileSync(new URL("../migrations/0003_seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`wrote ${lines.length} statements`);
