#!/bin/sh

docker build -t my-secure-apache-image
docker rm vr-secure
docker run --name vr-secure -v $(pwd):/var/www/localhost/htdocs -v $(pwd)/../common:/var/www/localhost/htdocs/common -d -p 8003:80 -p 8002:443 my-secure-apache-image
