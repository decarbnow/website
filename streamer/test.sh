#!/bin/bash
rm data/keanomap.db
docker run --rm -v /home/ma/Documents/workwork/keano/keano/map/streamer/data:/usr/src/app/data -ti streamer
docker run --rm -v /home/ma/Documents/workwork/keano/keano/map/streamer/data:/usr/src/app/data -ti streamer python export.py
