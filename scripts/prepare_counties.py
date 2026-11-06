"""Build simplified main-component outlines from the official NLSC shapefile.
Usage: PYTHONPATH=/tmp/taiwan-build-deps python3 scripts/prepare_counties.py
Source: https://maps.nlsc.gov.tw/download/縣市界線(TWD97經緯度).zip
Source archive currently contains COUNTY_MOI_1090820 (2020-08-20).
"""
import json
from pathlib import Path
import shapefile
from shapely.geometry import shape
reader=shapefile.Reader('/tmp/taiwan-counties/COUNTY_MOI_1090820.shp',encoding='utf-8')
regions=[]
for sr in reader.iterShapeRecords():
 props=sr.record.as_dict()
 geom=shape(sr.shape.__geo_interface__)
 polys=list(geom.geoms) if geom.geom_type=='MultiPolygon' else [geom]
 primary=max(polys,key=lambda p:p.area)
 outline=primary.simplify(.00005,preserve_topology=True)
 name=props['COUNTYNAME']
 regions.append(dict(id=props['COUNTYCODE'],name=name,parts=len(polys),holes=len(primary.interiors),points=[[round(x,6),round(y,6)] for x,y in outline.exterior.coords]))
regions.sort(key=lambda r:r['id'])
assert len(regions)==22
Path('src/data/counties.json').write_text(json.dumps(regions,ensure_ascii=False,separators=(',',':')))
print([(r['name'],len(r['points']),r['parts']) for r in regions])
