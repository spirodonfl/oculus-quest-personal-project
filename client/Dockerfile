# Use an official Alpine Linux as a parent image
FROM alpine:latest

# Install or Update Apache, Apache SSL And OpenSSL, Create scripts folder
RUN apk --update add apache2 && apk --update add apache2-ssl && apk --update add openssl && mkdir /root/scripts

# Copy certs.sh at /root/scripts
COPY certs.sh /root/scripts

# Create an localhost certificate
# Copy localhost.key and localhost.crt to /etc/ssl/apache2
# Enable SSL for default site
# Copy crt cerificate
# Change "It Works!" on /var/www/localhost/htdocs/index.html
# Correct certificates permission
RUN /bin/sh /root/scripts/certs.sh && \
    cp /root/scripts/localhost.* /etc/ssl/apache2/ && \
    sed -i 's/server.pem/localhost.crt/g' /etc/apache2/conf.d/ssl.conf && \
    sed -i 's/server.key/localhost.key/g' /etc/apache2/conf.d/ssl.conf && \
    cp /root/scripts/localhost.crt /var/www/localhost/htdocs && \
    sed -i  's/It works!/It works on Docker SSL!/g' /var/www/localhost/htdocs/index.html && \
    chown apache.apache /var/www/localhost/htdocs/localhost*

# Make port 80 and 443 available to the world outside this container
EXPOSE 80 
EXPOSE 443

# Run httpd service when the container launches
CMD ["httpd", "-D", "FOREGROUND"]
