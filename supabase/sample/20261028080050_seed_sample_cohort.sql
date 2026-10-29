-- Fictional sample cohort for an empty school. Not real old boys.
insert into organisation (id, slug, name, type, terminology, branding, verification_rule, min_givers, enabled_modules, payment_mode, gateway_fee_bps, platform_fee_bps, reverse_platform_fee_on_refund, expense_two_approver_pesewas, listed) values (
  'org_2007', 'mfantsipim-2007', 'Mfantsipim 2007', 'school_year',
  '{"member":"old boy","members":"old boys","house":"House","dorm":"Dorm","cot":"Cot","programme":"Programme","class":"Class","year":"Year group"}'::jsonb,
  '{"motto":"Dwin Hwe Kan","crest":"/orgs/mfantsipim-2007/crest.png","shortName":"Mfantsipim 2007","place":"Cape Coast","founded":"1876","paper":"#F3EEE6","ink":"#1C1412","crimson":"#7A1C2E","gold":"#6F5424"}'::jsonb,
  'two_cot_peers_or_executive', 5,
  '["people","structure","circles","money","events","directory","governance","welfare","store","impact","photos","asks","polls","trivia","mentoring","capsules","elections"]'::jsonb,
  'test', 195, 100, false, 200000, true
);
insert into structure_dimension (id, organisation_id, key, name, sort) values
  ('dim_res', 'org_2007', 'residence', 'Residence', 1),
  ('dim_acad', 'org_2007', 'academic', 'Academic', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('h_balmer', 'org_2007', 'dim_res', null, 'house', 'Balmer-Acquaah', null, 'balmer', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_balmer_upper', 'org_2007', 'dim_res', 'h_balmer', 'dorm', 'Upper', 8, 'balmer.upper', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_1', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 1', null, 'balmer.upper.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_2', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 2', null, 'balmer.upper.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_3', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 3', null, 'balmer.upper.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_4', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 4', null, 'balmer.upper.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_5', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 5', null, 'balmer.upper.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_6', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 6', null, 'balmer.upper.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_7', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 7', null, 'balmer.upper.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_upper_8', 'org_2007', 'dim_res', 'd_balmer_upper', 'cot', 'Cot 8', null, 'balmer.upper.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_balmer_lower', 'org_2007', 'dim_res', 'h_balmer', 'dorm', 'Lower', 8, 'balmer.lower', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_1', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 1', null, 'balmer.lower.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_2', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 2', null, 'balmer.lower.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_3', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 3', null, 'balmer.lower.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_4', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 4', null, 'balmer.lower.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_5', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 5', null, 'balmer.lower.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_6', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 6', null, 'balmer.lower.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_7', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 7', null, 'balmer.lower.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_balmer_lower_8', 'org_2007', 'dim_res', 'd_balmer_lower', 'cot', 'Cot 8', null, 'balmer.lower.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('h_freeman', 'org_2007', 'dim_res', null, 'house', 'Freeman-Aggrey', null, 'freeman', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_freeman_upper', 'org_2007', 'dim_res', 'h_freeman', 'dorm', 'Upper', 8, 'freeman.upper', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_1', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 1', null, 'freeman.upper.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_2', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 2', null, 'freeman.upper.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_3', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 3', null, 'freeman.upper.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_4', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 4', null, 'freeman.upper.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_5', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 5', null, 'freeman.upper.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_6', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 6', null, 'freeman.upper.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_7', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 7', null, 'freeman.upper.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_upper_8', 'org_2007', 'dim_res', 'd_freeman_upper', 'cot', 'Cot 8', null, 'freeman.upper.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_freeman_lower', 'org_2007', 'dim_res', 'h_freeman', 'dorm', 'Lower', 8, 'freeman.lower', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_1', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 1', null, 'freeman.lower.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_2', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 2', null, 'freeman.lower.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_3', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 3', null, 'freeman.lower.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_4', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 4', null, 'freeman.lower.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_5', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 5', null, 'freeman.lower.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_6', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 6', null, 'freeman.lower.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_7', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 7', null, 'freeman.lower.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_freeman_lower_8', 'org_2007', 'dim_res', 'd_freeman_lower', 'cot', 'Cot 8', null, 'freeman.lower.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('h_lockhart', 'org_2007', 'dim_res', null, 'house', 'Lockhart-Schweitzer', null, 'lockhart', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_lockhart_upper', 'org_2007', 'dim_res', 'h_lockhart', 'dorm', 'Upper', 8, 'lockhart.upper', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_1', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 1', null, 'lockhart.upper.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_2', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 2', null, 'lockhart.upper.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_3', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 3', null, 'lockhart.upper.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_4', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 4', null, 'lockhart.upper.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_5', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 5', null, 'lockhart.upper.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_6', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 6', null, 'lockhart.upper.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_7', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 7', null, 'lockhart.upper.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_upper_8', 'org_2007', 'dim_res', 'd_lockhart_upper', 'cot', 'Cot 8', null, 'lockhart.upper.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_lockhart_lower', 'org_2007', 'dim_res', 'h_lockhart', 'dorm', 'Lower', 8, 'lockhart.lower', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_1', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 1', null, 'lockhart.lower.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_2', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 2', null, 'lockhart.lower.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_3', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 3', null, 'lockhart.lower.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_4', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 4', null, 'lockhart.lower.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_5', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 5', null, 'lockhart.lower.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_6', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 6', null, 'lockhart.lower.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_7', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 7', null, 'lockhart.lower.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_lockhart_lower_8', 'org_2007', 'dim_res', 'd_lockhart_lower', 'cot', 'Cot 8', null, 'lockhart.lower.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('h_pickard', 'org_2007', 'dim_res', null, 'house', 'Pickard-Parker', null, 'pickard', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_pickard_upper', 'org_2007', 'dim_res', 'h_pickard', 'dorm', 'Upper', 8, 'pickard.upper', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_1', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 1', null, 'pickard.upper.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_2', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 2', null, 'pickard.upper.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_3', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 3', null, 'pickard.upper.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_4', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 4', null, 'pickard.upper.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_5', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 5', null, 'pickard.upper.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_6', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 6', null, 'pickard.upper.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_7', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 7', null, 'pickard.upper.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_upper_8', 'org_2007', 'dim_res', 'd_pickard_upper', 'cot', 'Cot 8', null, 'pickard.upper.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_pickard_lower', 'org_2007', 'dim_res', 'h_pickard', 'dorm', 'Lower', 8, 'pickard.lower', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_1', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 1', null, 'pickard.lower.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_2', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 2', null, 'pickard.lower.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_3', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 3', null, 'pickard.lower.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_4', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 4', null, 'pickard.lower.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_5', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 5', null, 'pickard.lower.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_6', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 6', null, 'pickard.lower.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_7', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 7', null, 'pickard.lower.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_pickard_lower_8', 'org_2007', 'dim_res', 'd_pickard_lower', 'cot', 'Cot 8', null, 'pickard.lower.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('h_sarbah', 'org_2007', 'dim_res', null, 'house', 'Sarbah-Picot', null, 'sarbah', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_sarbah_upper', 'org_2007', 'dim_res', 'h_sarbah', 'dorm', 'Upper', 8, 'sarbah.upper', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_1', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 1', null, 'sarbah.upper.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_2', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 2', null, 'sarbah.upper.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_3', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 3', null, 'sarbah.upper.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_4', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 4', null, 'sarbah.upper.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_5', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 5', null, 'sarbah.upper.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_6', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 6', null, 'sarbah.upper.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_7', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 7', null, 'sarbah.upper.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_upper_8', 'org_2007', 'dim_res', 'd_sarbah_upper', 'cot', 'Cot 8', null, 'sarbah.upper.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_sarbah_lower', 'org_2007', 'dim_res', 'h_sarbah', 'dorm', 'Lower', 8, 'sarbah.lower', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_1', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 1', null, 'sarbah.lower.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_2', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 2', null, 'sarbah.lower.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_3', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 3', null, 'sarbah.lower.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_4', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 4', null, 'sarbah.lower.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_5', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 5', null, 'sarbah.lower.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_6', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 6', null, 'sarbah.lower.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_7', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 7', null, 'sarbah.lower.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_sarbah_lower_8', 'org_2007', 'dim_res', 'd_sarbah_lower', 'cot', 'Cot 8', null, 'sarbah.lower.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('h_bartels', 'org_2007', 'dim_res', null, 'house', 'Bartels-Sneath', null, 'bartels', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_bartels_upper', 'org_2007', 'dim_res', 'h_bartels', 'dorm', 'Upper', 8, 'bartels.upper', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_1', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 1', null, 'bartels.upper.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_2', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 2', null, 'bartels.upper.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_3', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 3', null, 'bartels.upper.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_4', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 4', null, 'bartels.upper.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_5', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 5', null, 'bartels.upper.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_6', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 6', null, 'bartels.upper.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_7', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 7', null, 'bartels.upper.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_upper_8', 'org_2007', 'dim_res', 'd_bartels_upper', 'cot', 'Cot 8', null, 'bartels.upper.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_bartels_middle', 'org_2007', 'dim_res', 'h_bartels', 'dorm', 'Middle', 8, 'bartels.middle', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_1', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 1', null, 'bartels.middle.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_2', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 2', null, 'bartels.middle.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_3', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 3', null, 'bartels.middle.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_4', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 4', null, 'bartels.middle.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_5', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 5', null, 'bartels.middle.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_6', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 6', null, 'bartels.middle.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_7', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 7', null, 'bartels.middle.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_middle_8', 'org_2007', 'dim_res', 'd_bartels_middle', 'cot', 'Cot 8', null, 'bartels.middle.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_bartels_lower', 'org_2007', 'dim_res', 'h_bartels', 'dorm', 'Lower', 8, 'bartels.lower', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_1', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 1', null, 'bartels.lower.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_2', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 2', null, 'bartels.lower.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_3', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 3', null, 'bartels.lower.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_4', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 4', null, 'bartels.lower.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_5', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 5', null, 'bartels.lower.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_6', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 6', null, 'bartels.lower.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_7', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 7', null, 'bartels.lower.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_lower_8', 'org_2007', 'dim_res', 'd_bartels_lower', 'cot', 'Cot 8', null, 'bartels.lower.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('d_bartels_extension', 'org_2007', 'dim_res', 'h_bartels', 'dorm', 'Extension', 8, 'bartels.extension', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_1', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 1', null, 'bartels.extension.1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_2', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 2', null, 'bartels.extension.2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_3', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 3', null, 'bartels.extension.3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_4', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 4', null, 'bartels.extension.4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_5', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 5', null, 'bartels.extension.5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_6', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 6', null, 'bartels.extension.6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_7', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 7', null, 'bartels.extension.7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('c_bartels_extension_8', 'org_2007', 'dim_res', 'd_bartels_extension', 'cot', 'Cot 8', null, 'bartels.extension.8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('p_sci', 'org_2007', 'dim_acad', null, 'programme', 'Science', null, 'sci', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_sci_s1', 'org_2007', 'dim_acad', 'p_sci', 'class', 'S1', null, 'sci.s1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_sci_s2', 'org_2007', 'dim_acad', 'p_sci', 'class', 'S2', null, 'sci.s2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_sci_s3', 'org_2007', 'dim_acad', 'p_sci', 'class', 'S3', null, 'sci.s3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_sci_s4', 'org_2007', 'dim_acad', 'p_sci', 'class', 'S4', null, 'sci.s4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_sci_s5', 'org_2007', 'dim_acad', 'p_sci', 'class', 'S5', null, 'sci.s5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('p_vis', 'org_2007', 'dim_acad', null, 'programme', 'Visual Arts', null, 'vis', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_vis_v1', 'org_2007', 'dim_acad', 'p_vis', 'class', 'V1', null, 'vis.v1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_vis_v2', 'org_2007', 'dim_acad', 'p_vis', 'class', 'V2', null, 'vis.v2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_vis_v3', 'org_2007', 'dim_acad', 'p_vis', 'class', 'V3', null, 'vis.v3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('p_arts', 'org_2007', 'dim_acad', null, 'programme', 'General Arts', null, 'arts', 9);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_arts_a1', 'org_2007', 'dim_acad', 'p_arts', 'class', 'A1', null, 'arts.a1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_arts_a2', 'org_2007', 'dim_acad', 'p_arts', 'class', 'A2', null, 'arts.a2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_arts_a3', 'org_2007', 'dim_acad', 'p_arts', 'class', 'A3', null, 'arts.a3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_arts_a4', 'org_2007', 'dim_acad', 'p_arts', 'class', 'A4', null, 'arts.a4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort) values ('cl_arts_a5', 'org_2007', 'dim_acad', 'p_arts', 'class', 'A5', null, 'arts.a5', 5);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values
  ('cir_year', 'org_2007', 'derived', 'open', null, 'Class of 2007', 'The whole year group.', 'year');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_p_sci', 'org_2007', 'derived', 'open', 'p_sci', 'Science', 'Science programme.', 'prog-sci');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_sci_s1', 'org_2007', 'derived', 'open', 'cl_sci_s1', 'Science S1', 'Class S1.', 'class-sci-s1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_sci_s2', 'org_2007', 'derived', 'open', 'cl_sci_s2', 'Science S2', 'Class S2.', 'class-sci-s2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_sci_s3', 'org_2007', 'derived', 'open', 'cl_sci_s3', 'Science S3', 'Class S3.', 'class-sci-s3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_sci_s4', 'org_2007', 'derived', 'open', 'cl_sci_s4', 'Science S4', 'Class S4.', 'class-sci-s4');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_sci_s5', 'org_2007', 'derived', 'open', 'cl_sci_s5', 'Science S5', 'Class S5.', 'class-sci-s5');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_p_vis', 'org_2007', 'derived', 'open', 'p_vis', 'Visual Arts', 'Visual Arts programme.', 'prog-vis');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_vis_v1', 'org_2007', 'derived', 'open', 'cl_vis_v1', 'Visual Arts V1', 'Class V1.', 'class-vis-v1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_vis_v2', 'org_2007', 'derived', 'open', 'cl_vis_v2', 'Visual Arts V2', 'Class V2.', 'class-vis-v2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_vis_v3', 'org_2007', 'derived', 'open', 'cl_vis_v3', 'Visual Arts V3', 'Class V3.', 'class-vis-v3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_p_arts', 'org_2007', 'derived', 'open', 'p_arts', 'General Arts', 'General Arts programme.', 'prog-arts');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_arts_a1', 'org_2007', 'derived', 'open', 'cl_arts_a1', 'General Arts A1', 'Class A1.', 'class-arts-a1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_arts_a2', 'org_2007', 'derived', 'open', 'cl_arts_a2', 'General Arts A2', 'Class A2.', 'class-arts-a2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_arts_a3', 'org_2007', 'derived', 'open', 'cl_arts_a3', 'General Arts A3', 'Class A3.', 'class-arts-a3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_arts_a4', 'org_2007', 'derived', 'open', 'cl_arts_a4', 'General Arts A4', 'Class A4.', 'class-arts-a4');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_cl_arts_a5', 'org_2007', 'derived', 'open', 'cl_arts_a5', 'General Arts A5', 'Class A5.', 'class-arts-a5');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_h_balmer', 'org_2007', 'derived', 'open', 'h_balmer', 'Balmer-Acquaah', 'Balmer-Acquaah house.', 'house-balmer');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_balmer_upper', 'org_2007', 'derived', 'open', 'd_balmer_upper', 'Upper Balmer-Acquaah', 'Upper dorm.', 'dorm-balmer-upper');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_balmer_lower', 'org_2007', 'derived', 'open', 'd_balmer_lower', 'Lower Balmer-Acquaah', 'Lower dorm.', 'dorm-balmer-lower');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_h_freeman', 'org_2007', 'derived', 'open', 'h_freeman', 'Freeman-Aggrey', 'Freeman-Aggrey house.', 'house-freeman');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_freeman_upper', 'org_2007', 'derived', 'open', 'd_freeman_upper', 'Upper Freeman-Aggrey', 'Upper dorm.', 'dorm-freeman-upper');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_freeman_lower', 'org_2007', 'derived', 'open', 'd_freeman_lower', 'Lower Freeman-Aggrey', 'Lower dorm.', 'dorm-freeman-lower');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_h_lockhart', 'org_2007', 'derived', 'open', 'h_lockhart', 'Lockhart-Schweitzer', 'Lockhart-Schweitzer house.', 'house-lockhart');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_lockhart_upper', 'org_2007', 'derived', 'open', 'd_lockhart_upper', 'Upper Lockhart-Schweitzer', 'Upper dorm.', 'dorm-lockhart-upper');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_lockhart_lower', 'org_2007', 'derived', 'open', 'd_lockhart_lower', 'Lower Lockhart-Schweitzer', 'Lower dorm.', 'dorm-lockhart-lower');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_h_pickard', 'org_2007', 'derived', 'open', 'h_pickard', 'Pickard-Parker', 'Pickard-Parker house.', 'house-pickard');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_pickard_upper', 'org_2007', 'derived', 'open', 'd_pickard_upper', 'Upper Pickard-Parker', 'Upper dorm.', 'dorm-pickard-upper');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_pickard_lower', 'org_2007', 'derived', 'open', 'd_pickard_lower', 'Lower Pickard-Parker', 'Lower dorm.', 'dorm-pickard-lower');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_h_sarbah', 'org_2007', 'derived', 'open', 'h_sarbah', 'Sarbah-Picot', 'Sarbah-Picot house.', 'house-sarbah');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_sarbah_upper', 'org_2007', 'derived', 'open', 'd_sarbah_upper', 'Upper Sarbah-Picot', 'Upper dorm.', 'dorm-sarbah-upper');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_sarbah_lower', 'org_2007', 'derived', 'open', 'd_sarbah_lower', 'Lower Sarbah-Picot', 'Lower dorm.', 'dorm-sarbah-lower');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_h_bartels', 'org_2007', 'derived', 'open', 'h_bartels', 'Bartels-Sneath', 'Bartels-Sneath house.', 'house-bartels');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_bartels_upper', 'org_2007', 'derived', 'open', 'd_bartels_upper', 'Upper Bartels-Sneath', 'Upper dorm.', 'dorm-bartels-upper');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_bartels_middle', 'org_2007', 'derived', 'open', 'd_bartels_middle', 'Middle Bartels-Sneath', 'Middle dorm.', 'dorm-bartels-middle');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_bartels_lower', 'org_2007', 'derived', 'open', 'd_bartels_lower', 'Lower Bartels-Sneath', 'Lower dorm.', 'dorm-bartels-lower');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_d_bartels_extension', 'org_2007', 'derived', 'open', 'd_bartels_extension', 'Extension Bartels-Sneath', 'Extension dorm.', 'dorm-bartels-extension');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values
  ('cir_accra', 'org_2007', 'voluntary', 'listed', null, 'Accra', 'Old boys who live or work in Accra.', 'accra'),
  ('cir_bankers', 'org_2007', 'voluntary', 'listed', null, 'Bankers', 'Finance, banking and insurance.', 'bankers'),
  ('cir_builders', 'org_2007', 'voluntary', 'listed', null, 'Builders', 'Sites, design and the trades.', 'builders'),
  ('cir_football', 'org_2007', 'voluntary', 'listed', null, 'Saturday football', 'A game, not a committee.', 'football'),
  ('cir_methodist', 'org_2007', 'voluntary', 'hidden', null, 'Methodist fellowship', 'A hidden faith circle. Only members can see it.', 'methodist');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_balmer_upper_3', 'org_2007', 'derived', 'open', 'c_balmer_upper_3', 'Cot 3, Upper Balmer-Acquaah', 'Opened because a cot mate is here.', 'cot-balmer-upper-3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_balmer_lower_1', 'org_2007', 'derived', 'open', 'c_balmer_lower_1', 'Cot 1, Lower Balmer-Acquaah', 'Opened because a cot mate is here.', 'cot-balmer-lower-1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_balmer_lower_5', 'org_2007', 'derived', 'open', 'c_balmer_lower_5', 'Cot 5, Lower Balmer-Acquaah', 'Opened because a cot mate is here.', 'cot-balmer-lower-5');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_balmer_upper_7', 'org_2007', 'derived', 'open', 'c_balmer_upper_7', 'Cot 7, Upper Balmer-Acquaah', 'Opened because a cot mate is here.', 'cot-balmer-upper-7');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_balmer_lower_2', 'org_2007', 'derived', 'open', 'c_balmer_lower_2', 'Cot 2, Lower Balmer-Acquaah', 'Opened because a cot mate is here.', 'cot-balmer-lower-2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_freeman_upper_2', 'org_2007', 'derived', 'open', 'c_freeman_upper_2', 'Cot 2, Upper Freeman-Aggrey', 'Opened because a cot mate is here.', 'cot-freeman-upper-2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_freeman_lower_4', 'org_2007', 'derived', 'open', 'c_freeman_lower_4', 'Cot 4, Lower Freeman-Aggrey', 'Opened because a cot mate is here.', 'cot-freeman-lower-4');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_freeman_lower_6', 'org_2007', 'derived', 'open', 'c_freeman_lower_6', 'Cot 6, Lower Freeman-Aggrey', 'Opened because a cot mate is here.', 'cot-freeman-lower-6');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_freeman_upper_8', 'org_2007', 'derived', 'open', 'c_freeman_upper_8', 'Cot 8, Upper Freeman-Aggrey', 'Opened because a cot mate is here.', 'cot-freeman-upper-8');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_freeman_lower_1', 'org_2007', 'derived', 'open', 'c_freeman_lower_1', 'Cot 1, Lower Freeman-Aggrey', 'Opened because a cot mate is here.', 'cot-freeman-lower-1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_freeman_upper_5', 'org_2007', 'derived', 'open', 'c_freeman_upper_5', 'Cot 5, Upper Freeman-Aggrey', 'Opened because a cot mate is here.', 'cot-freeman-upper-5');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_lockhart_upper_1', 'org_2007', 'derived', 'open', 'c_lockhart_upper_1', 'Cot 1, Upper Lockhart-Schweitzer', 'Opened because a cot mate is here.', 'cot-lockhart-upper-1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_lockhart_lower_2', 'org_2007', 'derived', 'open', 'c_lockhart_lower_2', 'Cot 2, Lower Lockhart-Schweitzer', 'Opened because a cot mate is here.', 'cot-lockhart-lower-2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_lockhart_upper_4', 'org_2007', 'derived', 'open', 'c_lockhart_upper_4', 'Cot 4, Upper Lockhart-Schweitzer', 'Opened because a cot mate is here.', 'cot-lockhart-upper-4');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_lockhart_lower_3', 'org_2007', 'derived', 'open', 'c_lockhart_lower_3', 'Cot 3, Lower Lockhart-Schweitzer', 'Opened because a cot mate is here.', 'cot-lockhart-lower-3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_lockhart_upper_6', 'org_2007', 'derived', 'open', 'c_lockhart_upper_6', 'Cot 6, Upper Lockhart-Schweitzer', 'Opened because a cot mate is here.', 'cot-lockhart-upper-6');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_lockhart_lower_8', 'org_2007', 'derived', 'open', 'c_lockhart_lower_8', 'Cot 8, Lower Lockhart-Schweitzer', 'Opened because a cot mate is here.', 'cot-lockhart-lower-8');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_upper_1', 'org_2007', 'derived', 'open', 'c_pickard_upper_1', 'Cot 1, Upper Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-upper-1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_upper_3', 'org_2007', 'derived', 'open', 'c_pickard_upper_3', 'Cot 3, Upper Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-upper-3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_lower_2', 'org_2007', 'derived', 'open', 'c_pickard_lower_2', 'Cot 2, Lower Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-lower-2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_lower_4', 'org_2007', 'derived', 'open', 'c_pickard_lower_4', 'Cot 4, Lower Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-lower-4');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_upper_6', 'org_2007', 'derived', 'open', 'c_pickard_upper_6', 'Cot 6, Upper Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-upper-6');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_lower_7', 'org_2007', 'derived', 'open', 'c_pickard_lower_7', 'Cot 7, Lower Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-lower-7');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_pickard_upper_5', 'org_2007', 'derived', 'open', 'c_pickard_upper_5', 'Cot 5, Upper Pickard-Parker', 'Opened because a cot mate is here.', 'cot-pickard-upper-5');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_sarbah_upper_2', 'org_2007', 'derived', 'open', 'c_sarbah_upper_2', 'Cot 2, Upper Sarbah-Picot', 'Opened because a cot mate is here.', 'cot-sarbah-upper-2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_sarbah_lower_3', 'org_2007', 'derived', 'open', 'c_sarbah_lower_3', 'Cot 3, Lower Sarbah-Picot', 'Opened because a cot mate is here.', 'cot-sarbah-lower-3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_sarbah_upper_1', 'org_2007', 'derived', 'open', 'c_sarbah_upper_1', 'Cot 1, Upper Sarbah-Picot', 'Opened because a cot mate is here.', 'cot-sarbah-upper-1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_sarbah_lower_5', 'org_2007', 'derived', 'open', 'c_sarbah_lower_5', 'Cot 5, Lower Sarbah-Picot', 'Opened because a cot mate is here.', 'cot-sarbah-lower-5');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_sarbah_upper_8', 'org_2007', 'derived', 'open', 'c_sarbah_upper_8', 'Cot 8, Upper Sarbah-Picot', 'Opened because a cot mate is here.', 'cot-sarbah-upper-8');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_sarbah_lower_6', 'org_2007', 'derived', 'open', 'c_sarbah_lower_6', 'Cot 6, Lower Sarbah-Picot', 'Opened because a cot mate is here.', 'cot-sarbah-lower-6');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_bartels_upper_1', 'org_2007', 'derived', 'open', 'c_bartels_upper_1', 'Cot 1, Upper Bartels-Sneath', 'Opened because a cot mate is here.', 'cot-bartels-upper-1');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_bartels_middle_4', 'org_2007', 'derived', 'open', 'c_bartels_middle_4', 'Cot 4, Middle Bartels-Sneath', 'Opened because a cot mate is here.', 'cot-bartels-middle-4');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_bartels_extension_2', 'org_2007', 'derived', 'open', 'c_bartels_extension_2', 'Cot 2, Extension Bartels-Sneath', 'Opened because a cot mate is here.', 'cot-bartels-extension-2');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_bartels_lower_7', 'org_2007', 'derived', 'open', 'c_bartels_lower_7', 'Cot 7, Lower Bartels-Sneath', 'Opened because a cot mate is here.', 'cot-bartels-lower-7');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_bartels_upper_3', 'org_2007', 'derived', 'open', 'c_bartels_upper_3', 'Cot 3, Upper Bartels-Sneath', 'Opened because a cot mate is here.', 'cot-bartels-upper-3');
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('cir_c_bartels_middle_1', 'org_2007', 'derived', 'open', 'c_bartels_middle_1', 'Cot 1, Middle Bartels-Sneath', 'Opened because a cot mate is here.', 'cot-bartels-middle-1');
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_01', 'org_2007', null, true, 'verified', 'Kwame Mensah', 'Wayo', '+233200001000', 'Accra', 'Civil engineer', 'I still measure a room by eye before I trust the tape.',
    'h_balmer', 'd_balmer_upper', 'c_balmer_upper_3', 'p_sci', 'cl_sci_s1', null, 10, 12, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_02', 'org_2007', null, true, 'verified', 'Yaw Boateng', 'Obonto', '+233200001001', 'Kumasi', 'Lecturer', 'I teach structures and I still quote our old physics master.',
    'h_balmer', 'd_balmer_upper', 'c_balmer_upper_3', 'p_sci', 'cl_sci_s2', null, 3, 2, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_03', 'org_2007', null, true, 'verified', 'Kofi Asante', 'Wetbone', '+233200001002', 'Accra', 'Events producer', 'If the sound is wrong, the hall is wrong.',
    'h_balmer', 'd_balmer_lower', 'c_balmer_lower_1', 'p_sci', 'cl_sci_s1', null, 7, 19, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_04', 'org_2007', null, true, 'verified', 'Kojo Owusu', 'Reymo', '+233200001003', 'Accra', 'Barrister', 'I argue for a living and I still lose to my cot.',
    'h_balmer', 'd_balmer_lower', 'c_balmer_lower_5', 'p_arts', 'cl_arts_a2', null, 1, 8, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_05', 'org_2007', null, true, 'verified', 'Kwesi Appiah', 'Doctor', '+233200001004', 'Tema', 'Medical officer', 'Night shifts, then the group chat.',
    'h_balmer', 'd_balmer_upper', 'c_balmer_upper_7', 'p_sci', 'cl_sci_s3', null, 11, 4, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_06', 'org_2007', null, true, 'verified', 'Kobby Nunoo', 'Radar', '+233200001005', 'Accra', 'Telecoms engineer', 'I keep the lines up.',
    'h_balmer', 'd_balmer_lower', 'c_balmer_lower_2', 'p_sci', 'cl_sci_s1', null, 10, 28, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_07', 'org_2007', null, true, 'verified', 'Ebo Hanson', 'Pilot', '+233200001006', 'Takoradi', 'Airline officer', 'I boarded, but I cannot swear to the cot number.',
    'h_balmer', 'd_balmer_upper', null, 'p_arts', 'cl_arts_a1', null, 5, 16, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_08', 'org_2007', null, true, 'verified', 'Kwabena Darko', 'Boss', '+233200001007', 'Accra', 'Building contractor', 'We pour on Saturdays. Call before Friday.',
    'h_freeman', 'd_freeman_upper', 'c_freeman_upper_2', 'p_sci', 'cl_sci_s4', null, 5, 21, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_09', 'org_2007', null, true, 'verified', 'Fiifi Hammond', 'Captain', '+233200001008', 'Cape Coast', 'Marine officer', 'Home is still the coast.',
    'h_freeman', 'd_freeman_upper', 'c_freeman_upper_2', 'p_sci', 'cl_sci_s1', null, 10, 2, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_10', 'org_2007', null, true, 'verified', 'Ekow Quaye', 'Engine', '+233200001009', 'Takoradi', 'Mechanical engineer', 'If it turns, I want to know why.',
    'h_freeman', 'd_freeman_lower', 'c_freeman_lower_4', 'p_sci', 'cl_sci_s5', null, 10, 9, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_11', 'org_2007', null, true, 'verified', 'Paa Kwesi Arthur', 'Banker', '+233200001010', 'Accra', 'Banker', 'I count cedis slowly and I sleep well.',
    'h_freeman', 'd_freeman_lower', 'c_freeman_lower_6', 'p_arts', 'cl_arts_a1', null, 2, 14, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_12', 'org_2007', null, true, 'verified', 'Nana Yaw Osei', 'Chief', '+233200001011', 'Accra', 'Architect', 'Light, shade, and a good verandah.',
    'h_freeman', 'd_freeman_upper', 'c_freeman_upper_8', 'p_vis', 'cl_vis_v1', null, 9, 30, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_13', 'org_2007', null, true, 'verified', 'Kojo Baah', 'Mixer', '+233200001012', 'Kumasi', 'Radio producer', 'I still edit on Sundays.',
    'h_freeman', 'd_freeman_lower', 'c_freeman_lower_1', 'p_arts', 'cl_arts_a3', null, 8, 3, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_14', 'org_2007', null, true, 'verified', 'Papa Yaw Mensah', 'Stones', '+233200001013', 'Accra', 'Quarry manager', 'Aggregate, delivered.',
    'h_freeman', 'd_freeman_upper', 'c_freeman_upper_5', 'p_sci', 'cl_sci_s2', null, 4, 27, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_15', 'org_2007', null, true, 'verified', 'Kobina Mills', 'Pastor', '+233200001014', 'Kumasi', 'Minister', 'Chapel first, then the rest of the day.',
    'h_lockhart', 'd_lockhart_upper', 'c_lockhart_upper_1', 'p_arts', 'cl_arts_a3', null, 12, 25, true
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_16', 'org_2007', null, true, 'verified', 'Egya Atta', 'Net', '+233200001015', 'Elmina', 'Fish exporter', 'The boats go out before the messages start.',
    'h_lockhart', 'd_lockhart_lower', 'c_lockhart_lower_2', 'p_arts', 'cl_arts_a4', null, 6, 11, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_17', 'org_2007', null, true, 'verified', 'Kuuku Dadzie', 'Press', '+233200001016', 'Accra', 'Journalist', 'I write short and I keep my notes.',
    'h_lockhart', 'd_lockhart_upper', 'c_lockhart_upper_4', 'p_arts', 'cl_arts_a1', null, 4, 18, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_18', 'org_2007', null, true, 'verified', 'Paa Joe', 'Chisel', '+233200001017', 'Winneba', 'Furniture maker', 'Odum, if you can get it.',
    'h_lockhart', 'd_lockhart_lower', 'c_lockhart_lower_3', 'p_vis', 'cl_vis_v2', null, 8, 7, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_19', 'org_2007', null, true, 'verified', 'Kweku Annan', 'Bench', '+233200001018', 'Accra', 'Magistrate', 'I listen longer than I talk.',
    'h_lockhart', 'd_lockhart_upper', 'c_lockhart_upper_6', 'p_arts', 'cl_arts_a5', null, 10, 15, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_20', 'org_2007', null, true, 'verified', 'Fiifi Dawson', 'Lines', '+233200001019', 'Tema', 'Grid engineer', 'Outages annoy me personally.',
    'h_lockhart', 'd_lockhart_lower', 'c_lockhart_lower_8', 'p_sci', 'cl_sci_s4', null, 1, 29, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_21', 'org_2007', null, true, 'verified', 'Kwame Adu', 'Pepper', '+233200001020', 'Accra', 'Pharmacist', 'Ask me before you mix anything.',
    'h_pickard', 'd_pickard_upper', 'c_pickard_upper_1', 'p_sci', 'cl_sci_s1', null, 10, 6, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_22', 'org_2007', null, true, 'verified', 'Yaw Frimpong', 'Coach', '+233200001021', 'Kumasi', 'School coach', 'Training is at five. No debate.',
    'h_pickard', 'd_pickard_upper', 'c_pickard_upper_3', 'p_arts', 'cl_arts_a2', null, 7, 1, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_23', 'org_2007', null, true, 'verified', 'Kofi Mensima', 'Gold', '+233200001022', 'Obuasi', 'Mining engineer', 'I come up for air on weekends.',
    'h_pickard', 'd_pickard_lower', 'c_pickard_lower_2', 'p_sci', 'cl_sci_s3', null, 3, 22, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_24', 'org_2007', null, true, 'verified', 'Kojo Sekyi', 'Silk', '+233200001023', 'Accra', 'Textile trader', 'Second shop opens next month.',
    'h_pickard', 'd_pickard_lower', 'c_pickard_lower_4', 'p_vis', 'cl_vis_v3', null, 11, 11, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_25', 'org_2007', null, true, 'verified', 'Ekow Bennett', 'Books', '+233200001024', 'Accra', 'Publisher', 'I still read the old school magazine.',
    'h_pickard', 'd_pickard_upper', 'c_pickard_upper_6', 'p_arts', 'cl_arts_a4', null, 2, 2, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_26', 'org_2007', null, true, 'verified', 'Nana Kojo', 'Harbour', '+233200001025', 'Tema', 'Port supervisor', 'The tide does not take excuses.',
    'h_pickard', 'd_pickard_lower', 'c_pickard_lower_7', 'p_sci', 'cl_sci_s5', null, 9, 9, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_27', 'org_2007', null, true, 'verified', 'Panyin Moore', 'Twin', '+233200001026', 'Accra', 'Data analyst', 'My brother did not come to our school. I remind him.',
    'h_pickard', 'd_pickard_upper', 'c_pickard_upper_5', 'p_sci', 'cl_sci_s2', null, 6, 6, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_28', 'org_2007', null, true, 'verified', 'Kwesi Blankson', 'Sugar', '+233200001027', 'Accra', 'Hotelier', 'If you need rooms in Osu, say so early.',
    'h_sarbah', 'd_sarbah_upper', 'c_sarbah_upper_2', 'p_arts', 'cl_arts_a1', null, 10, 20, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_29', 'org_2007', null, true, 'verified', 'Ato Hammond', 'Wave', '+233200001028', 'Cape Coast', 'Fish processor', 'Ice, always ice.',
    'h_sarbah', 'd_sarbah_lower', 'c_sarbah_lower_3', 'p_sci', 'cl_sci_s1', null, 5, 5, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_30', 'org_2007', null, true, 'verified', 'Kojo Van-Lare', 'Brush', '+233200001029', 'Accra', 'Painter', 'Commissions open for house colours, done properly.',
    'h_sarbah', 'd_sarbah_upper', 'c_sarbah_upper_1', 'p_vis', 'cl_vis_v1', null, 8, 18, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_31', 'org_2007', null, true, 'verified', 'Yaw Sarpong', 'Choir', '+233200001030', 'Kumasi', 'Music teacher', 'Bring the hymn, not the speaker.',
    'h_sarbah', 'd_sarbah_lower', 'c_sarbah_lower_5', 'p_arts', 'cl_arts_a5', null, 12, 3, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_32', 'org_2007', null, true, 'verified', 'Kobby Eyiah', 'Drill', '+233200001031', 'Tarkwa', 'Driller', 'I am underground more than I like.',
    'h_sarbah', 'd_sarbah_upper', 'c_sarbah_upper_8', 'p_sci', 'cl_sci_s4', null, 4, 4, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_33', 'org_2007', null, true, 'verified', 'Paa Nii', 'Lights', '+233200001032', 'Accra', 'Electrician', 'I will not wire a house over WhatsApp.',
    'h_sarbah', 'd_sarbah_lower', 'c_sarbah_lower_6', 'p_sci', 'cl_sci_s2', null, 7, 23, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_34', 'org_2007', null, true, 'verified', 'Kwabena Safo', 'Iron', '+233200001033', 'Tema', 'Steel trader', 'Rods, sheets, and a fair price.',
    'h_bartels', 'd_bartels_upper', 'c_bartels_upper_1', 'p_sci', 'cl_sci_s3', null, 1, 17, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_35', 'org_2007', null, true, 'verified', 'Fiifi Buckman', 'Middle', '+233200001034', 'Accra', 'Insurance broker', 'Read the exclusion list. I mean it.',
    'h_bartels', 'd_bartels_middle', 'c_bartels_middle_4', 'p_arts', 'cl_arts_a2', null, 10, 1, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_36', 'org_2007', null, true, 'verified', 'Ekow Dadson', 'Ext', '+233200001035', 'Accra', 'Software lead', 'We shipped a small payments tool this year.',
    'h_bartels', 'd_bartels_extension', 'c_bartels_extension_2', 'p_sci', 'cl_sci_s5', null, 3, 14, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_37', 'org_2007', null, true, 'verified', 'Nana Quayson', 'Lower', '+233200001036', 'Winneba', 'Lecturer', 'General paper, still.',
    'h_bartels', 'd_bartels_lower', 'c_bartels_lower_7', 'p_arts', 'cl_arts_a3', null, 9, 2, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_38', 'org_2007', null, true, 'verified', 'Kojo Impraim', 'Keeper', '+233200001037', 'Accra', 'Goalkeeper coach', 'Hands, then feet. In that order.',
    'h_bartels', 'd_bartels_upper', 'c_bartels_upper_3', 'p_vis', 'cl_vis_v2', null, 6, 28, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_39', 'org_2007', null, true, 'verified', 'Yaw Ottu', 'Market', '+233200001038', 'Kumasi', 'Commodities trader', 'Maize and nerves of iron.',
    'h_bartels', 'd_bartels_middle', 'c_bartels_middle_1', 'p_arts', 'cl_arts_a4', null, 11, 30, false
  );
insert into membership (id, organisation_id, user_id, sample, status, display_name, nickname, phone, city, profession, bio, house_node_id, dorm_node_id, cot_node_id, programme_node_id, class_node_id, residence_escape, birthday_month, birthday_day, birthday_opt_out) values (
    'mem_40', 'org_2007', null, true, 'verified', 'Kofi Lamptey', 'Day', '+233200001039', 'Accra', 'Dentist', 'I was a day student. I still claim the year.',
    null, null, null, 'p_sci', 'cl_sci_s2', 'day', 10, 7, false
  );
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_01', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_01', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s1', 'mem_01', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_01', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_upper', 'mem_01', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_balmer_upper_3', 'mem_01', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_01', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_builders', 'mem_01', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_02', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_02', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s2', 'mem_02', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_02', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_upper', 'mem_02', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_balmer_upper_3', 'mem_02', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_03', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_03', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s1', 'mem_03', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_03', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_lower', 'mem_03', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_balmer_lower_1', 'mem_03', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_03', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_04', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_04', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a2', 'mem_04', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_04', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_lower', 'mem_04', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_balmer_lower_5', 'mem_04', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_04', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_05', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_05', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s3', 'mem_05', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_05', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_upper', 'mem_05', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_balmer_upper_7', 'mem_05', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_methodist', 'mem_05', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_06', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_06', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s1', 'mem_06', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_06', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_lower', 'mem_06', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_balmer_lower_2', 'mem_06', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_06', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_07', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_07', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a1', 'mem_07', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_balmer', 'mem_07', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_balmer_upper', 'mem_07', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_08', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_08', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s4', 'mem_08', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_08', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_upper', 'mem_08', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_upper_2', 'mem_08', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_08', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_builders', 'mem_08', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_09', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_09', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s1', 'mem_09', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_09', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_upper', 'mem_09', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_upper_2', 'mem_09', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_football', 'mem_09', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_10', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_10', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s5', 'mem_10', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_10', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_lower', 'mem_10', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_lower_4', 'mem_10', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_11', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_11', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a1', 'mem_11', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_11', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_lower', 'mem_11', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_lower_6', 'mem_11', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_11', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_bankers', 'mem_11', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_12', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_vis', 'mem_12', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_vis_v1', 'mem_12', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_12', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_upper', 'mem_12', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_upper_8', 'mem_12', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_12', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_builders', 'mem_12', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_13', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_13', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a3', 'mem_13', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_13', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_lower', 'mem_13', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_lower_1', 'mem_13', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_14', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_14', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s2', 'mem_14', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_freeman', 'mem_14', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_freeman_upper', 'mem_14', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_freeman_upper_5', 'mem_14', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_14', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_15', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_15', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a3', 'mem_15', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_lockhart', 'mem_15', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_lockhart_upper', 'mem_15', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_lockhart_upper_1', 'mem_15', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_methodist', 'mem_15', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_16', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_16', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a4', 'mem_16', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_lockhart', 'mem_16', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_lockhart_lower', 'mem_16', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_lockhart_lower_2', 'mem_16', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_17', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_17', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a1', 'mem_17', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_lockhart', 'mem_17', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_lockhart_upper', 'mem_17', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_lockhart_upper_4', 'mem_17', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_17', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_18', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_vis', 'mem_18', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_vis_v2', 'mem_18', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_lockhart', 'mem_18', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_lockhart_lower', 'mem_18', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_lockhart_lower_3', 'mem_18', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_builders', 'mem_18', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_19', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_19', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a5', 'mem_19', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_lockhart', 'mem_19', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_lockhart_upper', 'mem_19', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_lockhart_upper_6', 'mem_19', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_19', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_20', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_20', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s4', 'mem_20', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_lockhart', 'mem_20', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_lockhart_lower', 'mem_20', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_lockhart_lower_8', 'mem_20', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_21', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_21', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s1', 'mem_21', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_21', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_upper', 'mem_21', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_upper_1', 'mem_21', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_21', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_22', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_22', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a2', 'mem_22', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_22', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_upper', 'mem_22', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_upper_3', 'mem_22', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_football', 'mem_22', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_23', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_23', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s3', 'mem_23', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_23', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_lower', 'mem_23', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_lower_2', 'mem_23', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_24', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_vis', 'mem_24', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_vis_v3', 'mem_24', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_24', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_lower', 'mem_24', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_lower_4', 'mem_24', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_24', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_25', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_25', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a4', 'mem_25', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_25', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_upper', 'mem_25', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_upper_6', 'mem_25', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_25', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_26', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_26', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s5', 'mem_26', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_26', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_lower', 'mem_26', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_lower_7', 'mem_26', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_27', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_27', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s2', 'mem_27', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_pickard', 'mem_27', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_pickard_upper', 'mem_27', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_pickard_upper_5', 'mem_27', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_27', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_28', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_28', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a1', 'mem_28', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_sarbah', 'mem_28', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_sarbah_upper', 'mem_28', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_sarbah_upper_2', 'mem_28', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_28', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_29', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_29', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s1', 'mem_29', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_sarbah', 'mem_29', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_sarbah_lower', 'mem_29', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_sarbah_lower_3', 'mem_29', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_30', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_vis', 'mem_30', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_vis_v1', 'mem_30', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_sarbah', 'mem_30', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_sarbah_upper', 'mem_30', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_sarbah_upper_1', 'mem_30', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_30', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_31', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_31', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a5', 'mem_31', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_sarbah', 'mem_31', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_sarbah_lower', 'mem_31', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_sarbah_lower_5', 'mem_31', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_methodist', 'mem_31', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_32', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_32', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s4', 'mem_32', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_sarbah', 'mem_32', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_sarbah_upper', 'mem_32', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_sarbah_upper_8', 'mem_32', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_33', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_33', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s2', 'mem_33', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_sarbah', 'mem_33', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_sarbah_lower', 'mem_33', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_sarbah_lower_6', 'mem_33', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_33', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_builders', 'mem_33', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_34', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_34', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s3', 'mem_34', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_bartels', 'mem_34', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_bartels_upper', 'mem_34', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_bartels_upper_1', 'mem_34', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_builders', 'mem_34', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_35', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_35', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a2', 'mem_35', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_bartels', 'mem_35', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_bartels_middle', 'mem_35', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_bartels_middle_4', 'mem_35', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_35', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_bankers', 'mem_35', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_36', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_36', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s5', 'mem_36', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_bartels', 'mem_36', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_bartels_extension', 'mem_36', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_bartels_extension_2', 'mem_36', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_36', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_37', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_37', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a3', 'mem_37', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_bartels', 'mem_37', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_bartels_lower', 'mem_37', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_bartels_lower_7', 'mem_37', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_38', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_vis', 'mem_38', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_vis_v2', 'mem_38', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_bartels', 'mem_38', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_bartels_upper', 'mem_38', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_bartels_upper_3', 'mem_38', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_38', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_football', 'mem_38', 'joined');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_39', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_arts', 'mem_39', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_arts_a4', 'mem_39', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_h_bartels', 'mem_39', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_d_bartels_middle', 'mem_39', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_c_bartels_middle_1', 'mem_39', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_year', 'mem_40', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_p_sci', 'mem_40', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_cl_sci_s2', 'mem_40', 'derived');
insert into circle_member (organisation_id, circle_id, membership_id, source) values ('org_2007', 'cir_accra', 'mem_40', 'joined');
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_capt_balmer', 'org_2007', 'mem_01', 'house_captain', 'node', 'h_balmer', 'balmer');
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_cot_balmer', 'org_2007', 'mem_01', 'cot_leader', 'node', 'c_balmer_upper_3', 'balmer.upper.3');
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_capt_freeman', 'org_2007', 'mem_09', 'house_captain', 'node', 'h_freeman', 'freeman');
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_treasurer', 'org_2007', 'mem_11', 'treasurer', 'organisation', null, null);
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_secretary', 'org_2007', 'mem_17', 'secretary', 'organisation', null, null);
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_exec', 'org_2007', 'mem_19', 'executive', 'organisation', null, null);
insert into role_assignment (id, organisation_id, membership_id, role, scope_type, scope_id, scope_path) values ('role_class_s1', 'org_2007', 'mem_21', 'class_representative', 'node', 'cl_sci_s1', 'sci.s1');
insert into purpose (id, organisation_id, type, title, story, target_pesewas, status, hero) values
  ('pur_library', 'org_2007', 'campaign', 'The 2007 library', 'A quiet room and new shelves for the school library at Kwabotwe. House and class totals are shown. Names of givers are not.', 15000000, 'open', true),
  ('pur_dues', 'org_2007', 'dues', 'Year group dues', 'The small amount that keeps the year group able to meet, write and show up.', 5000000, 'open', false),
  ('pur_dinner', 'org_2007', 'event', 'Founders dinner ticket', '5 December, Accra. One ticket, one seat.', 0, 'open', false),
  ('pur_store', 'org_2007', 'other', 'Year group store', 'Jerseys, hoodies and the tie.', 0, 'open', false);
insert into pledge (id, organisation_id, purpose_id, membership_id, total_pesewas, anonymous, status) values
  ('pl_boss', 'org_2007', 'pur_library', 'mem_08', 300000, false, 'open');
insert into instalment (id, organisation_id, pledge_id, due_on, amount_pesewas, paid_pesewas, seq) values
  ('in_boss_1', 'org_2007', 'pl_boss', '2026-10-20', 100000, 0, 1),
  ('in_boss_2', 'org_2007', 'pl_boss', '2026-11-20', 100000, 0, 2),
  ('in_boss_3', 'org_2007', 'pl_boss', '2026-12-20', 100000, 0, 3);
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_01', 'org_2007', 'pur_library', 'mem_01', null, 100000, 102950, 1950, 1000, true, false, 'succeeded', 'seed_pi_01', now() - interval '30 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_01', 'org_2007', 'pi_01', 'test', 'seed_pi_01', '{"provider":"test","reference":"seed_pi_01","gift":100000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_0', 'org_2007', 'pi_01:pay', 'clearing', 'debit', 102950, 'pur_library', 'mem_01', 'pi_01', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_1', 'org_2007', 'pi_01:pay', 'fund', 'credit', 100000, 'pur_library', 'mem_01', 'pi_01', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_2', 'org_2007', 'pi_01:pay', 'fees_recovered', 'credit', 2950, 'pur_library', 'mem_01', 'pi_01', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_3', 'org_2007', 'pi_01:fee', 'fees_expense', 'debit', 2950, 'pur_library', 'mem_01', 'pi_01', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_4', 'org_2007', 'pi_01:fee', 'clearing', 'credit', 2950, 'pur_library', 'mem_01', 'pi_01', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_5', 'org_2007', 'pi_01:settle', 'org_bank', 'debit', 100000, 'pur_library', 'mem_01', 'pi_01', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_01_6', 'org_2007', 'pi_01:settle', 'clearing', 'credit', 100000, 'pur_library', 'mem_01', 'pi_01', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_01', 'org_2007', 'MF2007-0001', 'pi_01', 'The 2007 library', 102950, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_02', 'org_2007', 'pur_library', 'mem_02', null, 50000, 50000, 975, 500, false, false, 'succeeded', 'seed_pi_02', now() - interval '29 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_02', 'org_2007', 'pi_02', 'test', 'seed_pi_02', '{"provider":"test","reference":"seed_pi_02","gift":50000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_02_0', 'org_2007', 'pi_02:pay', 'clearing', 'debit', 50000, 'pur_library', 'mem_02', 'pi_02', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_02_1', 'org_2007', 'pi_02:pay', 'fund', 'credit', 50000, 'pur_library', 'mem_02', 'pi_02', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_02_2', 'org_2007', 'pi_02:fee', 'fees_expense', 'debit', 1475, 'pur_library', 'mem_02', 'pi_02', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_02_3', 'org_2007', 'pi_02:fee', 'clearing', 'credit', 1475, 'pur_library', 'mem_02', 'pi_02', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_02_4', 'org_2007', 'pi_02:settle', 'org_bank', 'debit', 48525, 'pur_library', 'mem_02', 'pi_02', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_02_5', 'org_2007', 'pi_02:settle', 'clearing', 'credit', 48525, 'pur_library', 'mem_02', 'pi_02', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_02', 'org_2007', 'MF2007-0002', 'pi_02', 'The 2007 library', 50000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_03', 'org_2007', 'pur_library', 'mem_03', null, 20000, 20000, 390, 200, false, true, 'succeeded', 'seed_pi_03', now() - interval '28 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_03', 'org_2007', 'pi_03', 'test', 'seed_pi_03', '{"provider":"test","reference":"seed_pi_03","gift":20000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_03_0', 'org_2007', 'pi_03:pay', 'clearing', 'debit', 20000, 'pur_library', 'mem_03', 'pi_03', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_03_1', 'org_2007', 'pi_03:pay', 'fund', 'credit', 20000, 'pur_library', 'mem_03', 'pi_03', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_03_2', 'org_2007', 'pi_03:fee', 'fees_expense', 'debit', 590, 'pur_library', 'mem_03', 'pi_03', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_03_3', 'org_2007', 'pi_03:fee', 'clearing', 'credit', 590, 'pur_library', 'mem_03', 'pi_03', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_03_4', 'org_2007', 'pi_03:settle', 'org_bank', 'debit', 19410, 'pur_library', 'mem_03', 'pi_03', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_03_5', 'org_2007', 'pi_03:settle', 'clearing', 'credit', 19410, 'pur_library', 'mem_03', 'pi_03', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_03', 'org_2007', 'MF2007-0003', 'pi_03', 'The 2007 library', 20000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_04', 'org_2007', 'pur_library', 'mem_04', null, 75000, 75000, 1463, 750, false, false, 'succeeded', 'seed_pi_04', now() - interval '27 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_04', 'org_2007', 'pi_04', 'test', 'seed_pi_04', '{"provider":"test","reference":"seed_pi_04","gift":75000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_04_0', 'org_2007', 'pi_04:pay', 'clearing', 'debit', 75000, 'pur_library', 'mem_04', 'pi_04', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_04_1', 'org_2007', 'pi_04:pay', 'fund', 'credit', 75000, 'pur_library', 'mem_04', 'pi_04', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_04_2', 'org_2007', 'pi_04:fee', 'fees_expense', 'debit', 2213, 'pur_library', 'mem_04', 'pi_04', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_04_3', 'org_2007', 'pi_04:fee', 'clearing', 'credit', 2213, 'pur_library', 'mem_04', 'pi_04', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_04_4', 'org_2007', 'pi_04:settle', 'org_bank', 'debit', 72787, 'pur_library', 'mem_04', 'pi_04', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_04_5', 'org_2007', 'pi_04:settle', 'clearing', 'credit', 72787, 'pur_library', 'mem_04', 'pi_04', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_04', 'org_2007', 'MF2007-0004', 'pi_04', 'The 2007 library', 75000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_05', 'org_2007', 'pur_library', 'mem_05', null, 30000, 30000, 585, 300, false, false, 'succeeded', 'seed_pi_05', now() - interval '26 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_05', 'org_2007', 'pi_05', 'test', 'seed_pi_05', '{"provider":"test","reference":"seed_pi_05","gift":30000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_05_0', 'org_2007', 'pi_05:pay', 'clearing', 'debit', 30000, 'pur_library', 'mem_05', 'pi_05', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_05_1', 'org_2007', 'pi_05:pay', 'fund', 'credit', 30000, 'pur_library', 'mem_05', 'pi_05', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_05_2', 'org_2007', 'pi_05:fee', 'fees_expense', 'debit', 885, 'pur_library', 'mem_05', 'pi_05', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_05_3', 'org_2007', 'pi_05:fee', 'clearing', 'credit', 885, 'pur_library', 'mem_05', 'pi_05', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_05_4', 'org_2007', 'pi_05:settle', 'org_bank', 'debit', 29115, 'pur_library', 'mem_05', 'pi_05', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_05_5', 'org_2007', 'pi_05:settle', 'clearing', 'credit', 29115, 'pur_library', 'mem_05', 'pi_05', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_05', 'org_2007', 'MF2007-0005', 'pi_05', 'The 2007 library', 30000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_06', 'org_2007', 'pur_library', 'mem_08', null, 200000, 200000, 3900, 2000, false, false, 'succeeded', 'seed_pi_06', now() - interval '25 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_06', 'org_2007', 'pi_06', 'test', 'seed_pi_06', '{"provider":"test","reference":"seed_pi_06","gift":200000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_06_0', 'org_2007', 'pi_06:pay', 'clearing', 'debit', 200000, 'pur_library', 'mem_08', 'pi_06', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_06_1', 'org_2007', 'pi_06:pay', 'fund', 'credit', 200000, 'pur_library', 'mem_08', 'pi_06', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_06_2', 'org_2007', 'pi_06:fee', 'fees_expense', 'debit', 5900, 'pur_library', 'mem_08', 'pi_06', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_06_3', 'org_2007', 'pi_06:fee', 'clearing', 'credit', 5900, 'pur_library', 'mem_08', 'pi_06', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_06_4', 'org_2007', 'pi_06:settle', 'org_bank', 'debit', 194100, 'pur_library', 'mem_08', 'pi_06', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_06_5', 'org_2007', 'pi_06:settle', 'clearing', 'credit', 194100, 'pur_library', 'mem_08', 'pi_06', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_06', 'org_2007', 'MF2007-0006', 'pi_06', 'The 2007 library', 200000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_07', 'org_2007', 'pur_library', 'mem_09', null, 50000, 51475, 975, 500, true, false, 'succeeded', 'seed_pi_07', now() - interval '24 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_07', 'org_2007', 'pi_07', 'test', 'seed_pi_07', '{"provider":"test","reference":"seed_pi_07","gift":50000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_0', 'org_2007', 'pi_07:pay', 'clearing', 'debit', 51475, 'pur_library', 'mem_09', 'pi_07', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_1', 'org_2007', 'pi_07:pay', 'fund', 'credit', 50000, 'pur_library', 'mem_09', 'pi_07', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_2', 'org_2007', 'pi_07:pay', 'fees_recovered', 'credit', 1475, 'pur_library', 'mem_09', 'pi_07', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_3', 'org_2007', 'pi_07:fee', 'fees_expense', 'debit', 1475, 'pur_library', 'mem_09', 'pi_07', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_4', 'org_2007', 'pi_07:fee', 'clearing', 'credit', 1475, 'pur_library', 'mem_09', 'pi_07', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_5', 'org_2007', 'pi_07:settle', 'org_bank', 'debit', 50000, 'pur_library', 'mem_09', 'pi_07', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_07_6', 'org_2007', 'pi_07:settle', 'clearing', 'credit', 50000, 'pur_library', 'mem_09', 'pi_07', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_07', 'org_2007', 'MF2007-0007', 'pi_07', 'The 2007 library', 51475, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_08', 'org_2007', 'pur_library', 'mem_10', null, 40000, 40000, 780, 400, false, false, 'succeeded', 'seed_pi_08', now() - interval '23 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_08', 'org_2007', 'pi_08', 'test', 'seed_pi_08', '{"provider":"test","reference":"seed_pi_08","gift":40000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_08_0', 'org_2007', 'pi_08:pay', 'clearing', 'debit', 40000, 'pur_library', 'mem_10', 'pi_08', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_08_1', 'org_2007', 'pi_08:pay', 'fund', 'credit', 40000, 'pur_library', 'mem_10', 'pi_08', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_08_2', 'org_2007', 'pi_08:fee', 'fees_expense', 'debit', 1180, 'pur_library', 'mem_10', 'pi_08', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_08_3', 'org_2007', 'pi_08:fee', 'clearing', 'credit', 1180, 'pur_library', 'mem_10', 'pi_08', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_08_4', 'org_2007', 'pi_08:settle', 'org_bank', 'debit', 38820, 'pur_library', 'mem_10', 'pi_08', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_08_5', 'org_2007', 'pi_08:settle', 'clearing', 'credit', 38820, 'pur_library', 'mem_10', 'pi_08', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_08', 'org_2007', 'MF2007-0008', 'pi_08', 'The 2007 library', 40000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_09', 'org_2007', 'pur_library', 'mem_11', null, 150000, 150000, 2925, 1500, false, false, 'succeeded', 'seed_pi_09', now() - interval '22 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_09', 'org_2007', 'pi_09', 'test', 'seed_pi_09', '{"provider":"test","reference":"seed_pi_09","gift":150000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_09_0', 'org_2007', 'pi_09:pay', 'clearing', 'debit', 150000, 'pur_library', 'mem_11', 'pi_09', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_09_1', 'org_2007', 'pi_09:pay', 'fund', 'credit', 150000, 'pur_library', 'mem_11', 'pi_09', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_09_2', 'org_2007', 'pi_09:fee', 'fees_expense', 'debit', 4425, 'pur_library', 'mem_11', 'pi_09', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_09_3', 'org_2007', 'pi_09:fee', 'clearing', 'credit', 4425, 'pur_library', 'mem_11', 'pi_09', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_09_4', 'org_2007', 'pi_09:settle', 'org_bank', 'debit', 145575, 'pur_library', 'mem_11', 'pi_09', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_09_5', 'org_2007', 'pi_09:settle', 'clearing', 'credit', 145575, 'pur_library', 'mem_11', 'pi_09', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_09', 'org_2007', 'MF2007-0009', 'pi_09', 'The 2007 library', 150000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_10', 'org_2007', 'pur_library', 'mem_12', null, 25000, 25000, 488, 250, false, true, 'succeeded', 'seed_pi_10', now() - interval '21 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_10', 'org_2007', 'pi_10', 'test', 'seed_pi_10', '{"provider":"test","reference":"seed_pi_10","gift":25000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_10_0', 'org_2007', 'pi_10:pay', 'clearing', 'debit', 25000, 'pur_library', 'mem_12', 'pi_10', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_10_1', 'org_2007', 'pi_10:pay', 'fund', 'credit', 25000, 'pur_library', 'mem_12', 'pi_10', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_10_2', 'org_2007', 'pi_10:fee', 'fees_expense', 'debit', 738, 'pur_library', 'mem_12', 'pi_10', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_10_3', 'org_2007', 'pi_10:fee', 'clearing', 'credit', 738, 'pur_library', 'mem_12', 'pi_10', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_10_4', 'org_2007', 'pi_10:settle', 'org_bank', 'debit', 24262, 'pur_library', 'mem_12', 'pi_10', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_10_5', 'org_2007', 'pi_10:settle', 'clearing', 'credit', 24262, 'pur_library', 'mem_12', 'pi_10', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_10', 'org_2007', 'MF2007-0010', 'pi_10', 'The 2007 library', 25000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_11', 'org_2007', 'pur_library', 'mem_15', null, 60000, 60000, 1170, 600, false, false, 'succeeded', 'seed_pi_11', now() - interval '20 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_11', 'org_2007', 'pi_11', 'test', 'seed_pi_11', '{"provider":"test","reference":"seed_pi_11","gift":60000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_11_0', 'org_2007', 'pi_11:pay', 'clearing', 'debit', 60000, 'pur_library', 'mem_15', 'pi_11', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_11_1', 'org_2007', 'pi_11:pay', 'fund', 'credit', 60000, 'pur_library', 'mem_15', 'pi_11', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_11_2', 'org_2007', 'pi_11:fee', 'fees_expense', 'debit', 1770, 'pur_library', 'mem_15', 'pi_11', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_11_3', 'org_2007', 'pi_11:fee', 'clearing', 'credit', 1770, 'pur_library', 'mem_15', 'pi_11', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_11_4', 'org_2007', 'pi_11:settle', 'org_bank', 'debit', 58230, 'pur_library', 'mem_15', 'pi_11', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_11_5', 'org_2007', 'pi_11:settle', 'clearing', 'credit', 58230, 'pur_library', 'mem_15', 'pi_11', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_11', 'org_2007', 'MF2007-0011', 'pi_11', 'The 2007 library', 60000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_12', 'org_2007', 'pur_library', 'mem_16', null, 15000, 15000, 293, 150, false, false, 'succeeded', 'seed_pi_12', now() - interval '19 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_12', 'org_2007', 'pi_12', 'test', 'seed_pi_12', '{"provider":"test","reference":"seed_pi_12","gift":15000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_12_0', 'org_2007', 'pi_12:pay', 'clearing', 'debit', 15000, 'pur_library', 'mem_16', 'pi_12', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_12_1', 'org_2007', 'pi_12:pay', 'fund', 'credit', 15000, 'pur_library', 'mem_16', 'pi_12', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_12_2', 'org_2007', 'pi_12:fee', 'fees_expense', 'debit', 443, 'pur_library', 'mem_16', 'pi_12', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_12_3', 'org_2007', 'pi_12:fee', 'clearing', 'credit', 443, 'pur_library', 'mem_16', 'pi_12', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_12_4', 'org_2007', 'pi_12:settle', 'org_bank', 'debit', 14557, 'pur_library', 'mem_16', 'pi_12', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_12_5', 'org_2007', 'pi_12:settle', 'clearing', 'credit', 14557, 'pur_library', 'mem_16', 'pi_12', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_12', 'org_2007', 'MF2007-0012', 'pi_12', 'The 2007 library', 15000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_13', 'org_2007', 'pur_library', 'mem_17', null, 80000, 80000, 1560, 800, false, false, 'succeeded', 'seed_pi_13', now() - interval '18 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_13', 'org_2007', 'pi_13', 'test', 'seed_pi_13', '{"provider":"test","reference":"seed_pi_13","gift":80000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_13_0', 'org_2007', 'pi_13:pay', 'clearing', 'debit', 80000, 'pur_library', 'mem_17', 'pi_13', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_13_1', 'org_2007', 'pi_13:pay', 'fund', 'credit', 80000, 'pur_library', 'mem_17', 'pi_13', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_13_2', 'org_2007', 'pi_13:fee', 'fees_expense', 'debit', 2360, 'pur_library', 'mem_17', 'pi_13', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_13_3', 'org_2007', 'pi_13:fee', 'clearing', 'credit', 2360, 'pur_library', 'mem_17', 'pi_13', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_13_4', 'org_2007', 'pi_13:settle', 'org_bank', 'debit', 77640, 'pur_library', 'mem_17', 'pi_13', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_13_5', 'org_2007', 'pi_13:settle', 'clearing', 'credit', 77640, 'pur_library', 'mem_17', 'pi_13', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_13', 'org_2007', 'MF2007-0013', 'pi_13', 'The 2007 library', 80000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_14', 'org_2007', 'pur_library', 'mem_18', null, 20000, 20000, 390, 200, false, false, 'succeeded', 'seed_pi_14', now() - interval '17 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_14', 'org_2007', 'pi_14', 'test', 'seed_pi_14', '{"provider":"test","reference":"seed_pi_14","gift":20000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_14_0', 'org_2007', 'pi_14:pay', 'clearing', 'debit', 20000, 'pur_library', 'mem_18', 'pi_14', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_14_1', 'org_2007', 'pi_14:pay', 'fund', 'credit', 20000, 'pur_library', 'mem_18', 'pi_14', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_14_2', 'org_2007', 'pi_14:fee', 'fees_expense', 'debit', 590, 'pur_library', 'mem_18', 'pi_14', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_14_3', 'org_2007', 'pi_14:fee', 'clearing', 'credit', 590, 'pur_library', 'mem_18', 'pi_14', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_14_4', 'org_2007', 'pi_14:settle', 'org_bank', 'debit', 19410, 'pur_library', 'mem_18', 'pi_14', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_14_5', 'org_2007', 'pi_14:settle', 'clearing', 'credit', 19410, 'pur_library', 'mem_18', 'pi_14', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_14', 'org_2007', 'MF2007-0014', 'pi_14', 'The 2007 library', 20000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_15', 'org_2007', 'pur_library', 'mem_21', null, 100000, 100000, 1950, 1000, false, false, 'succeeded', 'seed_pi_15', now() - interval '16 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_15', 'org_2007', 'pi_15', 'test', 'seed_pi_15', '{"provider":"test","reference":"seed_pi_15","gift":100000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_15_0', 'org_2007', 'pi_15:pay', 'clearing', 'debit', 100000, 'pur_library', 'mem_21', 'pi_15', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_15_1', 'org_2007', 'pi_15:pay', 'fund', 'credit', 100000, 'pur_library', 'mem_21', 'pi_15', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_15_2', 'org_2007', 'pi_15:fee', 'fees_expense', 'debit', 2950, 'pur_library', 'mem_21', 'pi_15', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_15_3', 'org_2007', 'pi_15:fee', 'clearing', 'credit', 2950, 'pur_library', 'mem_21', 'pi_15', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_15_4', 'org_2007', 'pi_15:settle', 'org_bank', 'debit', 97050, 'pur_library', 'mem_21', 'pi_15', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_15_5', 'org_2007', 'pi_15:settle', 'clearing', 'credit', 97050, 'pur_library', 'mem_21', 'pi_15', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_15', 'org_2007', 'MF2007-0015', 'pi_15', 'The 2007 library', 100000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_16', 'org_2007', 'pur_library', 'mem_22', null, 45000, 46328, 878, 450, true, false, 'succeeded', 'seed_pi_16', now() - interval '15 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_16', 'org_2007', 'pi_16', 'test', 'seed_pi_16', '{"provider":"test","reference":"seed_pi_16","gift":45000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_0', 'org_2007', 'pi_16:pay', 'clearing', 'debit', 46328, 'pur_library', 'mem_22', 'pi_16', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_1', 'org_2007', 'pi_16:pay', 'fund', 'credit', 45000, 'pur_library', 'mem_22', 'pi_16', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_2', 'org_2007', 'pi_16:pay', 'fees_recovered', 'credit', 1328, 'pur_library', 'mem_22', 'pi_16', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_3', 'org_2007', 'pi_16:fee', 'fees_expense', 'debit', 1328, 'pur_library', 'mem_22', 'pi_16', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_4', 'org_2007', 'pi_16:fee', 'clearing', 'credit', 1328, 'pur_library', 'mem_22', 'pi_16', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_5', 'org_2007', 'pi_16:settle', 'org_bank', 'debit', 45000, 'pur_library', 'mem_22', 'pi_16', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_16_6', 'org_2007', 'pi_16:settle', 'clearing', 'credit', 45000, 'pur_library', 'mem_22', 'pi_16', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_16', 'org_2007', 'MF2007-0016', 'pi_16', 'The 2007 library', 46328, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_17', 'org_2007', 'pur_library', 'mem_23', null, 300000, 300000, 5850, 3000, false, true, 'succeeded', 'seed_pi_17', now() - interval '14 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_17', 'org_2007', 'pi_17', 'test', 'seed_pi_17', '{"provider":"test","reference":"seed_pi_17","gift":300000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_17_0', 'org_2007', 'pi_17:pay', 'clearing', 'debit', 300000, 'pur_library', 'mem_23', 'pi_17', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_17_1', 'org_2007', 'pi_17:pay', 'fund', 'credit', 300000, 'pur_library', 'mem_23', 'pi_17', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_17_2', 'org_2007', 'pi_17:fee', 'fees_expense', 'debit', 8850, 'pur_library', 'mem_23', 'pi_17', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_17_3', 'org_2007', 'pi_17:fee', 'clearing', 'credit', 8850, 'pur_library', 'mem_23', 'pi_17', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_17_4', 'org_2007', 'pi_17:settle', 'org_bank', 'debit', 291150, 'pur_library', 'mem_23', 'pi_17', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_17_5', 'org_2007', 'pi_17:settle', 'clearing', 'credit', 291150, 'pur_library', 'mem_23', 'pi_17', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_17', 'org_2007', 'MF2007-0017', 'pi_17', 'The 2007 library', 300000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_18', 'org_2007', 'pur_library', 'mem_24', null, 35000, 35000, 683, 350, false, false, 'succeeded', 'seed_pi_18', now() - interval '13 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_18', 'org_2007', 'pi_18', 'test', 'seed_pi_18', '{"provider":"test","reference":"seed_pi_18","gift":35000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_18_0', 'org_2007', 'pi_18:pay', 'clearing', 'debit', 35000, 'pur_library', 'mem_24', 'pi_18', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_18_1', 'org_2007', 'pi_18:pay', 'fund', 'credit', 35000, 'pur_library', 'mem_24', 'pi_18', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_18_2', 'org_2007', 'pi_18:fee', 'fees_expense', 'debit', 1033, 'pur_library', 'mem_24', 'pi_18', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_18_3', 'org_2007', 'pi_18:fee', 'clearing', 'credit', 1033, 'pur_library', 'mem_24', 'pi_18', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_18_4', 'org_2007', 'pi_18:settle', 'org_bank', 'debit', 33967, 'pur_library', 'mem_24', 'pi_18', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_18_5', 'org_2007', 'pi_18:settle', 'clearing', 'credit', 33967, 'pur_library', 'mem_24', 'pi_18', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_18', 'org_2007', 'MF2007-0018', 'pi_18', 'The 2007 library', 35000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_19', 'org_2007', 'pur_library', 'mem_25', null, 70000, 70000, 1365, 700, false, false, 'succeeded', 'seed_pi_19', now() - interval '12 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_19', 'org_2007', 'pi_19', 'test', 'seed_pi_19', '{"provider":"test","reference":"seed_pi_19","gift":70000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_19_0', 'org_2007', 'pi_19:pay', 'clearing', 'debit', 70000, 'pur_library', 'mem_25', 'pi_19', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_19_1', 'org_2007', 'pi_19:pay', 'fund', 'credit', 70000, 'pur_library', 'mem_25', 'pi_19', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_19_2', 'org_2007', 'pi_19:fee', 'fees_expense', 'debit', 2065, 'pur_library', 'mem_25', 'pi_19', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_19_3', 'org_2007', 'pi_19:fee', 'clearing', 'credit', 2065, 'pur_library', 'mem_25', 'pi_19', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_19_4', 'org_2007', 'pi_19:settle', 'org_bank', 'debit', 67935, 'pur_library', 'mem_25', 'pi_19', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_19_5', 'org_2007', 'pi_19:settle', 'clearing', 'credit', 67935, 'pur_library', 'mem_25', 'pi_19', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_19', 'org_2007', 'MF2007-0019', 'pi_19', 'The 2007 library', 70000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_20', 'org_2007', 'pur_library', 'mem_26', null, 55000, 55000, 1073, 550, false, false, 'succeeded', 'seed_pi_20', now() - interval '11 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_20', 'org_2007', 'pi_20', 'test', 'seed_pi_20', '{"provider":"test","reference":"seed_pi_20","gift":55000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_20_0', 'org_2007', 'pi_20:pay', 'clearing', 'debit', 55000, 'pur_library', 'mem_26', 'pi_20', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_20_1', 'org_2007', 'pi_20:pay', 'fund', 'credit', 55000, 'pur_library', 'mem_26', 'pi_20', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_20_2', 'org_2007', 'pi_20:fee', 'fees_expense', 'debit', 1623, 'pur_library', 'mem_26', 'pi_20', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_20_3', 'org_2007', 'pi_20:fee', 'clearing', 'credit', 1623, 'pur_library', 'mem_26', 'pi_20', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_20_4', 'org_2007', 'pi_20:settle', 'org_bank', 'debit', 53377, 'pur_library', 'mem_26', 'pi_20', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_20_5', 'org_2007', 'pi_20:settle', 'clearing', 'credit', 53377, 'pur_library', 'mem_26', 'pi_20', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_20', 'org_2007', 'MF2007-0020', 'pi_20', 'The 2007 library', 55000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_21', 'org_2007', 'pur_library', 'mem_28', null, 90000, 90000, 1755, 900, false, false, 'succeeded', 'seed_pi_21', now() - interval '10 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_21', 'org_2007', 'pi_21', 'test', 'seed_pi_21', '{"provider":"test","reference":"seed_pi_21","gift":90000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_21_0', 'org_2007', 'pi_21:pay', 'clearing', 'debit', 90000, 'pur_library', 'mem_28', 'pi_21', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_21_1', 'org_2007', 'pi_21:pay', 'fund', 'credit', 90000, 'pur_library', 'mem_28', 'pi_21', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_21_2', 'org_2007', 'pi_21:fee', 'fees_expense', 'debit', 2655, 'pur_library', 'mem_28', 'pi_21', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_21_3', 'org_2007', 'pi_21:fee', 'clearing', 'credit', 2655, 'pur_library', 'mem_28', 'pi_21', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_21_4', 'org_2007', 'pi_21:settle', 'org_bank', 'debit', 87345, 'pur_library', 'mem_28', 'pi_21', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_21_5', 'org_2007', 'pi_21:settle', 'clearing', 'credit', 87345, 'pur_library', 'mem_28', 'pi_21', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_21', 'org_2007', 'MF2007-0021', 'pi_21', 'The 2007 library', 90000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_22', 'org_2007', 'pur_library', 'mem_29', null, 20000, 20000, 390, 200, false, false, 'succeeded', 'seed_pi_22', now() - interval '9 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_22', 'org_2007', 'pi_22', 'test', 'seed_pi_22', '{"provider":"test","reference":"seed_pi_22","gift":20000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_22_0', 'org_2007', 'pi_22:pay', 'clearing', 'debit', 20000, 'pur_library', 'mem_29', 'pi_22', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_22_1', 'org_2007', 'pi_22:pay', 'fund', 'credit', 20000, 'pur_library', 'mem_29', 'pi_22', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_22_2', 'org_2007', 'pi_22:fee', 'fees_expense', 'debit', 590, 'pur_library', 'mem_29', 'pi_22', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_22_3', 'org_2007', 'pi_22:fee', 'clearing', 'credit', 590, 'pur_library', 'mem_29', 'pi_22', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_22_4', 'org_2007', 'pi_22:settle', 'org_bank', 'debit', 19410, 'pur_library', 'mem_29', 'pi_22', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_22_5', 'org_2007', 'pi_22:settle', 'clearing', 'credit', 19410, 'pur_library', 'mem_29', 'pi_22', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_22', 'org_2007', 'MF2007-0022', 'pi_22', 'The 2007 library', 20000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_23', 'org_2007', 'pur_library', 'mem_30', null, 40000, 40000, 780, 400, false, false, 'succeeded', 'seed_pi_23', now() - interval '8 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_23', 'org_2007', 'pi_23', 'test', 'seed_pi_23', '{"provider":"test","reference":"seed_pi_23","gift":40000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_23_0', 'org_2007', 'pi_23:pay', 'clearing', 'debit', 40000, 'pur_library', 'mem_30', 'pi_23', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_23_1', 'org_2007', 'pi_23:pay', 'fund', 'credit', 40000, 'pur_library', 'mem_30', 'pi_23', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_23_2', 'org_2007', 'pi_23:fee', 'fees_expense', 'debit', 1180, 'pur_library', 'mem_30', 'pi_23', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_23_3', 'org_2007', 'pi_23:fee', 'clearing', 'credit', 1180, 'pur_library', 'mem_30', 'pi_23', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_23_4', 'org_2007', 'pi_23:settle', 'org_bank', 'debit', 38820, 'pur_library', 'mem_30', 'pi_23', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_23_5', 'org_2007', 'pi_23:settle', 'clearing', 'credit', 38820, 'pur_library', 'mem_30', 'pi_23', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_23', 'org_2007', 'MF2007-0023', 'pi_23', 'The 2007 library', 40000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_24', 'org_2007', 'pur_library', 'mem_31', null, 15000, 15000, 293, 150, false, false, 'succeeded', 'seed_pi_24', now() - interval '7 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_24', 'org_2007', 'pi_24', 'test', 'seed_pi_24', '{"provider":"test","reference":"seed_pi_24","gift":15000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_24_0', 'org_2007', 'pi_24:pay', 'clearing', 'debit', 15000, 'pur_library', 'mem_31', 'pi_24', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_24_1', 'org_2007', 'pi_24:pay', 'fund', 'credit', 15000, 'pur_library', 'mem_31', 'pi_24', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_24_2', 'org_2007', 'pi_24:fee', 'fees_expense', 'debit', 443, 'pur_library', 'mem_31', 'pi_24', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_24_3', 'org_2007', 'pi_24:fee', 'clearing', 'credit', 443, 'pur_library', 'mem_31', 'pi_24', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_24_4', 'org_2007', 'pi_24:settle', 'org_bank', 'debit', 14557, 'pur_library', 'mem_31', 'pi_24', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_24_5', 'org_2007', 'pi_24:settle', 'clearing', 'credit', 14557, 'pur_library', 'mem_31', 'pi_24', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_24', 'org_2007', 'MF2007-0024', 'pi_24', 'The 2007 library', 15000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_25', 'org_2007', 'pur_library', 'mem_32', null, 120000, 120000, 2340, 1200, false, false, 'succeeded', 'seed_pi_25', now() - interval '6 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_25', 'org_2007', 'pi_25', 'test', 'seed_pi_25', '{"provider":"test","reference":"seed_pi_25","gift":120000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_25_0', 'org_2007', 'pi_25:pay', 'clearing', 'debit', 120000, 'pur_library', 'mem_32', 'pi_25', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_25_1', 'org_2007', 'pi_25:pay', 'fund', 'credit', 120000, 'pur_library', 'mem_32', 'pi_25', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_25_2', 'org_2007', 'pi_25:fee', 'fees_expense', 'debit', 3540, 'pur_library', 'mem_32', 'pi_25', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_25_3', 'org_2007', 'pi_25:fee', 'clearing', 'credit', 3540, 'pur_library', 'mem_32', 'pi_25', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_25_4', 'org_2007', 'pi_25:settle', 'org_bank', 'debit', 116460, 'pur_library', 'mem_32', 'pi_25', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_25_5', 'org_2007', 'pi_25:settle', 'clearing', 'credit', 116460, 'pur_library', 'mem_32', 'pi_25', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_25', 'org_2007', 'MF2007-0025', 'pi_25', 'The 2007 library', 120000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_26', 'org_2007', 'pur_library', 'mem_34', null, 25000, 25000, 488, 250, false, false, 'succeeded', 'seed_pi_26', now() - interval '5 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_26', 'org_2007', 'pi_26', 'test', 'seed_pi_26', '{"provider":"test","reference":"seed_pi_26","gift":25000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_26_0', 'org_2007', 'pi_26:pay', 'clearing', 'debit', 25000, 'pur_library', 'mem_34', 'pi_26', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_26_1', 'org_2007', 'pi_26:pay', 'fund', 'credit', 25000, 'pur_library', 'mem_34', 'pi_26', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_26_2', 'org_2007', 'pi_26:fee', 'fees_expense', 'debit', 738, 'pur_library', 'mem_34', 'pi_26', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_26_3', 'org_2007', 'pi_26:fee', 'clearing', 'credit', 738, 'pur_library', 'mem_34', 'pi_26', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_26_4', 'org_2007', 'pi_26:settle', 'org_bank', 'debit', 24262, 'pur_library', 'mem_34', 'pi_26', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_26_5', 'org_2007', 'pi_26:settle', 'clearing', 'credit', 24262, 'pur_library', 'mem_34', 'pi_26', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_26', 'org_2007', 'MF2007-0026', 'pi_26', 'The 2007 library', 25000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_27', 'org_2007', 'pur_library', 'mem_35', null, 40000, 40000, 780, 400, false, false, 'succeeded', 'seed_pi_27', now() - interval '4 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_27', 'org_2007', 'pi_27', 'test', 'seed_pi_27', '{"provider":"test","reference":"seed_pi_27","gift":40000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_27_0', 'org_2007', 'pi_27:pay', 'clearing', 'debit', 40000, 'pur_library', 'mem_35', 'pi_27', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_27_1', 'org_2007', 'pi_27:pay', 'fund', 'credit', 40000, 'pur_library', 'mem_35', 'pi_27', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_27_2', 'org_2007', 'pi_27:fee', 'fees_expense', 'debit', 1180, 'pur_library', 'mem_35', 'pi_27', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_27_3', 'org_2007', 'pi_27:fee', 'clearing', 'credit', 1180, 'pur_library', 'mem_35', 'pi_27', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_27_4', 'org_2007', 'pi_27:settle', 'org_bank', 'debit', 38820, 'pur_library', 'mem_35', 'pi_27', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_27_5', 'org_2007', 'pi_27:settle', 'clearing', 'credit', 38820, 'pur_library', 'mem_35', 'pi_27', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_27', 'org_2007', 'MF2007-0027', 'pi_27', 'The 2007 library', 40000, '2026-09-01', false
  );
insert into payment_intent (id, organisation_id, purpose_id, membership_id, pledge_id, gift_pesewas, charge_pesewas, gateway_fee_pesewas, platform_fee_pesewas, cover_fees, anonymous, status, reference, created_at) values (
    'pi_28', 'org_2007', 'pur_library', 'mem_36', null, 60000, 60000, 1170, 600, false, false, 'succeeded', 'seed_pi_28', now() - interval '3 days'
  );
insert into gateway_event (id, organisation_id, intent_id, provider, reference, raw) values ('ge_pi_28', 'org_2007', 'pi_28', 'test', 'seed_pi_28', '{"provider":"test","reference":"seed_pi_28","gift":60000}'::jsonb);
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_28_0', 'org_2007', 'pi_28:pay', 'clearing', 'debit', 60000, 'pur_library', 'mem_36', 'pi_28', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_28_1', 'org_2007', 'pi_28:pay', 'fund', 'credit', 60000, 'pur_library', 'mem_36', 'pi_28', 'Test gateway pay'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_28_2', 'org_2007', 'pi_28:fee', 'fees_expense', 'debit', 1770, 'pur_library', 'mem_36', 'pi_28', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_28_3', 'org_2007', 'pi_28:fee', 'clearing', 'credit', 1770, 'pur_library', 'mem_36', 'pi_28', 'Test gateway fee'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_28_4', 'org_2007', 'pi_28:settle', 'org_bank', 'debit', 58230, 'pur_library', 'mem_36', 'pi_28', 'Test gateway settle'
    );
insert into ledger_entry (id, organisation_id, txn_id, account, direction, amount_pesewas, purpose_id, membership_id, intent_id, memo) values (
      'le_pi_28_5', 'org_2007', 'pi_28:settle', 'clearing', 'credit', 58230, 'pur_library', 'mem_36', 'pi_28', 'Test gateway settle'
    );
insert into receipt (id, organisation_id, number, intent_id, purpose_title, amount_pesewas, issued_on, voided) values (
    'rc_pi_28', 'org_2007', 'MF2007-0028', 'pi_28', 'The 2007 library', 60000, '2026-09-01', false
  );
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_1', 'org_2007', 'cir_h_balmer', 'mem_01', 'Upper Balmer, Saturday at Labadi. Bring the old house jersey if you still have it.', now() - interval '2 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_2', 'org_2007', 'cir_h_freeman', 'mem_09', 'Freeman, the one-week plan is on the board. Cape Coast, not a hotel lobby.', now() - interval '1 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_3', 'org_2007', 'cir_year', 'mem_17', 'The dinner is 5 December in Accra. Ticket is in Give. Come as you are, nickname and all.', now() - interval '3 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_4', 'org_2007', 'cir_h_pickard', 'mem_22', 'Training game Sunday 6am, El-Wak outer field. No speech, just boots.', now() - interval '4 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_5', 'org_2007', 'cir_c_balmer_upper_3', 'mem_02', 'Cot 3, I kept the list. Two of us are still missing from the roll.', now() - interval '5 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_6', 'org_2007', 'cir_h_sarbah', 'mem_28', 'If you are passing through Osu this month, the hotel can hold a small table.', now() - interval '6 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_7', 'org_2007', 'cir_builders', 'mem_08', 'I need a site engineer for three weeks in East Legon. Old boy first.', now() - interval '2 days');
insert into post (id, organisation_id, circle_id, author_membership_id, body, created_at) values ('post_8', 'org_2007', 'cir_year', 'mem_12', 'The library shelves are the point. Give quietly if you prefer. The house still gets the credit.', now() - interval '7 days');
insert into hub_event (id, organisation_id, circle_id, title, place, starts_at, story, price_pesewas, purpose_id, capacity) values
  ('ev_cot', 'org_2007', 'cir_c_balmer_upper_3', 'Cot 3 reunion', 'Labadi, Accra', '2026-11-14 15:00+00', 'A Saturday for Cot 3, Upper Balmer-Acquaah. No agenda past the first hour.', null, null, 24),
  ('ev_dinner', 'org_2007', 'cir_year', 'Founders dinner', 'Accra', '2026-12-05 18:00+00', 'One sitting for the year group. Pay for a ticket, then your seat is kept.', 25000, 'pur_dinner', 120),
  ('ev_freeman', 'org_2007', 'cir_h_freeman', 'Freeman planning afternoon', 'Cape Coast', '2026-10-25 13:00+00', 'The house meets on the hill, not in a group chat.', null, null, 40),
  ('ev_walk', 'org_2007', 'cir_h_pickard', 'Pickard walk', 'Aburi', '2026-11-02 07:00+00', 'A slow walk. Bring water.', null, null, 30);
insert into rsvp (event_id, membership_id, status) values ('ev_cot', 'mem_01', 'going');
insert into rsvp (event_id, membership_id, status) values ('ev_cot', 'mem_02', 'going');
insert into rsvp (event_id, membership_id, status) values ('ev_freeman', 'mem_09', 'going');
insert into rsvp (event_id, membership_id, status) values ('ev_walk', 'mem_22', 'maybe');
insert into rsvp (event_id, membership_id, status) values ('ev_dinner', 'mem_17', 'going');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_1', 'org_2007', 'mem_08', 'Darko Sites', 'Building', 'Accra', '+233200000007', 'Residential blocks. Old boys get a straight estimate.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_2', 'org_2007', 'mem_12', 'Osei Verandah', 'Architecture', 'Accra', '+233200000011', 'Houses that breathe. Small commissions welcome.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_3', 'org_2007', 'mem_24', 'Silk & Stitch', 'Textile', 'Accra', '+233200000023', 'Cloth, school colours done properly, no plastic crests.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_4', 'org_2007', 'mem_21', 'Pepper Pharmacy', 'Health', 'Accra', '+233200000020', 'A neighbourhood pharmacy. Ask for Kwame.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_5', 'org_2007', 'mem_28', 'Sugar Rooms', 'Hospitality', 'Accra', '+233200000027', 'Short stays in Osu when the dinner comes around.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_6', 'org_2007', 'mem_18', 'Chisel Workshop', 'Furniture', 'Winneba', '+233200000017', 'Tables and doors in odum.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_7', 'org_2007', 'mem_01', 'Mensah Measure', 'Engineering', 'Accra', '+233200000000', 'Civil works and careful quantities.');
insert into business (id, organisation_id, membership_id, name, category, city, contact, blurb) values ('biz_8', 'org_2007', 'mem_36', 'Ext Software', 'Technology', 'Accra', '+233200000035', 'Small tools for Ghanaian businesses.');
insert into business_support (business_id, membership_id) values ('biz_1', 'mem_03');
insert into business_support (business_id, membership_id) values ('biz_1', 'mem_09');
insert into business_support (business_id, membership_id) values ('biz_2', 'mem_01');
insert into business_support (business_id, membership_id) values ('biz_3', 'mem_12');
insert into business_support (business_id, membership_id) values ('biz_5', 'mem_08');
insert into business_support (business_id, membership_id) values ('biz_8', 'mem_17');
insert into ask (id, organisation_id, membership_id, category, title, body, circle_id, created_at) values ('ask_1', 'org_2007', 'mem_08', 'supplier', 'Who supplies good dumas in Accra?', 'I need a steady supplier for a site canteen. Someone we know.', 'cir_builders', now() - interval '1 days');
insert into ask (id, organisation_id, membership_id, category, title, body, circle_id, created_at) values ('ask_2', 'org_2007', 'mem_01', 'employment', 'Site engineer for three weeks', 'East Legon. Old boy if we can. Experience with concrete, not a title.', 'cir_builders', now() - interval '2 days');
insert into ask (id, organisation_id, membership_id, category, title, body, circle_id, created_at) values ('ask_3', 'org_2007', 'mem_21', 'mentoring', 'A pharmacist to talk to a cousin', 'He is choosing courses. Not a job. Twenty minutes.', 'cir_year', now() - interval '3 days');
insert into ask (id, organisation_id, membership_id, category, title, body, circle_id, created_at) values ('ask_4', 'org_2007', 'mem_29', 'housing', 'A clean room for three months', 'East Legon or Adjiringanor. He is a cousin, not a crowd.', 'cir_accra', now() - interval '4 days');
insert into ask_reply (id, ask_id, membership_id, body, recommended) values
  ('ar_1', 'ask_1', 'mem_14', 'Stones can point you to the woman at Madina market. Tell her Freeman sent you.', true),
  ('ar_2', 'ask_2', 'mem_10', 'I can do two of the three weeks. Engine, Freeman.', false);
insert into album (id, organisation_id, title, year, caption, motif) values ('alb_1', 'org_2007', 'House one-week', 2006, 'The week the houses took the hill.', 'field');
insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values ('ph_1', 'org_2007', 'alb_1', 'The week the houses took the hill.', 'field', 'mem_01');
insert into album (id, organisation_id, title, year, caption, motif) values ('alb_2', 'org_2007', 'Cape Coast Saturday', 2005, 'Town, then back before prep.', 'cape');
insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values ('ph_2', 'org_2007', 'alb_2', 'Town, then back before prep.', 'cape', 'mem_02');
insert into album (id, organisation_id, title, year, caption, motif) values ('alb_3', 'org_2007', 'The bench', 2006, 'NSMQ season. We watched more than we played.', 'class');
insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values ('ph_3', 'org_2007', 'alb_3', 'NSMQ season. We watched more than we played.', 'class', 'mem_03');
insert into album (id, organisation_id, title, year, caption, motif) values ('alb_4', 'org_2007', 'Dining hall', 2004, 'The queue, the bell, the same stew.', 'dorm');
insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values ('ph_4', 'org_2007', 'alb_4', 'The queue, the bell, the same stew.', 'dorm', 'mem_04');
insert into album (id, organisation_id, title, year, caption, motif) values ('alb_5', 'org_2007', 'Founders day', 2007, 'The last founders day we attended as boys.', 'chapel');
insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values ('ph_5', 'org_2007', 'alb_5', 'The last founders day we attended as boys.', 'chapel', 'mem_05');
insert into album (id, organisation_id, title, year, caption, motif) values ('alb_6', 'org_2007', 'House jerseys', 2007, 'Six houses, one hill.', 'jersey');
insert into photo (id, organisation_id, album_id, caption, motif, author_membership_id) values ('ph_6', 'org_2007', 'alb_6', 'Six houses, one hill.', 'jersey', 'mem_06');
insert into photo_tag (photo_id, membership_id) values ('ph_1', 'mem_01'), ('ph_6', 'mem_09');
insert into poll (id, organisation_id, circle_id, question, closes_on) values
  ('poll_city', 'org_2007', 'cir_year', 'Where should the 2027 reunion sit?', '2026-11-30');
insert into poll_option (id, poll_id, label, sort) values ('po_1', 'poll_city', 'Accra', 1);
insert into poll_option (id, poll_id, label, sort) values ('po_2', 'poll_city', 'Cape Coast', 2);
insert into poll_option (id, poll_id, label, sort) values ('po_3', 'poll_city', 'Kumasi', 3);
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_01');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_02');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_03');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_2', 'mem_04');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_08');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_2', 'mem_09');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_11');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_2', 'mem_17');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_21');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_3', 'mem_22');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_2', 'mem_28');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_12');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_3', 'mem_36');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_2', 'mem_05');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_1', 'mem_19');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_3', 'mem_25');
insert into poll_vote (poll_id, option_id, membership_id) values ('poll_city', 'po_2', 'mem_29');
insert into announcement (id, organisation_id, author_membership_id, audience, body) values
  ('an_1', 'org_2007', 'mem_17', 'Class of 2007', 'Register so your house is not empty on the roll. The founders dinner is 5 December in Accra.');
insert into outbox (id, organisation_id, membership_id, template_key, payload, idempotency_key, status, channel, attempts, last_error) values
  ('ob_1', 'org_2007', 'mem_17', 'announcement', '{"title":"Dinner"}'::jsonb, 'seed-ob-1', 'delivered', 'in_app', 1, null),
  ('ob_2', 'org_2007', 'mem_01', 'receipt', '{"number":"MF2007-0001"}'::jsonb, 'seed-ob-2', 'held_no_provider', 'sms', 0, 'SMS provider is not connected');
insert into welfare_request (id, organisation_id, membership_id, category, body, status) values
  ('wf_1', 'org_2007', 'mem_16', 'medical', 'A medical bill in the family. I have sent the papers to the secretary. Please keep this off the board.', 'open');
insert into mentor_offer (id, organisation_id, membership_id, field, kind, note) values
  ('mn_1', 'org_2007', 'mem_01', 'Civil engineering', 'offer', 'I can take one younger cousin through a site visit.'),
  ('mn_2', 'org_2007', 'mem_21', 'Pharmacy', 'offer', 'Course choice, not a job placement.'),
  ('mn_3', 'org_2007', 'mem_36', 'Software', 'seek', 'Looking for a product person who has shipped in Ghana.');
insert into election (id, organisation_id, role_name, blurb, status, closes_on) values
  ('el_1', 'org_2007', 'Assistant secretary', 'A two-year seat beside the secretary. Nominations are open. The ballot is secret.', 'open', '2026-12-20');
insert into nomination (id, election_id, membership_id, statement) values
  ('nom_1', 'el_1', 'mem_13', 'I will keep the minutes short and the dates honest.'),
  ('nom_2', 'el_1', 'mem_25', 'I already chase RSVPs. I may as well be asked.');
insert into ballot (election_id, voter_membership_id, nomination_id) values ('el_1', 'mem_01', 'nom_1');
insert into ballot (election_id, voter_membership_id, nomination_id) values ('el_1', 'mem_02', 'nom_2');
insert into ballot (election_id, voter_membership_id, nomination_id) values ('el_1', 'mem_09', 'nom_1');
insert into ballot (election_id, voter_membership_id, nomination_id) values ('el_1', 'mem_22', 'nom_2');
insert into ballot (election_id, voter_membership_id, nomination_id) values ('el_1', 'mem_28', 'nom_1');
insert into product (id, organisation_id, name, blurb, price_pesewas, stock, motif) values
  ('prd_jersey', 'org_2007', 'Year jersey', 'Crimson, with 2007 on the chest. Not a replica of a match kit.', 18000, 80, 'jersey'),
  ('prd_hoodie', 'org_2007', 'Hoodie', 'Heavy enough for Accra rain. Quiet mark, no slogan.', 24000, 40, 'hoodie'),
  ('prd_tie', 'org_2007', 'Crest tie', 'For the dinner. A year-group mark, not the school arms.', 8000, 60, 'tie');
insert into trivia_question (id, organisation_id, prompt, choices, answer_index, sort) values ('tq_1', 'org_2007', 'Mfantsipim stands in which town?', '["Cape Coast","Kumasi","Accra","Takoradi"]'::jsonb, 0, 1);
insert into trivia_question (id, organisation_id, prompt, choices, answer_index, sort) values ('tq_2', 'org_2007', 'Which year was the school founded?', '["1876","1901","1927","1854"]'::jsonb, 0, 2);
insert into trivia_question (id, organisation_id, prompt, choices, answer_index, sort) values ('tq_3', 'org_2007', 'Dwin Hwe Kan means?', '["Think and look ahead","Forward ever","Knowledge is power","Unity is strength"]'::jsonb, 0, 3);
insert into trivia_question (id, organisation_id, prompt, choices, answer_index, sort) values ('tq_4', 'org_2007', 'Old boys call it?', '["The School","The College","The Yard","The Academy"]'::jsonb, 0, 4);
insert into trivia_question (id, organisation_id, prompt, choices, answer_index, sort) values ('tq_5', 'org_2007', 'It is remembered as the first secondary school in?', '["Ghana","Nigeria","Sierra Leone","Liberia"]'::jsonb, 0, 5);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_1', 'mem_01', 0, true);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_1', 'mem_09', 0, true);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_2', 'mem_09', 0, true);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_1', 'mem_22', 1, false);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_3', 'mem_15', 0, true);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_4', 'mem_28', 0, true);
insert into trivia_answer (question_id, membership_id, choice, correct) values ('tq_1', 'mem_08', 0, true);
insert into capsule (id, organisation_id, membership_id, circle_id, title, body, seals_until) values
  ('cap_1', 'org_2007', 'mem_02', 'cir_year', 'For the 25-year reunion', 'If you are reading this in 2032, check the library shelves before you check the photos. We said we would finish them.', '2032-04-08'),
  ('cap_2', 'org_2007', 'mem_12', 'cir_h_freeman', 'A note from 2017', 'Freeman, do not let the house become a WhatsApp group only. Meet once a year on the hill.', '2026-01-01');
insert into milestone (id, organisation_id, membership_id, kind, body) values
  ('ms_1', 'org_2007', 'mem_36', 'work', 'Ext Software took its first paying client outside the family.'),
  ('ms_2', 'org_2007', 'mem_24', 'business', 'Silk and Stitch opened a second shop.'),
  ('ms_3', 'org_2007', 'mem_08', 'work', 'Darko Sites handed over a small block in East Legon.');
insert into spotlight (id, organisation_id, membership_id, story, consented, published) values
  ('sp_1', 'org_2007', 'mem_12', 'Nana Yaw Osei, Chief, draws houses that keep their verandahs. He agreed to be featured. The secretary wrote this, he did not.', true, true);
insert into expense (id, organisation_id, requester_membership_id, amount_pesewas, memo, status) values
  ('ex_1', 'org_2007', 'mem_08', 45000, 'Printing the reunion cards', 'submitted'),
  ('ex_2', 'org_2007', 'mem_17', 350000, 'Bus to Cape Coast for the house afternoon', 'submitted');
insert into refund (id, organisation_id, intent_id, amount_pesewas, reason, status, requester_membership_id) values
  ('rf_1', 'org_2007', 'pi_04', 10000, 'Kojo asked to reduce his gift after a duplicate transfer.', 'awaiting_approval', 'mem_11');
insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values ('imp_1', 'org_2007', '{"name":"Kweku Boateng","status":"imported"}'::jsonb, 'Kweku Boateng', '+23324000100', 'imported', 'Row kept exactly as uploaded.');
insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values ('imp_2', 'org_2007', '{"name":"Yaw Acquaah","status":"normalised"}'::jsonb, 'Yaw Acquaah', '+23324000101', 'normalised', 'House name matched Balmer-Acquaah from an alias.');
insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values ('imp_3', 'org_2007', '{"name":"Kwame Mensah","status":"suspected_duplicate"}'::jsonb, 'Kwame Mensah', '+23324000102', 'suspected_duplicate', 'Close to a verified Kwame Mensah. Needs a human decision.');
insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values ('imp_4', 'org_2007', '{"name":"Ato Blank","status":"needs_review"}'::jsonb, 'Ato Blank', '+23324000103', 'needs_review', 'Class cell was empty.');
insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values ('imp_5', 'org_2007', '{"name":"Fiifi Cole","status":"approved"}'::jsonb, 'Fiifi Cole', '+23324000104', 'approved', 'Accepted. No claim link sent yet.');
insert into import_row (id, organisation_id, raw, display_name, phone, status, note) values ('imp_6', 'org_2007', '{"name":"Paa Kwesi Dodoo","status":"invited"}'::jsonb, 'Paa Kwesi Dodoo', '+23324000105', 'invited', 'Claim link is waiting. SMS is not connected, so it sits in the outbox.');
insert into audit_log (id, organisation_id, actor_membership_id, action, detail) values
  ('au_1', 'org_2007', 'mem_17', 'import_approved', 'Fiifi Cole accepted from the cohort sheet.'),
  ('au_2', 'org_2007', 'mem_19', 'role_assigned', 'Sample officers seated for the preview. They are not real accounts.');
insert into usage_event (id, organisation_id, membership_id, stage, name, detail) values
  ('us_1', 'org_2007', null, 'acquisition', 'registration_completed', 'sample baseline'),
  ('us_2', 'org_2007', 'mem_01', 'money', 'payment_completed', 'library'),
  ('us_3', 'org_2007', 'mem_09', 'community', 'first_post', 'freeman');
insert into report (id, organisation_id, post_id, membership_id, reason, status) values
  ('rp_1', 'org_2007', 'post_4', 'mem_25', 'This is a time and a place, not a complaint. Left here so the queue is not empty.', 'open');
