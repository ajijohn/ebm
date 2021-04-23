import os
import sched
import time
from datetime import date
from datetime import datetime
from os.path import join, dirname
from pymongo import MongoClient
import sys
import base64
import cdsapi
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import sendgrid
from sendgrid.helpers.mail import *
import xarray as xr
import urllib.request
import json

outputdir = os.environ.get("OUTPUTDIR")
s = sched.scheduler(time.time, time.sleep)

def aeris(location,start_date,end_date,v4):
    request = urllib.request.urlopen('https://api.aerisapi.com/observations/archive/within?p='+location+'&from='+start_date+'&to='+end_date+'&format=json&filter=allstations&limit=100&plimit=10&fields='+v4+'&client_id=client_id&client_secret=client_secret')          
    response = request.read()
    import json
    json = json.loads(response)
    if json['success']:
        print(json)
        return json
    else:
        print("An error occurred: %s" % (json['error']['description']))
        request.close()
        
def function_cds(start_year,end_year,start_month,end_month,start_day,end_day,North,South,East,West,variable,output_format,time):
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
        'time': time,
        'format': output_format,
        'area': [
            North, West, South,
            East,
        ],
    },
    )
    return d

def mail(file_path,email,send_name):
    message = Mail(from_email='devteam-noreply@hashdev.in',to_emails=email,subject='Microclim.org',html_content= 'Your Request with Microclim.org is successful.<br> The result is attached below.')
    with open(file_path, 'rb') as f:
        data = f.read()
    f.close()
    encoded_file = base64.b64encode(data).decode()
    attachment = Attachment()
    attachment.file_content = FileContent(encoded_file)
    attachment.file_name = FileName(send_name)
    attachment.disposition = Disposition('attachment')
    message.attachment = attachment
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)   
    except Exception as e:
        print(e)
        
def check_new(sc):
    #print("Function starts")
    # look for new requests 
    # if exists, pick it, change the status
    today = date.today()
    print("Starting sweep on " + str(today.strftime('%m/%d/%Y %H:%M')))
    requests = db.requests

    request_lkup = requests.find_one({"status": "OPEN"})
    #print(request_lkup)

    if(request_lkup is not None):

        #Ouput Directory is made with the request id
        if not(os.path.exists(str(outputdir) + '/' + str(request_lkup['_id']))):
            os.makedirs(str(outputdir) + '/' + str(request_lkup['_id']))
        os.chdir(str(outputdir) + '/' + str(request_lkup['_id']))
        path = os.getcwd()
        print("PATH",path)
            
        #Parameters are extracted from the request
        variable = request_lkup['variable']
        source_type=request_lkup['sourcetype']
        start_day = request_lkup['startdate'][6:8]
        end_day = request_lkup['enddate'][6:8]
        start_month = request_lkup['startdate'][4:6]
        end_month = request_lkup['enddate'][4:6]
        start_year = request_lkup['startdate'][:4]
        end_year = request_lkup['enddate'][:4]
        North = request_lkup['lats'][0]
        South = request_lkup['lats'][1]
        East = request_lkup['longs'][0]
        West = request_lkup['longs'][1]
        interval = request_lkup['interval']
        output = request_lkup['outputformat']
        email = request_lkup['email']
        location = str(North)+','+str(West)+','+str(South)+','+str(East)
        start_date = str(start_month)+'/'+str(start_day)+'/'+str(start_year)
        end_date = str(end_month)+'/'+str(end_day)+'/'+str(end_year)

    
        message = Mail(from_email='devteam-noreply@hashdev.in',to_emails=email,subject='Microclim Request is submitted Succesfully',html_content='''Your Request was submitted with paramaters <br><br>
        Source Type : '''+str(source_type)+'''<br> Start date : ''' + str(start_day)+" "+str(start_month)+" "+str(start_year)+'''<br> End date : ''' + str(end_day)+" "+ str(end_month)+" " +str(end_year) +
        '''<br> Bounding Box :<br>   Latitude : ''' + str(North)+", "+str(South)+'''<br>   Longitude : '''+str(East)+", "+str(West)+'''<br> Interval : '''+str(interval)+ '''<br> Output format : '''+ str(output)  )
        try:
            sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            response = sg.send(message)
            print(response.status_code)
            print(response.body)
            print(response.headers)   
        except Exception as e:
            print(e) 

        if source_type == 'aeris':

            #Variable sorting with the response properties
            v1,v2,v3,v5,result_aeris=' ',' ',' ',' ',' '
            for i in  variable:
                if i=='Temperature':
                    v1 = 'periods.ob.tempC,'
                if i == 'Wind Speed':
                    v2='periods.ob.windSpeedKPH,'
                if i=='Wind Direction':
                    v3='periods.ob.windDir,'
                if i=='Solar Radiation':
                    v5='periods.ob.solradWM2'
            v4 =v1+v2+v3+v5

            #Aeris function call
            result_aeris = aeris(location,start_date,end_date,v4)

            #Output is written onto the textfile
            with open("myfile.txt", "w") as file_2:
                 file_2.write("Aeries weather\n"+str(result_aeris))
            file_2.close()

            #Path and the filenames are sorted for sending mail
            x = os.listdir(path)
            file_name = x[0]
            file_path = os.path.join(path,file_name)
            send_name = 'Microclim.txt'

            #Sendgrid Mail is sent
            mail(file_path,email,send_name)
            
            #Update the status of the mail to EMAILED
            requests.update_one({'_id': request_lkup['_id']}, {'$set': {'status': "EMAILED"}}, upsert = False)

                
        if source_type == 'ERA5':
            #Output format and the intervals are sorted 
            if output == 'netcdf' or output == 'csv':
                output_format = 'netcdf'
            if output == 'GRIB':
                output_format = output
            if interval == 'Daily':
                time = ['00:00']
            elif interval == '6 Hourly':
                time = ['00:00','06:00','12:00','18:00']
            elif interval == '12 Hourly':
                time = ['00:00','12:00']
            elif interval == 'Hourly':
                time = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']

            #function call for the function CDS     
            result = function_cds(start_year,end_year,start_month,end_month,start_day,end_day,North,South,East,West,variable,output_format,time)

            #writing the result onto the textfile
            with open("myfile.txt", "w") as file1:
                file1.write(result.download())
            file1.close()

            #file_name and paths are sorted for sending mail
            x = os.listdir(path)
            file_name = x[0]
            file_path = os.path.join(path,file_name)
            print(file_path)


            #csv file conversion
            if output == 'csv':
                netcdf_file_in = path+'\\'+file_name
                csv_file_out = path+'\\'+ file_name[:-3] + '.csv'

                #function for file_conversion netCDF to csv
                ds = xr.open_dataset(netcdf_file_in)
                df = ds.to_dataframe()
                df.to_csv(csv_file_out)

                file_path = csv_file_out
                send_name = 'Microclim.csv'
                
            if output == 'netcdf':
                send_name = 'Microclim.nc'
            if output == 'GRIB':
                send_name = 'Microclim.grib'

            #Sendgrid mail
            mail(file_path,email,send_name)
            
            #Update the status of the mail to EMAILED
            requests.update_one({'_id': request_lkup['_id']}, {'$set': {'status': "EMAILED"}}, upsert = False)

            
            
if __name__ == '__main__':
    # Initialize with DB Context
    db=MongoClient()['ebm']
    # test()
    # Check every minute
    s.enter(60, 1, check_new, (s,))
    s.run()
            
        
