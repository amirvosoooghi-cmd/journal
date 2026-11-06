CREATE TABLE IF NOT EXISTS "trades" (
  "id" serial PRIMARY KEY NOT NULL,
  "trade_date" timestamptz NOT NULL,
  "tag" varchar(40),
  "symbol" varchar(30) NOT NULL,
  "session" varchar(20),
  "move" varchar(80),
  "position" varchar(10) NOT NULL,
  "entry" varchar(30),
  "risk_pct" numeric(8,4) DEFAULT '0.25',
  "pnl" numeric(14,2),
  "rr" numeric(10,3),
  "mfe" numeric(10,3),
  "range_time" varchar(60),
  "breakout_type" varchar(30),
  "range_quality" varchar(40),
  "touches" integer,
  "emotions" jsonb DEFAULT '[]'::jsonb,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "trades_date_idx" ON "trades" USING btree ("trade_date");
CREATE INDEX IF NOT EXISTS "trades_symbol_idx" ON "trades" USING btree ("symbol");
