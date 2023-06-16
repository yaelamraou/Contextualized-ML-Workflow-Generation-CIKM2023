#!/bin/bash

echo "launching container ..."

docker compose up -d --build

docker ps
