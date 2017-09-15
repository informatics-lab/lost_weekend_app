
import os.path
import json
import csv


TITLE = 0
LINK = 1
IMG = 2
LAT = 9
LON = 10
DATE_START = 4
DATE_END = 5
TIME_START = 6 
TIME_END = 7

events = []

with open(os.path.join(os.path.dirname(__file__),'art.csv')) as csvfile:
     reader = csv.reader(csvfile)
     next(reader) # skip header
     for row in reader:
         events.append({
            "description" : "",
            "summary": row[TITLE],
            "geo":{
                "lat": float(row[LAT]),
                "lon": float(row[LON])
            },
            "start":row[DATE_START],
            "end":row[DATE_END],
            "url":row[LINK],
            "type":'event',
            'img':row[IMG]            
         })

eventDetails = {"eventList":events}

print("Found %s events" % len(eventDetails['eventList']))
with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'eventDetailsAuto.js'), 'w') as fp:
    fp.write('module.exports = ' + json.dumps(eventDetails, sort_keys=True, indent=4))