FROM alpine

RUN apk add brotli nginx nginx-mod-http-brotli

CMD ["nginx", "-g", "daemon off;"]
