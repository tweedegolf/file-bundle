FROM tweedegolf/php-fpm:5.6

# Setup tg user and sudo access
ARG USER_ID=1001
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    sudo
RUN groupadd nopwsudo \
    && echo "%nopwsudo      ALL=(ALL:ALL) NOPASSWD: ALL" > /etc/sudoers.d/nopwsudo \
    && useradd tg -u ${USER_ID} -G nopwsudo,sudo,adm -m

VOLUME /app

USER tg
WORKDIR /app
