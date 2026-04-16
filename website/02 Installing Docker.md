---
up:
  - "[[How To Homeserver]]"
---
Docker allows you to install containers that contain an operating system and a service / program. Containers are more secure than installing a service directly on your OS. They also fix the "works on my machine", which you may be familiar with :)

## Linux (Debian)

Unfortunately, Docker is not available on Debian out of the box. Install it by running (as root)

```bash
apt update # update packages
apt install -yqq curl # install curl to download the script

curl -sSL https://get.docker.com/ | bash # install docker
```

## Linux (Other)

If you are using another distro, ensure that `curl` is already installed. Then, run the same curl-bash-script as on Debian.

## macOS

Docker is available via Docker Desktop on macOS, but the performance is quite bad. Instead, you can use [OrbStack](https://orbstack.dev/), which uses a different engine, but is completely compatible otherwise.

## Windows

**Windows is a horrible choice to use as a server, this guide is only for testing! You are required to have WSL set up already.**

The easiest way to install Docker on Windows is to install [Docker Desktop](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-win-amd64). Follow the install wizard and restart your PC if required.