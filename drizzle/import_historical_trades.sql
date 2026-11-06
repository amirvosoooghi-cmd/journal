-- I-Journal historical import
-- 44 August-September trades + 11 October-November trades
-- Total: 55 trades
-- Safe to run once using the batch marker.

BEGIN;

CREATE TABLE IF NOT EXISTS public.journal_import_batches (
  batch_key TEXT PRIMARY KEY,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  row_count INTEGER NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.journal_import_batches
    WHERE batch_key = 'notion-2026-aug-nov-v1'
  ) THEN

    INSERT INTO public.trades (
      trade_date, tag, symbol, session, move, position, entry,
      risk_pct, pnl, rr, mfe, range_time, breakout_type,
      range_quality, touches, emotions, notes
    )
    VALUES
    ('2026-09-28T12:00:00+00:00','f043','ZRO','NEW YORK',NULL,'LONG','STOP B/S',0.25,-6.5,-1,NULL,'1d','EXPANSION','GOOD',3,'[]'::jsonb,NULL),
    ('2026-09-25T12:00:00+00:00','f042','XLM','LONDON',NULL,'LONG','STOP B/S',0.25,-6.5,-1,NULL,'35d','FAKE','AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-09-25T12:00:00+00:00','f041','DASH','LONDON',NULL,'LONG','STOP B/S',0.25,-6.5,-1,NULL,'15d','FAKE','AVERAGE',5,'[]'::jsonb,NULL),
    ('2026-09-25T12:00:00+00:00','f040','RENDERN','NEW YORK',NULL,'LONG','STOP B/S',0.25,-6.5,-1,NULL,'100d','FAKE','INVALID',1,'[]'::jsonb,NULL),
    ('2026-09-22T12:00:00+00:00','f039','BCH','LONDON','16','LONG','STOP B/S',0.25,25,3.8,10,'22h','NOISE','CLEAN & STRONG',4,'[]'::jsonb,NULL),
    ('2026-09-21T12:00:00+00:00','f038','TAO','LONDON','22:30','LONG','STOP B/S',0.25,19.2,3,5,'96d','SHARP','GOOD',4,'[]'::jsonb,NULL),
    ('2026-09-21T12:00:00+00:00','f037','LDO','NEW YORK','3:30','LONG','STOP B/S',0.25,11,1.7,3,'230d','NOISE','GOOD',4,'[]'::jsonb,NULL),
    ('2026-09-19T12:00:00+00:00','f036','STX','NEW YORK','23:30','LONG','STOP B/S',0.25,16,2.5,5,'214d','NOISE','GOOD',9,'[]'::jsonb,NULL),
    ('2026-09-19T12:00:00+00:00','f035','UNI','LONDON',NULL,'LONG','STOP B/S',0.25,-7.5,-1.2,NULL,'1d 2h','SHARP','CLEAN & STRONG',5,'[]'::jsonb,NULL),
    ('2026-09-18T12:00:00+00:00','f034','PONS','SHANGHAI','2:30','LONG','STOP B/S',0.25,3.5,0.6,5,'8d','SHARP','GOOD',11,'[]'::jsonb,NULL),
    ('2026-09-17T12:00:00+00:00','f033','BNB','LONDON',NULL,'LONG','STOP B/S',0.25,-7.5,-1.2,NULL,'4d 15h','FAKE','MESSY',4,'[]'::jsonb,NULL),
    ('2026-09-14T12:00:00+00:00','f032','AAVE','NEW YORK','21:30','LONG','STOP B/S',0.25,10,1.5,2.5,'2d 6h','SHARP','CLEAN & STRONG',4,'[]'::jsonb,NULL),
    ('2026-09-13T12:00:00+00:00','f031','KAS','NEW YORK','1','SHORT','STOP B/S',0.25,4,0.6,1,'6d','SHARP','GOOD',3,'[]'::jsonb,NULL),
    ('2026-09-11T12:00:00+00:00','f030','ETH','NEW YORK','16:30','LONG','STOP B/S',0.25,9,1.4,2.2,'22d','SHARP','GOOD',11,'[]'::jsonb,NULL),
    ('2026-09-11T12:00:00+00:00','f029','BTC','NEW YORK',NULL,'SHORT','STOP B/S',0.25,-6.5,-1,NULL,'22d','FAKE','GOOD',4,'[]'::jsonb,NULL),
    ('2026-09-07T12:00:00+00:00','f028','ETHFI','NEW YORK','8:30','LONG','STOP B/S',0.25,0,0,1.2,'14d','NOISE','CLEAN & STRONG',5,'[]'::jsonb,NULL),
    ('2026-09-03T13:30:00+03:30','f027','LDO','LONDON','14:30','LONG','STOP B/S',0.25,4.5,1.3,2.5,'7d 4h','NOISE','GOOD',6,'[]'::jsonb,NULL),
    ('2026-08-27T18:00:00+03:30','f026','HYPE','NEW YORK',NULL,'LONG','STOP B/S',0.3,-2.5,-0.6,NULL,'5d 10h','NOISE','GOOD',5,'[]'::jsonb,NULL),
    ('2026-08-26T13:45:00+03:30','f025','HYPE','LONDON',NULL,'LONG','STOP B/S',0.3,-4.5,-1,NULL,'4d','FAKE','GOOD',3,'[]'::jsonb,NULL),
    ('2026-08-25T18:45:00+03:30','f024','SOL','NEW YORK','00:30','LONG','STOP B/S',0.25,5,1.4,2,'1d 18h','NOISE','GOOD',3,'[]'::jsonb,NULL),
    ('2026-08-23T16:30:00+03:30','f023','SOL','NEW YORK',NULL,'LONG','STOP B/S',0.25,-3.5,-1,NULL,'1d','NOISE','AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-08-22T00:45:00+03:30','f022','SOL','NEW YORK','00:45','LONG','CC',0.25,4,1.2,6.5,'12h','SHARP','CLEAN & STRONG',3,'[]'::jsonb,NULL),
    ('2026-08-21T02:30:00+03:30','f021','NEAR','SHANGHAI','5:30','LONG','STOP B/S',0.25,14,4,5.7,'1d','NOISE','CLEAN & STRONG',4,'[]'::jsonb,NULL),
    ('2026-08-21T12:00:00+00:00','f023','HYPE','LONDON',NULL,'LONG','STOP B/S',0.25,-2.5,-0.7,NULL,NULL,NULL,NULL,3,'[]'::jsonb,NULL),
    ('2026-08-20T12:00:00+00:00','f020','AVAX','NEW YORK',NULL,'LONG','CC',0.25,-3.5,-1,NULL,NULL,'NOISE','INVALID',0,'[]'::jsonb,NULL),
    ('2026-08-19T02:00:00+03:30','f018','PUMP','SHANGHAI','2:30','LONG','CC',0.25,0,0,NULL,'4d','NOISE','INVALID',3,'[]'::jsonb,NULL),
    ('2026-08-19T12:00:00+00:00','f019','PAXG','NEW YORK','16:30','LONG','CC',0.25,4,1.2,NULL,NULL,NULL,'AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-08-18T05:00:00+03:30','f017','DOT','SHANGHAI','5','SHORT','STOP B/S',0.25,3.5,1,2.17,'3d 21h','SHARP','GOOD',4,'[]'::jsonb,NULL),
    ('2026-08-16T12:30:00+03:30','f016','HBAR','SHANGHAI','00:30','SHORT','CC',0.25,-7,-2,2,'2d 17h','SHARP','GOOD',3,'[]'::jsonb,NULL),
    ('2026-08-15T14:30:00+03:30','f015','FET','NEW YORK','21:30','SHORT','STOP B/S',0.25,7,2,4,'8d 3h','EXPANSION','GOOD',5,'[]'::jsonb,NULL),
    ('2026-08-14T22:00:00+03:30','f014','LINK','NEW YORK','4:00','LONG','CC',0.1,0,0,4,'2d 5h','NOISE','GOOD',3,'[]'::jsonb,NULL),
    ('2026-08-12T23:15:00+03:30','f013','COMP','NEW YORK',NULL,'SHORT','STOP B/S',0.1,0.8,0.6,1,'1d 12h','SHARP','GOOD',5,'[]'::jsonb,NULL),
    ('2026-08-12T12:00:00+03:30','f012','PUMP','LONDON',NULL,'SHORT','CC',0.1,-1.5,-1,NULL,'2d 18h','FAKE','AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-08-11T18:15:00+03:30','f011','ETC','NEW YORK','18:00','SHORT','STOP B/S',0.1,0.8,0.6,1.4,'22h','SHARP','AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-08-09T18:45:00+03:30','f010','BCH','NEW YORK',NULL,'LONG','CC',0.1,-1.5,-1,NULL,'13d 9h','FAKE','MESSY',5,'[]'::jsonb,NULL),
    ('2026-08-07T12:00:00+03:30','f009','ENA','LONDON','12:00','LONG','STOP B/S',0.1,0,0,1.8,'3d 19','SHARP','GOOD',8,'[]'::jsonb,NULL),
    ('2026-08-06T08:30:00+03:30','f008','BTC','LONDON',NULL,'LONG','CC',0.1,-1,-0.7,NULL,'9h','FAKE','INVALID',1,'[]'::jsonb,NULL),
    ('2026-08-06T12:00:00+00:00','f007','PENGU','LONDON',NULL,'LONG','CC',0.1,-1.5,-1,NULL,'3d 19h','FAKE','MESSY',3,'[]'::jsonb,NULL),
    ('2026-08-05T17:15:00+03:30','f005','XLM','NEW YORK','3:00','SHORT','CC',0.1,0.8,0.6,3,'6d 21h','NOISE','AVERAGE',6,'[]'::jsonb,NULL),
    ('2026-08-05T12:00:00+00:00','f006','ETH',NULL,NULL,'SHORT',NULL,0.1,-1.5,-1,NULL,'0','FAKE','INVALID',0,'[]'::jsonb,NULL),
    ('2026-08-04T09:00:00+03:30','f004','PUMP','NEW YORK','21:30','LONG','CC',0.1,2.5,1.8,3.7,'2d 12h','EXPANSION','GOOD',4,'[]'::jsonb,NULL),
    ('2026-08-03T14:45:00+03:30','f003','HYPE','NEW YORK','17','LONG','STOP B/S',0.1,3,2,5,'2d 14h','EXPANSION','GOOD',4,'[]'::jsonb,NULL),
    ('2026-08-02T21:45:00+03:30','f002','AAVE','NEW YORK',NULL,'LONG','STOP B/S',0.1,2.5,1.7,2.4,'1d 15H','SHARP','GOOD',3,'[]'::jsonb,NULL),
    ('2026-08-01T21:45:00+03:30','f001','AVAX','NEW YORK','22','SHORT','CC',0.1,2.5,1.6,2.26,'4d 18h','EXPANSION','GOOD',5,'[]'::jsonb,NULL),
    ('2026-11-03T12:00:00+00:00','f054','BTC','NEW YORK',NULL,'SHORT','CC',0.5,-14,-1,NULL,NULL,'FAKE','AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-11-03T12:00:00+00:00','f053','INJ','NEW YORK',NULL,'SHORT','CC',0.25,-8,-1,NULL,NULL,'FAKE','AVERAGE',3,'[]'::jsonb,NULL),
    ('2026-11-01T12:00:00+00:00','f052','ARB','NEW YORK',NULL,'SHORT','STOP B/S',0.5,15.5,1.1,1.2,NULL,'SHARP','AVERAGE',4,'[]'::jsonb,NULL),
    ('2026-10-28T12:00:00+00:00','f051','PUMP','LONDON',NULL,'SHORT','CC',0.5,-14,-1,NULL,'2d','FAKE','AVERAGE',4,'[]'::jsonb,NULL),
    ('2026-10-28T12:00:00+00:00','f050','UNI','NEW YORK',NULL,'SHORT','STOP B/S',0.5,-14,-1,1,'11d','SHARP','CLEAN & STRONG',4,'[]'::jsonb,NULL),
    ('2026-10-18T12:00:00+00:00','f049','PUMP','NEW YORK',NULL,'SHORT','CC',0.5,18,1.3,3,'3d','NOISE','GOOD',3,'[]'::jsonb,NULL),
    ('2026-10-17T12:00:00+00:00','f048','FET','NEW YORK',NULL,'SHORT','CC',0.25,5.2,0.8,0.8,NULL,'SHARP','GOOD',3,'[]'::jsonb,NULL),
    ('2026-10-14T12:00:00+00:00','f047','ONDO','NEW YORK',NULL,'SHORT','STOP B/S',0.25,4,0.6,1.5,'7d','SHARP','GOOD',4,'[]'::jsonb,NULL),
    ('2026-10-13T12:00:00+00:00','f046','STX','NEW YORK',NULL,'LONG','STOP B/S',0.5,11.5,0.8,1.3,'10d','SHARP','GOOD',4,'[]'::jsonb,NULL),
    ('2026-10-12T12:00:00+00:00','f045','STX','LONDON',NULL,'LONG','STOP B/S',0.25,-6.7,-1,NULL,'9d','FAKE','GOOD',3,'[]'::jsonb,NULL),
    ('2026-10-06T12:00:00+00:00','f044','DOT','LONDON',NULL,'LONG','CC',0.25,-6.5,-1,NULL,'5d','FAKE','AVERAGE',4,'[]'::jsonb,NULL);

    INSERT INTO public.journal_import_batches(batch_key,row_count)
    VALUES ('notion-2026-aug-nov-v1',55);

  END IF;
END $$;

COMMIT;