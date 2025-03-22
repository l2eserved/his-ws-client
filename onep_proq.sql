DELIMITER //
CREATE PROCEDURE onep_cmi(IN d1 date,IN d2 date)
BEGIN

    IF d1 IS NULL or d1 = '' THEN SET d1 = DATE_SUB(CURDATE(),INTERVAL 90 DAY); END IF;
    IF d2 IS NULL or d2 = '' THEN SET d2 = CURDATE(); END IF;
    
  SELECT 11263 AS hospcode,"%" AS ward, (SELECT SUM(bedcount) FROM ward WHERE bedcount IS NOT NULL) AS bedcount
,"total" AS wname,COUNT(*) AS wcount,SUM(i.admdate) AS dayadm,SUM(i.admdate)/COUNT(*) AS day_avg
,(SUM(i.admdate)*100)/((SELECT SUM(bedcount) FROM ward WHERE bedcount IS NOT NULL)*(DATEDIFF(d2,d1)+1)) AS admsum
,ROUND(SUM(i.rw),2) As SumRw
,ROUND(SUM(a.adjrw),2) As SumAdjRw
,ROUND(SUM(a.adjrw) / COUNT(DISTINCT(i.an)),2) As CMI
FROM an_stat i
LEFT OUTER JOIN ward w ON w.ward = i.ward
LEFT JOIN ipt a on a.an = i.an
WHERE i.dchdate BETWEEN d1 AND d2
AND w.bedcount IS NOT NULL
UNION
SELECT (SELECT hospitalcode FROM opdconfig) AS hospcode,w.ward, w.bedcount
,w.name AS wname,COUNT(*) AS wcount,SUM(i.admdate) AS dayadm,SUM(i.admdate)/COUNT(*) AS day_avg
,(SUM(i.admdate)*100)/(w.bedcount*(DATEDIFF(d2,d1)+1)) AS admsum
,ROUND(SUM(i.rw),2) As SumRw
,ROUND(SUM(a.adjrw),2) As SumAdjRw
,ROUND(SUM(a.adjrw) / COUNT(DISTINCT(i.an)),2) As CMI
FROM an_stat i
LEFT OUTER JOIN ward w ON w.ward = i.ward
LEFT JOIN ipt a on a.an = i.an
WHERE i.dchdate BETWEEN d1 AND d2
AND w.bedcount IS NOT NULL
GROUP BY i.ward;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE onep_cmilist(IN d1 date,IN d2 date)
BEGIN
    IF d1 IS NULL or d1 = '' THEN SET d1 = DATE_SUB(CURDATE(),INTERVAL 30 DAY); END IF;
    IF d2 IS NULL or d2 = '' THEN SET d2 = CURDATE(); END IF;
  SELECT 11263 AS hospcode,i.ward AS ward, w.bedcount AS bedcount
            ,w.`name` AS wname,i.an,i.admdate AS dayadm,a.dchdate
            ,ROUND(i.rw,2) As Rw
            ,ROUND(a.adjrw,2) As AdjRw
            FROM an_stat i
            LEFT OUTER JOIN ward w ON w.ward = i.ward
            LEFT JOIN ipt a on a.an = i.an
            WHERE i.dchdate BETWEEN d1 AND d2
            AND w.bedcount IS NOT NULL;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE onep_ipdvisit(IN d1 date)
BEGIN
IF d1 IS NULL or d1 = '' THEN SET d1 = date(CURDATE()); END IF;

SELECT 11263 AS hospcode
, date(now()) AS date_get, ward.ward,ward.name AS ward_name
, ward.spclty, spclty.name AS spclty_name,count(*) AS admit_num
, bedcount, ward_active
FROM ipt
LEFT JOIN ward ON ward.ward = ipt.ward
LEFT JOIN spclty ON spclty.spclty = ward.spclty
WHERE dchdate IS NULL AND ward_active = "Y"
GROUP BY ward.ward,ward.name,ward.spclty,spclty.name;

END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE onep_labourbyan(IN input_an varchar(9))
BEGIN
IF input_an IS NULL or input_an = '' THEN SET input_an = '680000095'; END IF;

SELECT * FROM (SELECT 11263 AS hospcode,i.an,"F1" as "F1", il.ipt_labour_id,concat(p.pname,p.fname," ",p.lname) AS fullname, a.age_y, oo.`name` as occ,CONCAT(p.addrpart," หมู่ที่ " ,p.moopart," ",t.full_name) as tt,lp.place_name, ilp.ipt_labour_place_name, ilat.ipt_labour_anc_type_name,pa.preg_no, il.anc_count, il.ga,il.g, il.t, il.p, il.a, il.l,
il.lmp, il.edc,
GROUP_CONCAT(ll.lab_name,"[ผล1=",if(ill.lab_value="","-",ill.lab_value)," : ผล2=",if(ill.lab_value2="","-",ill.lab_value2),"]") as labour_lab
FROM ipt i
INNER JOIN patient p ON p.hn=i.hn
LEFT OUTER JOIN person ps on ps.patient_hn=i.hn
LEFT OUTER JOIN person_anc pa ON pa.person_id=ps.person_id and (discharge<>"Y" or discharge is null)
INNER JOIN occupation oo ON oo.occupation=p.occupation
INNER JOIN thaiaddress t ON t.chwpart=p.chwpart AND t.amppart=p.amppart AND t.tmbpart=p.tmbpart
LEFT OUTER JOIN an_stat a ON a.an = i.an
LEFT OUTER JOIN ipt_labour il ON il.an = i.an
LEFT JOIN labour_place lp on il.labour_place_id=lp.labour_place_id
LEFT JOIN ipt_labour_place ilp on il.ipt_labour_place_id=ilp.ipt_labour_place_id
LEFT JOIN ipt_labour_anc_type ilat on il.ipt_labour_anc_type_id=ilat.ipt_labour_anc_type_id
LEFT JOIN ipt_labour_lab ill on il.ipt_labour_id = ill.ipt_labour_id
LEFT JOIN labour_lab ll on ill.lab_id=ll.lab_id where i.an = input_an
GROUP BY ill.ipt_labour_id ) t1
LEFT JOIN (
SELECT "F2" as "F2", il.ipt_labour_id,
i.prediag, iv.bw, iv.temperature, iv.height, iv.bpd, iv.bps, iv.rr, iv.hr,
iv.cervical_open_size, iv.eff, iv.station, ivs.labour_sac_type_name, iva.labour_amniotic_type_name, iv.fetal_heart_sound,
"F3" as "F3",
la.labour_starttime, la.labour_startdate,
la.labour_cervical_time, la.labour_cervical_date,
la.labour_cervical_3cm_time, la.labour_cervical_3cm_date,
la.labour_closetime, la.labour_closedate,
la.labour_finishtime, la.labour_finishdate,
la.labour_othertime, la.labour_otherdate,
la.labour_firststagehour, la.labour_firststageminute,
la.labour_secondstagehour, la.labour_secondstageminute,
la.labour_thirdstagehour, la.labour_thirdstageminute,
la.labour_totalhour, la.labour_totalminute,
la.labour_allhour, la.labour_allminute,
la.drip_synto_dose, la.drip_synto_date, la.drip_synto_time,
la.drip_pethidine_dose, la.drip_pethidine_date, la.drip_pethidine_time,
la.membrane_starttime, la.membrane_startdate,
ile.membrane_explode_type_name, ilt.membrane_type_name,
lap.perineum_type_name, lat.sulture_type_name, d1.`name` as d1_name,
lapt.placenta_type_name, la.placenta_weight, la.placenta_side, la.placenta_wide,
la.placenta_length, la.placenta_neck, lapd.labour_placenta_desc_name,
la.placenta_height, la.placenta_heart, la.placenta_bps, la.placenta_bpd,
la.placenta_bloodloss, la.drip_methergine_dose, la.drip_methergine_date, la.drip_methergine_time, d3.`name` as d3_name,
la.drip_oxytocin_dose, la.drip_oxytocin_date, la.drip_oxytocin_time,
"F4" as "F4",
li.infant_number, ss.`name` as ss_name, li.birth_weight, li.birth_date, li.birth_time,
lid.infant_delivery_type_name, lip.infant_indication_type_name,
li.apgar_score_min1_hr, li.apgar_score_min1_rr, li.apgar_score_min1_reflex, li.apgar_score_min1_tone, li.apgar_score_min1_color, li.apgar_score_min1,
li.apgar_score_min5_hr, li.apgar_score_min5_rr, li.apgar_score_min5_reflex, li.apgar_score_min5_tone, li.apgar_score_min5_color, li.apgar_score_min5,
li.apgar_score_min10_hr, li.apgar_score_min10_rr, li.apgar_score_min10_reflex, li.apgar_score_min10_tone, li.apgar_score_min10_color, li.apgar_score_min10,
li.body_length, li.head_length, li.temperature as f4_temperature, li.rr as f4_rr, li.hr as f4_hr,
lif.infant_fluid_type_name
FROM ipt i
LEFT OUTER JOIN ipt_labour il ON il.an = i.an
LEFT JOIN membrane_explode_type ile on il.membrane_explode_type_id=ile.membrane_explode_type_id
LEFT JOIN membrane_type ilt on il.membrane_type_id=ilt.membrane_type_id
LEFT OUTER JOIN ipt_labour_infant li ON li.ipt_labour_id = il.ipt_labour_id
LEFT JOIN sex ss on li.sex=ss.`code`
LEFT JOIN infant_delivery_type lid on li.infant_delivery_type_id=lid.infant_delivery_type_id
LEFT JOIN infant_indication_type lip on li.infant_indication_type_id=lip.infant_indication_type_id
LEFT JOIN infant_fluid_type lif on li.infant_fluid_type_id=lif.infant_fluid_type_id
LEFT OUTER JOIN labor la ON la.an = i.an
LEFT JOIN labour_perineum_type lap on la.perineum_type=lap.perineum_type_id
LEFT JOIN labour_sulture_type lat on la.sulture_type_id=lat.sulture_type_id
LEFT JOIN labour_placenta_type lapt on la.placenta_type_id=lapt.placenta_type_id
LEFT JOIN labour_placenta_desc lapd on la.labour_placenta_desc_id=lapd.labour_placenta_desc_id
LEFT OUTER JOIN ipt_pregnancy_vital_sign iv ON iv.an = i.an 
LEFT JOIN labour_sac_type ivs on iv.labour_sac_type_id=ivs.labour_sac_type_id
LEFT JOIN labour_amniotic_type iva on iv.labour_amniotic_type_id=iva.labour_amniotic_type_id
LEFT JOIN opduser d3 on la.entry_staff=d3.loginname
LEFT OUTER JOIN doctor d1 ON d1.code = i.admdoctor
) t2 on t1.ipt_labour_id = t2.ipt_labour_id
LEFT JOIN (
SELECT "F5" AS "F5"
,l2.ipt_labour_id
,GROUP_CONCAT(l4.labour_stage_name,": ",l3.labour_complication_name ORDER BY l4.labour_stage_name) as stage_complication
FROM ipt_labour l1
LEFT JOIN ipt_labour_complication l2 on l1.ipt_labour_id=l2.ipt_labour_id
LEFT JOIN labour_complication l3 on l2.labour_complication_id=l3.labour_complication_id
LEFT JOIN labour_stage l4 on l2.labour_stage_id=l4.labour_stage_id
GROUP BY ipt_labour_id
ORDER BY l2.labour_stage_id ) t3 on t1.ipt_labour_id=t3.ipt_labour_id
WHERE t1.ipt_labour_id IS NOT NULL;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE onep_labourbytype(IN labour_type int(1))
BEGIN
IF labour_type IS NULL or labour_type = '' THEN SET labour_type = 1; END IF;
SELECT 11263 AS hospcode,pr.deliver_type,dt.name,ip.an,CONCAT(pt.pname,pt.fname," ",pt.lname) AS ptname,t.full_name,pr.preg_number
FROM ipt ip
LEFT OUTER JOIN ipt_pregnancy pr ON ip.an = pr.an
LEFT OUTER JOIN ipt_pregnancy_deliver_type dt ON pr.deliver_type = dt.id
LEFT OUTER JOIN labour_deliver_abnormal_type la ON pr.deliver_abnormal_type = la.labour_deliver_abnormal_type
LEFT OUTER JOIN patient pt ON ip.hn = pt.hn
LEFT OUTER JOIN thaiaddress t ON CONCAT(pt.chwpart,pt.amppart,pt.tmbpart) = t.addressid
WHERE ip.dchdate IS NULL AND ip.ipt_type = 4 AND dt.id = labour_type;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE onep_opdvisit(IN d1 date)
BEGIN
IF d1 IS NULL or d1 = '' THEN SET d1 = date(CURDATE()); END IF;
    
select 11263 AS hospcode,d1 AS 'date',a.type,a.n as opd,b.n as er 
from 
(select "total" as type,count(s.vn) as n from ovst  
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
and ovst.vn  not in (select vn from er_regist where vstdate = d1)
UNION
select "waiting" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
and s.service5 is null
and ovst.vn  not in (select vn from er_regist where vstdate = d1)
UNION
select "inprocess" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
 and s.service5 is not null 
 and s.service12 is null
 and ovst.vn  not in (select vn from er_regist where vstdate = d1)
 UNION
 select "success" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
and s.service12 is not null
and ovst.vn not in (select vn from er_regist where vstdate = d1)) as a
-- ////ER////
LEFT JOIN (   
select "total" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
and ovst.vn   in (select vn from er_regist where vstdate = d1)
UNION
select "waiting" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
and s.service5 is null
and ovst.vn   in (select vn from er_regist where vstdate = d1)
UNION
select "inprocess" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
 and s.service5 is not null 
 and s.service12 is null
 and ovst.vn   in (select vn from er_regist where vstdate = d1)
 UNION
 select "success" as type,count(s.vn) as n from ovst
INNER JOIN service_time s on ovst.vn = s.vn
WHERE ovst.vstdate = d1
and s.service12 is not null
and ovst.vn  in (select vn from er_regist where vstdate = d1)
) as b on a.type = b.type;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE onep_waitingtimelist(IN start_date date,in end_date date)
BEGIN
IF start_date IS NULL or start_date = '' THEN SET start_date = DATE_SUB(CURDATE(),INTERVAL 90 DAY); END IF;
IF end_date IS NULL or end_date = '' THEN SET end_date = CURDATE() ;END IF;
SELECT 11263 AS hospcode,o.vstdate
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service4)-TIME_TO_SEC(o.vsttime)))),5) AS "visit_screen"
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service11)-TIME_TO_SEC(s.service4)))),5) AS "avg_screen"
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service5)-TIME_TO_SEC(s.service11)))),5) AS "screen_doctor"
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service12)-TIME_TO_SEC(s.service5)))),5) AS "avg_doctor"
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service6)-TIME_TO_SEC(s.service12)))),5) AS "doctor_pharma"
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service16)-TIME_TO_SEC(s.service6)))),5) AS "avg_pharma"
,LEFT(SEC_TO_TIME(AVG((TIME_TO_SEC(s.service6)-TIME_TO_SEC(o.vsttime)))),5) AS "avg_visit_pharma"
FROM service_time s
INNER JOIN ovst o ON o.vn=s.vn
LEFT JOIN oapp on o.hn = oapp.hn AND o.vstdate = oapp.nextdate
WHERE s.vstdate BETWEEN start_date AND end_date
AND o.vstdate NOT IN (SELECT DISTINCT holiday_date FROM holiday WHERE holiday_date BETWEEN start_date AND end_date)
AND o.vsttime BETWEEN "08:30:00" and "16:30:00"
AND oapp.vn IS NULL
AND o.main_dep IN (
SELECT depcode FROM kskdepartment
WHERE department LIKE "%ซักประวัติ%"
)
GROUP BY o.vstdate;
END //
DELIMITER ;

