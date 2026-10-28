-- Mfantsipim 2007: generated from config/organisations/mfantsipim-2007.json by scripts/provision-sql.ts
insert into organisation (id, slug, name, type, terminology, branding, verification_rule, min_givers, enabled_modules, payment_mode,
                              gateway_fee_bps, platform_fee_bps, reverse_platform_fee_on_refund, expense_two_approver_pesewas, listed, receipt_prefix)
    values ('org_mfantsipim_2007', 'mfantsipim-2007', 'Mfantsipim 2007', 'school_year', '{"member":"old boy","members":"old boys","house":"House","dorm":"Dorm","cot":"Cot","programme":"Programme","class":"Class","year":"Year group"}'::jsonb, '{"motto":"Dwen Hwe Kan","shortName":"Mfantsipim 2007","place":"Cape Coast","founded":"1876","paper":"#F3EEE6","ink":"#1C1412","crimson":"#7A1C2E","gold":"#6F5424"}'::jsonb, 'two_cot_peers_or_executive',
            5, '["people","structure","circles","money","events","directory","governance","welfare","store","impact","photos","asks","polls","trivia","mentoring","capsules","elections"]'::jsonb, 'test', 195, 100,
            false, 200000, true, 'MF2007');
insert into receipt_counter (organisation_id, n) values ('org_mfantsipim_2007', 0) on conflict do nothing;
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_year', 'org_mfantsipim_2007', 'derived', 'open', null, 'Mfantsipim 2007', 'Everyone in the year group.', 'year');
insert into structure_dimension (id, organisation_id, key, name, sort) values ('org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007', 'residence', 'Residence', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_balmer_acquaah', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', null, 'house', 'Balmer-Acquaah', null, 'balmer_acquaah', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_balmer_acquaah_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_balmer_acquaah', 'Balmer-Acquaah', '', 'house-balmer_acquaah');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_balmer_acquaah_a_balmeracquaah', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_balmer_acquaah', 'Balmer-Acquaah', 'balmeracquaah');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_balmer_acquaah_a_balmer', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_balmer_acquaah', 'Balmer', 'balmer');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_balmer_acquaah_a_acquaah', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_balmer_acquaah', 'Acquaah', 'acquaah');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah', 'dorm', 'Upper', 8, 'balmer_acquaah.upper', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'Upper', '', 'dorm-balmer_acquaah-upper');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '1', null, 'balmer_acquaah.upper.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '2', null, 'balmer_acquaah.upper.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '3', null, 'balmer_acquaah.upper.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '4', null, 'balmer_acquaah.upper.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '5', null, 'balmer_acquaah.upper.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '6', null, 'balmer_acquaah.upper.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '7', null, 'balmer_acquaah.upper.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_upper_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_upper', 'cot', '8', null, 'balmer_acquaah.upper.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah', 'dorm', 'Lower', 8, 'balmer_acquaah.lower', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'Lower', '', 'dorm-balmer_acquaah-lower');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '1', null, 'balmer_acquaah.lower.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '2', null, 'balmer_acquaah.lower.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '3', null, 'balmer_acquaah.lower.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '4', null, 'balmer_acquaah.lower.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '5', null, 'balmer_acquaah.lower.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '6', null, 'balmer_acquaah.lower.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '7', null, 'balmer_acquaah.lower.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_balmer_acquaah_lower_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_balmer_acquaah_lower', 'cot', '8', null, 'balmer_acquaah.lower.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_freeman_aggrey', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', null, 'house', 'Freeman-Aggrey', null, 'freeman_aggrey', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_freeman_aggrey_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_freeman_aggrey', 'Freeman-Aggrey', '', 'house-freeman_aggrey');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_freeman_aggrey_a_freemanaggrey', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_freeman_aggrey', 'Freeman-Aggrey', 'freemanaggrey');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_freeman_aggrey_a_freeman', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_freeman_aggrey', 'Freeman', 'freeman');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_freeman_aggrey_a_aggrey', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_freeman_aggrey', 'Aggrey', 'aggrey');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey', 'dorm', 'Upper', 8, 'freeman_aggrey.upper', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'Upper', '', 'dorm-freeman_aggrey-upper');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '1', null, 'freeman_aggrey.upper.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '2', null, 'freeman_aggrey.upper.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '3', null, 'freeman_aggrey.upper.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '4', null, 'freeman_aggrey.upper.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '5', null, 'freeman_aggrey.upper.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '6', null, 'freeman_aggrey.upper.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '7', null, 'freeman_aggrey.upper.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_upper_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_upper', 'cot', '8', null, 'freeman_aggrey.upper.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey', 'dorm', 'Lower', 8, 'freeman_aggrey.lower', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'Lower', '', 'dorm-freeman_aggrey-lower');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '1', null, 'freeman_aggrey.lower.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '2', null, 'freeman_aggrey.lower.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '3', null, 'freeman_aggrey.lower.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '4', null, 'freeman_aggrey.lower.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '5', null, 'freeman_aggrey.lower.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '6', null, 'freeman_aggrey.lower.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '7', null, 'freeman_aggrey.lower.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_freeman_aggrey_lower_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_freeman_aggrey_lower', 'cot', '8', null, 'freeman_aggrey.lower.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', null, 'house', 'Lockhart-Schweitzer', null, 'lockhart_schweitzer', 3);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'Lockhart-Schweitzer', '', 'house-lockhart_schweitzer');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_a_lockhartschweitzer', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'Lockhart-Schweitzer', 'lockhartschweitzer');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_a_lockhart', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'Lockhart', 'lockhart');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_a_schweitzer', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'Schweitzer', 'schweitzer');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'dorm', 'Upper', 8, 'lockhart_schweitzer.upper', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'Upper', '', 'dorm-lockhart_schweitzer-upper');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '1', null, 'lockhart_schweitzer.upper.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '2', null, 'lockhart_schweitzer.upper.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '3', null, 'lockhart_schweitzer.upper.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '4', null, 'lockhart_schweitzer.upper.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '5', null, 'lockhart_schweitzer.upper.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '6', null, 'lockhart_schweitzer.upper.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '7', null, 'lockhart_schweitzer.upper.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_upper', 'cot', '8', null, 'lockhart_schweitzer.upper.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer', 'dorm', 'Lower', 8, 'lockhart_schweitzer.lower', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'Lower', '', 'dorm-lockhart_schweitzer-lower');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '1', null, 'lockhart_schweitzer.lower.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '2', null, 'lockhart_schweitzer.lower.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '3', null, 'lockhart_schweitzer.lower.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '4', null, 'lockhart_schweitzer.lower.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '5', null, 'lockhart_schweitzer.lower.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '6', null, 'lockhart_schweitzer.lower.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '7', null, 'lockhart_schweitzer.lower.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_lockhart_schweitzer_lower', 'cot', '8', null, 'lockhart_schweitzer.lower.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_pickard_parker', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', null, 'house', 'Pickard-Parker', null, 'pickard_parker', 4);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_pickard_parker_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_pickard_parker', 'Pickard-Parker', '', 'house-pickard_parker');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_pickard_parker_a_pickardparker', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_pickard_parker', 'Pickard-Parker', 'pickardparker');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_pickard_parker_a_pickard', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_pickard_parker', 'Pickard', 'pickard');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_pickard_parker_a_parker', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_pickard_parker', 'Parker', 'parker');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_pickard_parker_upper', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker', 'dorm', 'Upper', 8, 'pickard_parker.upper', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'Upper', '', 'dorm-pickard_parker-upper');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '1', null, 'pickard_parker.upper.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '2', null, 'pickard_parker.upper.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '3', null, 'pickard_parker.upper.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '4', null, 'pickard_parker.upper.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '5', null, 'pickard_parker.upper.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '6', null, 'pickard_parker.upper.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '7', null, 'pickard_parker.upper.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_upper_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_upper', 'cot', '8', null, 'pickard_parker.upper.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_pickard_parker_lower', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker', 'dorm', 'Lower', 8, 'pickard_parker.lower', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'Lower', '', 'dorm-pickard_parker-lower');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '1', null, 'pickard_parker.lower.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '2', null, 'pickard_parker.lower.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '3', null, 'pickard_parker.lower.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '4', null, 'pickard_parker.lower.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '5', null, 'pickard_parker.lower.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '6', null, 'pickard_parker.lower.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '7', null, 'pickard_parker.lower.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_pickard_parker_lower_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_pickard_parker_lower', 'cot', '8', null, 'pickard_parker.lower.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_sarbah_picot', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', null, 'house', 'Sarbah-Picot', null, 'sarbah_picot', 5);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_sarbah_picot_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_sarbah_picot', 'Sarbah-Picot', '', 'house-sarbah_picot');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_sarbah_picot_a_sarbahpicot', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_sarbah_picot', 'Sarbah-Picot', 'sarbahpicot');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_sarbah_picot_a_sarbah', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_sarbah_picot', 'Sarbah', 'sarbah');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_sarbah_picot_a_picot', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_sarbah_picot', 'Picot', 'picot');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot', 'dorm', 'Upper', 8, 'sarbah_picot.upper', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'Upper', '', 'dorm-sarbah_picot-upper');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '1', null, 'sarbah_picot.upper.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '2', null, 'sarbah_picot.upper.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '3', null, 'sarbah_picot.upper.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '4', null, 'sarbah_picot.upper.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '5', null, 'sarbah_picot.upper.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '6', null, 'sarbah_picot.upper.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '7', null, 'sarbah_picot.upper.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_upper_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_upper', 'cot', '8', null, 'sarbah_picot.upper.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot', 'dorm', 'Lower', 8, 'sarbah_picot.lower', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'Lower', '', 'dorm-sarbah_picot-lower');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '1', null, 'sarbah_picot.lower.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '2', null, 'sarbah_picot.lower.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '3', null, 'sarbah_picot.lower.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '4', null, 'sarbah_picot.lower.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '5', null, 'sarbah_picot.lower.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '6', null, 'sarbah_picot.lower.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '7', null, 'sarbah_picot.lower.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_sarbah_picot_lower_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_sarbah_picot_lower', 'cot', '8', null, 'sarbah_picot.lower.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_bartels_sneath', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', null, 'house', 'Bartels-Sneath', null, 'bartels_sneath', 6);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_bartels_sneath_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'Bartels-Sneath', '', 'house-bartels_sneath');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_bartels_sneath_a_bartelssneath', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'Bartels-Sneath', 'bartelssneath');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_bartels_sneath_a_bartels', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'Bartels', 'bartels');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_residence_bartels_sneath_a_sneath', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'Sneath', 'sneath');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'dorm', 'Upper', 8, 'bartels_sneath.upper', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'Upper', '', 'dorm-bartels_sneath-upper');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '1', null, 'bartels_sneath.upper.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '2', null, 'bartels_sneath.upper.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '3', null, 'bartels_sneath.upper.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '4', null, 'bartels_sneath.upper.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '5', null, 'bartels_sneath.upper.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '6', null, 'bartels_sneath.upper.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '7', null, 'bartels_sneath.upper.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_upper_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_upper', 'cot', '8', null, 'bartels_sneath.upper.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'dorm', 'Middle', 8, 'bartels_sneath.middle', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'Middle', '', 'dorm-bartels_sneath-middle');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '1', null, 'bartels_sneath.middle.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '2', null, 'bartels_sneath.middle.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '3', null, 'bartels_sneath.middle.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '4', null, 'bartels_sneath.middle.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '5', null, 'bartels_sneath.middle.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '6', null, 'bartels_sneath.middle.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '7', null, 'bartels_sneath.middle.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_middle_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_middle', 'cot', '8', null, 'bartels_sneath.middle.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'dorm', 'Lower', 8, 'bartels_sneath.lower', 3);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'Lower', '', 'dorm-bartels_sneath-lower');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '1', null, 'bartels_sneath.lower.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '2', null, 'bartels_sneath.lower.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '3', null, 'bartels_sneath.lower.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '4', null, 'bartels_sneath.lower.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '5', null, 'bartels_sneath.lower.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '6', null, 'bartels_sneath.lower.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '7', null, 'bartels_sneath.lower.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_lower_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_lower', 'cot', '8', null, 'bartels_sneath.lower.c_8', 8);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath', 'dorm', 'Extension', 8, 'bartels_sneath.extension', 4);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'Extension', '', 'dorm-bartels_sneath-extension');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '1', null, 'bartels_sneath.extension.c_1', 1);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '2', null, 'bartels_sneath.extension.c_2', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '3', null, 'bartels_sneath.extension.c_3', 3);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '4', null, 'bartels_sneath.extension.c_4', 4);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '5', null, 'bartels_sneath.extension.c_5', 5);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot6', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '6', null, 'bartels_sneath.extension.c_6', 6);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot7', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '7', null, 'bartels_sneath.extension.c_7', 7);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
            values ('org_mfantsipim_2007_n_residence_bartels_sneath_extension_cot8', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_residence', 'org_mfantsipim_2007_n_residence_bartels_sneath_extension', 'cot', '8', null, 'bartels_sneath.extension.c_8', 8);
insert into structure_dimension (id, organisation_id, key, name, sort) values ('org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007', 'academic', 'Academic', 2);
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_science', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', null, 'programme', 'Science', null, 'science', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_science_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_science', 'Science', '', 'programme-science');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_science_a_science', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_science', 'Science', 'science');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_science_s1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_science', 'class', 'S1', null, 'science.s1', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_science_s1_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_science_s1', 'S1', '', 'class-science-s1');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_science_s1_a_s1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_science_s1', 'S1', 's1');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_science_s2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_science', 'class', 'S2', null, 'science.s2', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_science_s2_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_science_s2', 'S2', '', 'class-science-s2');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_science_s2_a_s2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_science_s2', 'S2', 's2');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_science_s3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_science', 'class', 'S3', null, 'science.s3', 3);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_science_s3_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_science_s3', 'S3', '', 'class-science-s3');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_science_s3_a_s3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_science_s3', 'S3', 's3');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_science_s4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_science', 'class', 'S4', null, 'science.s4', 4);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_science_s4_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_science_s4', 'S4', '', 'class-science-s4');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_science_s4_a_s4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_science_s4', 'S4', 's4');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_science_s5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_science', 'class', 'S5', null, 'science.s5', 5);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_science_s5_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_science_s5', 'S5', '', 'class-science-s5');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_science_s5_a_s5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_science_s5', 'S5', 's5');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_visual_arts', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', null, 'programme', 'Visual Arts', null, 'visual_arts', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_visual_arts_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_visual_arts', 'Visual Arts', '', 'programme-visual_arts');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_visual_arts_a_visualarts', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_visual_arts', 'Visual Arts', 'visualarts');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_visual_arts_v1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_visual_arts', 'class', 'V1', null, 'visual_arts.v1', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_visual_arts_v1_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_visual_arts_v1', 'V1', '', 'class-visual_arts-v1');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_visual_arts_v1_a_v1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_visual_arts_v1', 'V1', 'v1');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_visual_arts_v2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_visual_arts', 'class', 'V2', null, 'visual_arts.v2', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_visual_arts_v2_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_visual_arts_v2', 'V2', '', 'class-visual_arts-v2');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_visual_arts_v2_a_v2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_visual_arts_v2', 'V2', 'v2');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_visual_arts_v3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_visual_arts', 'class', 'V3', null, 'visual_arts.v3', 3);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_visual_arts_v3_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_visual_arts_v3', 'V3', '', 'class-visual_arts-v3');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_visual_arts_v3_a_v3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_visual_arts_v3', 'V3', 'v3');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_general_arts', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', null, 'programme', 'General Arts', null, 'general_arts', 3);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_general_arts_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_general_arts', 'General Arts', '', 'programme-general_arts');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_general_arts_a_generalarts', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_general_arts', 'General Arts', 'generalarts');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_general_arts_a1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_general_arts', 'class', 'A1', null, 'general_arts.a1', 1);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_general_arts_a1_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_general_arts_a1', 'A1', '', 'class-general_arts-a1');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_general_arts_a1_a_a1', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_general_arts_a1', 'A1', 'a1');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_general_arts_a2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_general_arts', 'class', 'A2', null, 'general_arts.a2', 2);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_general_arts_a2_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_general_arts_a2', 'A2', '', 'class-general_arts-a2');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_general_arts_a2_a_a2', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_general_arts_a2', 'A2', 'a2');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_general_arts_a3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_general_arts', 'class', 'A3', null, 'general_arts.a3', 3);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_general_arts_a3_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_general_arts_a3', 'A3', '', 'class-general_arts-a3');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_general_arts_a3_a_a3', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_general_arts_a3', 'A3', 'a3');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_general_arts_a4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_general_arts', 'class', 'A4', null, 'general_arts.a4', 4);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_general_arts_a4_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_general_arts_a4', 'A4', '', 'class-general_arts-a4');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_general_arts_a4_a_a4', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_general_arts_a4', 'A4', 'a4');
insert into structure_node (id, organisation_id, dimension_id, parent_id, level, name, child_limit, path, sort)
          values ('org_mfantsipim_2007_n_academic_general_arts_a5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_d_academic', 'org_mfantsipim_2007_n_academic_general_arts', 'class', 'A5', null, 'general_arts.a5', 5);
insert into circle (id, organisation_id, kind, visibility, node_id, name, purpose, slug) values ('org_mfantsipim_2007_n_academic_general_arts_a5_c', 'org_mfantsipim_2007', 'derived', 'open', 'org_mfantsipim_2007_n_academic_general_arts_a5', 'A5', '', 'class-general_arts-a5');
insert into structure_alias (id, organisation_id, node_id, alias, normalised) values ('org_mfantsipim_2007_n_academic_general_arts_a5_a_a5', 'org_mfantsipim_2007', 'org_mfantsipim_2007_n_academic_general_arts_a5', 'A5', 'a5');
insert into org_founder (organisation_id, email) values ('org_mfantsipim_2007', 'esseljeffery@gmail.com') on conflict do nothing;
