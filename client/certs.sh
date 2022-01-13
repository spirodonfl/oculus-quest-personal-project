#! /bin/sh

if [ "$1" = "" ]; then
    echo "Generating for name localhost"
    name="localhost"
else
    echo "Generating for name $1"
    name=$1
fi

openssl req -x509 -nodes -days 365 -subj "/C=DK/ST=Docker/O=Docker Container, Inc./CN=$name" \
 -addext "subjectAltName=DNS:$name" -newkey rsa:2048 -keyout /root/scripts/"$name".key \
 -out /root/scripts/"$name".crt;

# shellcheck disable=SC2086
cp /root/scripts/$name.key /root/scripts/"$name"CA.pem
