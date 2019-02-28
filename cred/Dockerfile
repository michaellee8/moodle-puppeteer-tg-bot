FROM golang:1.12-alpine AS builder
RUN apk add --no-cache git
WORKDIR /cred

# Caching layer
COPY ./go.mod ./go.sum ./
RUN go mod download


COPY . .
RUN CGO_ENABLED=0 go build -installsuffix 'static' -o /app .

FROM scratch AS final
COPY --from=builder /app /app

ENTRYPOINT ["/app"]

