FROM nginx:alpine

COPY ./build/ /usr/share/nginx/html/build/

COPY ./public/favicon.ico /usr/share/nginx/html/
COPY ./public/manifest.json /usr/share/nginx/html/
COPY ./public/robots.txt /usr/share/nginx/html/

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
