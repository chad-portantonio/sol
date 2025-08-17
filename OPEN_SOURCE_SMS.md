# Open Source SMS Gateway with Kannel
version: '3.8'

services:
  kannel-bearerbox:
    image: aperim/kannel:latest
    container_name: sms-bearerbox
    ports:
      - "13000:13000"  # Admin port
      - "13001:13001"  # SMS port
    volumes:
      - ./kannel.conf:/etc/kannel/kannel.conf
      - ./sms-logs:/var/log/kannel
    environment:
      - KANNEL_CONFIG=/etc/kannel/kannel.conf
    restart: unless-stopped

  kannel-smsbox:
    image: aperim/kannel:latest
    container_name: sms-smsbox
    command: /usr/sbin/smsbox /etc/kannel/kannel.conf
    depends_on:
      - kannel-bearerbox
    volumes:
      - ./kannel.conf:/etc/kannel/kannel.conf
      - ./sms-logs:/var/log/kannel
    restart: unless-stopped

  # Optional: SMS Web Interface
  playsms:
    image: playsms/playsms:latest
    container_name: sms-web
    ports:
      - "8080:80"
    environment:
      - PLAYSMS_DB_HOST=db
      - PLAYSMS_DB_NAME=playsms
      - PLAYSMS_DB_USER=playsms
      - PLAYSMS_DB_PASS=playsms123
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    container_name: sms-db
    environment:
      - MYSQL_DATABASE=playsms
      - MYSQL_USER=playsms
      - MYSQL_PASSWORD=playsms123
      - MYSQL_ROOT_PASSWORD=root123
    volumes:
      - sms-db-data:/var/lib/mysql
    restart: unless-stopped

volumes:
  sms-db-data:
