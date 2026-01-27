from fastapi import FastAPI
from sqlalchemy import create_engine, text
from pydantic import BaseModel, Field
import os

app = FastAPI()
engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)

@app.get("/intakes")
def intakes_geojson():
    sql = text("""
      SELECT jsonb_build_object(
        'type','FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type','Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object('id', id, 'name', name, 'source', source)
          )
        ), '[]'::jsonb)
      ) AS fc
      FROM water_intakes;
    """)
    with engine.begin() as conn:
        return conn.execute(sql).scalar_one()

@app.get("/events/{event_id}/affected_households")
def affected_households(event_id: int):
    # En enkel “konsekvensmodell”: husstander innen radius fra forurensingspunkt.
    # geography gir meter når SRID=4326
    sql = text("""
      WITH e AS (
        SELECT id, radius_m, geom
        FROM contamination_events
        WHERE id = :event_id
      )
      SELECT jsonb_build_object(
        'type','FeatureCollection',
        'features', COALESCE(jsonb_agg(
          jsonb_build_object(
            'type','Feature',
            'geometry', ST_AsGeoJSON(h.geom)::jsonb,
            'properties', jsonb_build_object('id', h.id, 'address', h.address)
          )
        ), '[]'::jsonb)
      )
      FROM households h, e
      WHERE ST_DWithin(h.geom::geography, e.geom::geography, e.radius_m);
    """)
    with engine.begin() as conn:
        return conn.execute(sql, {"event_id": event_id}).scalar_one()


        from pydantic import BaseModel, Field



