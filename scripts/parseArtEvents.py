
import os.path
import json
import csv


TITLE = 0
LINK = 1
IMG = 2
LAT = 7
LON = 8
START = 4
END = 5

events = {}

with open(os.path.join(os.path.dirname(__file__),'art.csv')) as csvfile:
     reader = csv.reader(csvfile)
     next(reader) # skip header
     for row in reader:
        event = events.get(row[TITLE], {})
        if not event:
            event = {}
            event["id"] =  row[TITLE]
            event["description"] = ""
            event["summary"] =  row[TITLE]
            event["geo"] = {
                "lat": float(row[LAT]),
                "lon": float(row[LON])
            }
            event["url"] = row[LINK]
            event["type"] = 'event'
            event['img'] = row[IMG]  
        
        times = event.get('times', [])
        times.append({'start':row[START], 'end':row[END]})
        event['times'] = times 
        events.update({row[TITLE]:event})     
    
eventDetails = {"eventList":list(events.values())}

print("Found %s events" % len(eventDetails['eventList']))
with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'eventDetailsAuto.js'), 'w') as fp:
    fp.write('module.exports = ' + json.dumps(eventDetails, sort_keys=True, indent=4))