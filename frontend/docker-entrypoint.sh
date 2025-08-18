#!/bin/sh
envsubst '${PORT_MOVIE_HELPER_FRONTEND} ${DOMAIN} ${PORT_MOVIE_HELPER_BACKEND}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'