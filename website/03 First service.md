---
up:
  - "[[How To Homeserver]]"
tags:
  - fleeting
---
Now that we are all on the same page we can install our first Service. 

HomeAssistant is basically the all-in-one smarthome solution. 
You can use it to control and automate anything "smart" in your household and a lot of stuff that isnt as well, via your phone or a WebUI
![[Pasted image 20260416142350.png|244]]

## Setting it up
Start with creating a *compose.yml* file in a folder you want to store your service configs. It is recommend create a new folder for each compose.yml (Service)

Example: HOME/Services/homeassistant/compose.yml

Paste the following config in the YAML (yml) file:
```yaml
services:
  homeassistant:
    container_name: home_assistant
    image: "ghcr.io/home-assistant/home-assistant:stable" # The Image used
    volumes:
      - ~/Services/homeassistant/data/config:/config # New config folder where homeassistant can store data (it will see the path as the one on the right and the "real" one is to the right, right in ur home directory)
      - /etc/localtime:/etc/localtime:ro # Allow access to SystemTime but ReadOnly 
      - /run/dbus:/run/dbus:ro
    restart: unless-stopped # Restart if the container crashes
    privileged: true
    network_mode: host # Allow access to the host network for device discovery
```

## Starting HomeAssistant
To start downloading and running HomeAssistant just run (in the same folder as the compose.yml file)
```bash
docker compose up -d
```

### What does it do?
1. Check if the Image (the Service) is already downloaded (if not it downloads it for you)
2. Starts the Service in background ("-d" stands for detached mode)
3. Now you should be ready to setup HomeAssistant on port 8123 in your web browser
	- http://localhost:8123 (if installed locally)
	- http://YOUR_HOSTNAME:8123
	- http://YOUR_IP:8123 (use ```hostname -i``` on Linux to show your IP)