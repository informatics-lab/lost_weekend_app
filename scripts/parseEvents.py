from requests import get
import os.path
import json

url = 'http://lostweekend.unleashedweb.co.uk/events/?action=tribe_photo&ical=1'
raw = get(url).text

events = [event.split('BEGIN:VEVENT')[1] for event in raw.split('END:VEVENT') if event.find('BEGIN:VEVENT') >= 0]
print("Found %s events" % len(events))


def eventToObject(event):
    obj = {}
    params = [p.split(':', 1) for p in event.split('\n') if p.find(':') >= 0]
    # print(params)
    for param, value in params:
        value = value.replace(r'\r','').replace('\r','').replace(r'\n','\n').replace(r'\,', ',') 
        if param == 'GEO':
            lat, lon = [float(i) for i in value.split(';')]
            value = { 'lat':lat, 'lon':lon}
        obj[param.lower()] = value
    obj['type'] = 'event'
    return obj


eventDetails = {"eventList":[event for event in (eventToObject(e) for e in events) if event.get('geo', None)]}


print("Found %s events with lat an lon" % len(eventDetails['eventList']))
with open(os.path.join(os.path.dirname(__file__), '..', 'src', 'eventDetailsAuto.js'), 'w') as fp:
    fp.write('module.exports = ' + json.dumps(eventDetails, sort_keys=True, indent=4))