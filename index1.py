import cdsapi
from pymongo import MongoClient
import sys

def fun_cds(start_date,end_date,start_month,end_month,start_day,end_day,North,South,East,West,variable,op_format):
    c = cdsapi.Client()
    d = c.retrieve(
        'reanalysis-era5-single-levels',
    {
        'product_type': 'reanalysis',
        'variable': variable,
                    
        'year': [
            start_year,
            end_year
        ],
        'month': [
            start_month,
            end_month
        ],
        'day': [
            start_day,
            end_day
        ],
        'time': '21:00',
        'format': op_format,
        'area': [
            North, West, South,
            East,
        ],
    },
    )
    sys.stdout.write(str(d))
    
# python to mongodb connection
client = MongoClient('localhost',27017)
mydatabase = client.ebm
mycollection = mydatabase.requests

#finding the record from mongodb
cursor = mycollection.find() 
for i in cursor:
    pass

#choosing the last record from the mongodb
curs = mycollection.find().sort([('_id', -1)]).limit(1)
for j in curs:
    pass

#Each parameters are seperated to different variables
start_year = j['startdate'][:4]
end_year = j['enddate'][:4]
start_month = j['startdate'][4:6]
end_month = j['enddate'][4:6]
start_day = j['startdate'][6:8]
end_day = j['enddate'][6:8]
lats = j['lats']
longs = j['longs']
North = float(lats[0][:5])
South = float(lats[1][:5])
East = float(longs[0][:8])
West = float(longs[1][:8])
op_format = j['outputformat']

#Variables Sorting 
variables = j['variable']
variable = []
dict_variable = {'Tair':'2m_temperature','Tsurface':'skin_temperature','Tsoil':'soil_temperature_level_1','SMOIS':'volumetric_soil_water_layer_1'}
for i in variables:
    variable.append(dict_variable[i])
    
#print(variable,start_year,end_year,start_month,end_month,start_day,end_day,North,South,East,West,op_format)

fun_cds(start_year,end_year,start_month,end_month,start_day,end_day,North,South,East,West,variable,op_format)
