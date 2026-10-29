-- Sample only: the preview's officers, named as the executives asked.
-- Amable (President), Charles Armah (Financial Secretary), Stephen Tawiah (Organiser).
-- Their invented nicknames, work and lines are cleared: these are real people.
update membership set display_name = 'Amable', nickname = null, profession = null, bio = null where id = 'mem_19' and organisation_id = 'org_2007';
update membership set display_name = 'Charles Armah', nickname = null, profession = null, bio = null where id = 'mem_11' and organisation_id = 'org_2007';
update membership set display_name = 'Stephen Tawiah', nickname = null, profession = null, bio = null where id = 'mem_17' and organisation_id = 'org_2007';
update role_assignment set title = 'President' where id = 'role_exec' and organisation_id = 'org_2007';
update role_assignment set title = 'Financial Secretary' where id = 'role_treasurer' and organisation_id = 'org_2007';
update role_assignment set role = 'organiser', title = 'Organiser' where id = 'role_secretary' and organisation_id = 'org_2007';
