
import os.path
import json
import csv
import random
from uuid import uuid4
import datetime
import pprint 
pp = pprint.PrettyPrinter(indent=4)

TITLE = 0
LINK = 2
DESC = 1
IMG = 3
LAT = 8
LON = 9
START = 5
END = 6

events = {}

POWER_UP_TYPES = ( "inc-range", "inc-hint", "nothing")
POWER_UP_EVENT_TYPE = 'gameevent'


def nudgetimes(times, by_days):
    FORMAT = "%Y-%m-%dT%H:%M:%S"
    def nudge(t):
        return (datetime.datetime.strptime(t, FORMAT) - datetime.timedelta(days=by_days)).strftime(FORMAT)
    return [{"start":nudge(t['start']), 'end':nudge(t['end'])} for t in times]
        
def randomGeo():
    lon = (-3.5414834194, -3.5217404366)
    lat = ( 50.7160938261, 50.7262963402)
    return { 
        'lon' : random.triangular(lon[0], lon[1],lon[0] + (lon[1] -  lon[0]) /2 ),
        'lat' : random.triangular(lat[0], lat[1],lat[0] + (lat[1] -  lat[0]) /2 )
    }

with open(os.path.join(os.path.dirname(__file__),'art.csv')) as csvfile:
     reader = csv.reader(csvfile)
     next(reader) # skip header
     for row in reader:
        event = events.get(row[TITLE], {})
        if not event:
            event = {}
            event["id"] =  row[TITLE].strip()
            event["description"] = row[DESC].strip()
            event["summary"] =  row[TITLE].strip()
            event["geo"] = {
                "lat": float(row[LAT]),
                "lon": float(row[LON])
            }
            event["url"] = row[LINK].strip()
            event["type"] = 'event'
            event['img'] = row[IMG].strip()
        
        times = event.get('times', [])
        times.append({'start':row[START], 'end':row[END]})
        event['times'] = times
        events.update({row[TITLE]:event})     

eventList = list(events.values())

# # Set all the dates a week earlier for testting
# for event in eventList:
#     event['times'] =nudgetimes( event['times'], 7)

pp.pprint(eventList)

eventDetails = {"eventList":eventList}

for i in range(len(eventList)* 1):
    eventtype = random.choice(POWER_UP_TYPES)
    eventList.append({
        "id" : eventtype + "_" + uuid4().hex,
        "type":POWER_UP_EVENT_TYPE,
        "details":eventtype,
        "geo":randomGeo()
    })
    print ('created a power up:', eventtype)
    

print("Found %s events" % len(eventDetails['eventList']))
with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'eventDetailsAuto.js'), 'w') as fp:
    fp.write('module.exports = ' + json.dumps(eventDetails, sort_keys=True, indent=4))