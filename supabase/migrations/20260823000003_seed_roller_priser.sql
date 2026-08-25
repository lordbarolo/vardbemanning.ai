-- Yrkesroller och zonpriser ur avtalets artikel- och priskatalog.
-- Genererad av scripts/generate_migrations.py — redigera inte för hand.
-- 88 roller, 264 zonpriser, giltiga 2026-01-01–2026-12-31.
--
-- OBS  33130: källan stavar rollen olika mellan zoner (['Specialistsjuksköterska onkologisk', 'Specialistsjuksköterska onkologisk vård']) — zon 1 används som kanonisk

insert into public.roles (role_code, name, category, description, procurement_area)
values
  ('11000','Legitimerad läkare','lakare','Legitimerad läkare','Läkare'),('12000','ST-läkare','lakare','Läkare under specialistutbildning','Läkare'),
  ('13010','Specialistläkare barn- och ungdomsmedicin','lakare','Barn- och ungdomsmedicin','Läkare'),('13012','Specialistläkare barn- och ungdomsallergologi','lakare','Barn- och ungdomsallergologi','Läkare'),
  ('13013','Specialistläkare barn- och ungdomshematologi och onkologi','lakare','Barn- och ungdomshematologi och onkologi','Läkare'),('13014','Specialistläkare barn- och ungdomskardiologi','lakare','Barn- och ungdomskardiologi','Läkare'),
  ('13015','Specialistläkare barn- och ungdomsneurologi med habilitering','lakare','Barn- och ungdomsneurologi med habilitering','Läkare'),('13016','Specialistläkare neonatologi','lakare','Neonatologi','Läkare'),
  ('13110','Specialistläkare klinisk fysiologi','lakare','Klinisk fysiologi','Läkare'),('13120','Specialistläkare radiologi','lakare','Radiologi','Läkare'),
  ('13122','Specialistläkare neuroradiologi','lakare','Neuroradiologi','Läkare'),('13200','Specialistläkare allmänmedicin','lakare','Allmänmedicin','Läkare'),
  ('13210','Specialistläkare akutsjukvård','lakare','Akutsjukvård','Läkare'),('13220','Specialistläkare arbets- och miljömedicin','lakare','Arbets- och miljömedicin','Läkare'),
  ('13230','Specialistläkare hud- och könssjukdomar','lakare','Hud- och könssjukdomar','Läkare'),('13240','Specialistläkare infektionssjukdomar','lakare','Infektionssjukdomar','Läkare'),
  ('13250','Specialistläkare klinisk farmakologi','lakare','Klinisk farmakologi','Läkare'),('13260','Specialistläkare klinisk genetik','lakare','Klinisk genetik','Läkare'),
  ('13270','Specialistläkare onkologi','lakare','Onkologi','Läkare'),('13280','Specialistläkare reumatologi','lakare','Reumatologi','Läkare'),
  ('13290','Specialistläkare rättsmedicin','lakare','Rättsmedicin','Läkare'),('13300','Specialistläkare socialmedicin','lakare','Socialmedicin','Läkare'),
  ('13310','Specialistläkare endokrinologi och diabetologi','lakare','Endokrinologi och diabetologi','Läkare'),('13320','Specialistläkare medicinsk gastroenterologi och hepatologi','lakare','Medicinsk gastroenterologi och hepatologi','Läkare'),
  ('13330','Specialistläkare geriatrik','lakare','Geriatrik','Läkare'),('13340','Specialistläkare hematologi','lakare','Hematologi','Läkare'),
  ('13350','Specialistläkare internmedicin','lakare','Internmedicin','Läkare'),('13360','Specialistläkare kardiologi','lakare','Kardiologi','Läkare'),
  ('13370','Specialistläkare lungsjukdomar','lakare','Lungsjukdomar','Läkare'),('13380','Specialistläkare njurmedicin','lakare','Njurmedicin','Läkare'),
  ('13400','Specialistläkare anestesi och intensivvård','lakare','Anestesi och intensivvård','Läkare'),('13410','Specialistläkare barn- och ungdomskirurgi','lakare','Barn- och ungdomskirurgi','Läkare'),
  ('13420','Specialistläkare handkirurgi','lakare','Handkirurgi','Läkare'),('13430','Specialistläkare kirurgi','lakare','Kirurgi','Läkare'),
  ('13440','Specialistläkare kärlkirurgi','lakare','Kärlkirurgi','Läkare'),('13450','Specialistläkare obstetrik och gynekologi','lakare','Obstetrik och gynekologi','Läkare'),
  ('13460','Specialistläkare Ortopedi','lakare','Ortopedi','Läkare'),('13470','Specialistläkare plastikkirurgi','lakare','Plastikkirurgi','Läkare'),
  ('13480','Specialistläkare thoraxkirurgi','lakare','Thoraxkirurgi','Läkare'),('13490','Specialistläkare urologi','lakare','Urologi','Läkare'),
  ('13500','Specialistläkare ögonsjukdomar','lakare','Ögonsjukdomar','Läkare'),('13510','Specialistläkare öron-, näs- och halssjukdomar','lakare','Öron-, näs- och halssjukdomar','Läkare'),
  ('13512','Specialistläkare hörsel- och balansrubbningar','lakare','Hörsel- och balansrubbningar','Läkare'),('13513','Specialistläkare röst- och talrubbningar','lakare','Röst- och talrubbningar','Läkare'),
  ('13520','Specialistläkare klinisk immunologi och transfusionsmedicin','lakare','Klinisk immunologi och transfusionsmedicin','Läkare'),('13530','Specialistläkare klinisk kemi','lakare','Klinisk kemi','Läkare'),
  ('13540','Specialistläkare klinisk mikrobiologi','lakare','Klinisk mikrobiologi','Läkare'),('13550','Specialistläkare klinisk patologi','lakare','Klinisk patologi','Läkare'),
  ('13560','Specialistläkare klinisk neurofysiologi','lakare','Klinisk neurofysiologi','Läkare'),('13570','Specialistläkare neurokirurgi','lakare','Neurokirurgi','Läkare'),
  ('13580','Specialistläkare neurologi','lakare','Neurologi','Läkare'),('13590','Specialistläkare rehabiliteringsmedicin','lakare','Rehabiliteringsmedicin','Läkare'),
  ('13600','Specialistläkare barn- och ungdomspsykiatri','lakare','Barn- och ungdomspsykiatri','Läkare'),('13610','Specialistläkare psykiatri','lakare','Psykiatri','Läkare'),
  ('13612','Specialistläkare rättspsykiatri','lakare','Rättspsykiatri','Läkare'),('13900','Specialistläkare allergologi','lakare','Allergologi','Läkare'),
  ('13910','Specialistläkare arbetsmedicin','lakare','Arbetsmedicin','Läkare'),('13920','Specialistläkare beroendemedicin','lakare','Beroendemedicin','Läkare'),
  ('13930','Specialistläkare gynekologisk onkologi','lakare','Gynekologisk onkologi','Läkare'),('13940','Specialistläkare nuklearmedicin','lakare','Nuklearmedicin','Läkare'),
  ('13950','Specialistläkare palliativ medicin','lakare','Palliativ medicin','Läkare'),('13960','Specialistläkare skolhälsovård','lakare','Skolhälsovård','Läkare'),
  ('13970','Specialistläkare smärtlindring','lakare','Smärtlindring','Läkare'),('13980','Specialistläkare vårdhygien','lakare','Vårdhygien','Läkare'),
  ('13990','Specialistläkare äldrepsykiatri','lakare','Äldrepsykiatri','Läkare'),('13998','Specialistläkare, annan specificerad (Timprisreducering -10%)','lakare','Annan specialistläkarkompetens (Timprisreducering -10%)','Läkare'),
  ('31000','Sjuksköterska','sjukskoterska','Legitimerad','Sjuksköterska'),('32000','Barnmorska','sjukskoterska','Legitimerad, specialistutbildning','Sjuksköterska'),
  ('33010','Specialistsjuksköterska akutsjukvård','sjukskoterska','akutsjuksköterska','Sjuksköterska'),('33020','Specialistsjuksköterska ambulanssjukvård','sjukskoterska','ambulanssjuksköterska','Sjuksköterska'),
  ('33030','Specialistsjuksköterska anestesi','sjukskoterska','anestesisjuksköterska','Sjuksköterska'),('33040','Specialistsjuksköterska barn och ungdom','sjukskoterska','barnsjuksköterska','Sjuksköterska'),
  ('33050','Specialistsjuksköterska diabetesvård','sjukskoterska','diabetessjuksköterska','Sjuksköterska'),('33060','Distriktssjuksköterska','sjukskoterska','Distriktssjuksköterska','Sjuksköterska'),
  ('33070','Specialistsjuksköterska företagshälsovård','sjukskoterska','företagssjuksköterska','Sjuksköterska'),('33080','Specialistsjuksköterska hjärtsjukvård','sjukskoterska','hjärtsjuksköterska','Sjuksköterska'),
  ('33090','Specialistsjuksköterska infektionssjukvård','sjukskoterska','infektionssjuksköterska','Sjuksköterska'),('33100','Specialistsjuksköterska intensivvård','sjukskoterska','intensivvårdssjuksköterska','Sjuksköterska'),
  ('33110','Specialistsjuksköterska kirurgisk vård','sjukskoterska','kirurgsjuksköterska','Sjuksköterska'),('33120','Specialistsjuksköterska medicinsk vård','sjukskoterska','medicinsjuksköterska','Sjuksköterska'),
  ('33130','Specialistsjuksköterska onkologisk vård','sjukskoterska','onkologisjuksköterska','Sjuksköterska'),('33140','Specialistsjuksköterska operationssjukvård','sjukskoterska','operationssjuksköterska','Sjuksköterska'),
  ('33160','Specialistsjuksköterska palliativ vård','sjukskoterska',null,'Sjuksköterska'),('33180','Specialistsjuksköterska psykiatrisk vård','sjukskoterska','psykiatrisjuksköterska','Sjuksköterska'),
  ('33190','Skolsköterska','sjukskoterska',null,'Sjuksköterska'),('33200','Specialistsjuksköterska vård av äldre','sjukskoterska','geriatriksjuksköterska','Sjuksköterska'),
  ('33210','Specialistsjuksköterska ögonsjukvård','sjukskoterska','ögonsjuksköterska','Sjuksköterska'),('43400','Röntgensjuksköterska','sjukskoterska','Legitimerad','Sjuksköterska')
on conflict (role_code) do update set
  name             = excluded.name,
  category         = excluded.category,
  description      = excluded.description,
  procurement_area = excluded.procurement_area;

-- En rad per roll: yrkeskod, katalog, och timpriset i zon 1, 2 och 3.
-- Artikelnumret är per definition zonsiffran följd av yrkeskoden
-- (113430 = zon 1, yrkeskod 13430) och härleds därför i select-satsen
-- nedan i stället för att upprepas 264 gånger.
insert into public.role_zone_prices
  (role_code, zone, valid_from, valid_to, article_number, hourly_price,
   catalog_version, source_document)
select
  v.role_code, z.zone, '2026-01-01', '2026-12-31',
  (z.zone::text || v.role_code)::char(6),
  (array[v.zon1, v.zon2, v.zon3])[z.zone],
  v.catalog_version, v.source_document
from (values
  ('11000',847.00,1040.00,1233.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('12000',847.00,1040.00,1233.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13010',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13012',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13013',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13014',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13015',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13016',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13110',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13120',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13122',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13200',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13210',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13220',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13230',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13240',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13250',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13260',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13270',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13280',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13290',1568.00,1787.00,2062.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13300',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13310',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13320',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13330',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13340',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13350',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13360',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13370',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13380',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13400',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13410',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13420',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13430',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13440',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13450',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13460',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13470',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13480',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13490',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13500',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13510',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13512',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13513',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13520',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13530',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13540',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13550',1568.00,1787.00,2062.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13560',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13570',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13580',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13590',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13600',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13610',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13612',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13900',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13910',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13920',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13930',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13940',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13950',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13960',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13970',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13980',1238.00,1513.00,1787.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('13990',1457.00,1678.00,1953.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),('13998',1114.00,1362.00,1608.00,'1.6','priskatalog_lakare_v1.6_2026.xlsx'),
  ('31000',616.00,660.00,715.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('32000',770.00,824.00,880.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33010',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33020',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33030',770.00,824.00,880.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33040',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33050',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33060',770.00,824.00,880.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33070',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33080',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33090',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33100',770.00,824.00,880.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33110',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33120',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33130',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33140',770.00,824.00,880.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33160',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33180',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33190',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('33200',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),
  ('33210',715.00,770.00,824.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx'),('43400',616.00,660.00,715.00,'1.7','priskatalog_sjukskoterska_v1.7_20260224.xlsx')
) as v (role_code, zon1, zon2, zon3, catalog_version, source_document)
cross join generate_series(1, 3) as z (zone)
on conflict (role_code, zone, valid_from) do update set
  valid_to        = excluded.valid_to,
  article_number  = excluded.article_number,
  hourly_price    = excluded.hourly_price,
  catalog_version = excluded.catalog_version,
  source_document = excluded.source_document;

do $$
declare
  n_roles  int;
  n_prices int;
  n_pairs  int;
begin
  select count(*) into n_roles  from public.roles;
  select count(*) into n_prices from public.role_zone_prices;
  select count(*) into n_pairs  from public.role_municipality_prices;
  if n_roles <> 88 then
    raise exception 'Förväntade 88 roller, fick %', n_roles;
  end if;
  if n_prices <> 264 then
    raise exception 'Förväntade 264 zonpriser, fick %', n_prices;
  end if;
  if n_pairs <> 25520 then
    raise exception 'Förväntade 25520 roll/kommun-par, fick %', n_pairs;
  end if;
end $$;
