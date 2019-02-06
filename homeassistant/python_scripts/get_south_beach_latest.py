#!/usr/bin/python3

import urllib3
import json
import requests
import os

http = urllib3.PoolManager()

r = http.request('GET', 'http://video-monitoring.com/beachcams/boca/latest.json')
latest = json.loads(r.data.decode('utf-8'))
base_url = 'http://video-monitoring.com/beachcams/boca/'
pavillion_url = latest['s4']['hr']
complete_pavillion_url = base_url + pavillion_url
beach_url = latest['s8']['hr']
complete_beach_url = base_url + beach_url

with open('/opt/docker/hassio/homeassistant/www/images/south_beach_latest_pavillion.jpg', 'wb') as handle:
        response = requests.get(complete_pavillion_url, stream=True)

        if not response.ok:
            print(response)

        for block in response.iter_content(1024):
            if not block:
                break

            handle.write(block)

with open('/opt/docker/hassio/homeassistant/www/images/south_beach_latest_beach.jpg', 'wb') as handle:
        response = requests.get(complete_beach_url, stream=True)

        if not response.ok:
            print(response)

        for block in response.iter_content(1024):
            if not block:
                break

            handle.write(block)
