FROM golang:1.12-alpine AS builder
RUN apk add --no-cache git ca-certificates
WORKDIR /bot

# Caching layer
COPY ./go.mod ./go.sum ./
RUN go mod download


COPY . .
RUN CGO_ENABLED=0 go build -installsuffix 'static' -o /app .

FROM alpine:latest AS final
RUN apk add --no-cache git ca-certificates
COPY --from=builder /app /app

ENTRYPOINT ["/app"]

