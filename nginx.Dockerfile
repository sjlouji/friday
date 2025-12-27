FROM nginx:alpine

ARG CONFIG_FILE=nginx/nginx.conf
COPY ${CONFIG_FILE} /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

