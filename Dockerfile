# syntax=docker/dockerfile:1

FROM --platform=${BUILDPLATFORM} golang:1.26-alpine AS compiler
ARG TARGETOS
ARG TARGETARCH
ENV CGO_ENABLED=0

WORKDIR /go/src/storm

RUN apk add --no-cache ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w" -o /out/storm ./cmd/storm


FROM scratch
COPY --from=compiler /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=compiler /out/storm /usr/bin/storm

ENTRYPOINT ["/usr/bin/storm"]
