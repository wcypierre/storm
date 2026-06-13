package storm

import (
	"fmt"
	deluge "github.com/gdm85/go-libdeluge"
	"github.com/gorilla/mux"
	"go.opentelemetry.io/otel/attribute"
	"net/http"
	"net/url"
	"strings"
)

type DelugeMethod func(conn deluge.DelugeClient, r *http.Request) (interface{}, error)

const (
	// maxMagnetURILen is the maximum accepted byte length for a magnet URI.
	// Real-world magnets with many trackers rarely exceed 2 KB; 4 KB is a safe
	// upper bound that blocks obviously abusive inputs without rejecting valid ones.
	maxMagnetURILen = 4 * 1024

	// maxTorrentFileSize is the maximum accepted byte length for the base64-encoded
	// torrent file payload (field "Data" in AddTorrentRequest).
	// Real-world .torrent files are typically well under 1 MB; 8 MB of base64-encoded
	// data corresponds to roughly 6 MB decoded, which is generous.
	// This per-field cap is intentionally below MaxRequestSize (10 MB) so that
	// oversized file payloads are caught with a clear 400 rather than a generic 413.
	maxTorrentFileSize = 8 * 1024 * 1024

	// maxTorrentURLLen is the maximum accepted byte length for a URL passed to
	// Deluge to download a remote .torrent file.
	maxTorrentURLLen = 4 * 1024
)

func torrentIDs(q url.Values, min int) ([]string, error) {
	var ids = q["id"]
	if len(ids) < min {
		return nil, &Error{Code: http.StatusBadRequest, Message: fmt.Sprintf("At least %d torrent ID(s) are required", min)}
	}

	return ids, nil
}

func httpTorrentsStatus(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.list_status")
	defer endSpan(span, &err)

	var (
		q     = r.URL.Query()
		ids   = q["id"]
		state = deluge.TorrentState(q.Get("state"))
	)
	span.SetAttributes(
		attribute.Int("storm.torrent.requested_count", len(ids)),
		attribute.String("storm.torrent.state_filter", string(state)),
	)

	return conn.TorrentsStatus(state, ids)
}

func httpDeleteTorrents(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.delete_many")
	defer endSpan(span, &err)

	var (
		q       = r.URL.Query()
		rmFiles = q.Get("files") == "true"
	)

	ids, err := torrentIDs(q, 1)
	if err != nil {
		return nil, err
	}
	span.SetAttributes(
		attribute.Int("storm.torrent.count", len(ids)),
		attribute.Bool("storm.torrent.remove_files", rmFiles),
	)

	errors, err := conn.RemoveTorrents(ids, rmFiles)
	if err != nil {
		return nil, err
	}

	if len(errors) > 0 {
		span.SetAttributes(attribute.Int("storm.torrent.partial_failures", len(errors)))
		return &errors, nil
	}

	return nil, nil
}

func httpPauseTorrents(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.pause_many")
	defer endSpan(span, &err)

	ids, err := torrentIDs(r.URL.Query(), 1)
	if err != nil {
		return nil, err
	}
	span.SetAttributes(attribute.Int("storm.torrent.count", len(ids)))

	return nil, conn.PauseTorrents(ids...)
}

func httpResumeTorrents(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.resume_many")
	defer endSpan(span, &err)

	ids, err := torrentIDs(r.URL.Query(), 1)
	if err != nil {
		return nil, err
	}
	span.SetAttributes(attribute.Int("storm.torrent.count", len(ids)))

	return nil, conn.ResumeTorrents(ids...)
}

type AddTorrentRequest struct {
	Type string
	URI  string
	Data string

	Options deluge.Options
}

type AddTorrentResponse struct {
	ID string
}

func httpAddTorrent(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.add")
	defer endSpan(span, &err)

	var req AddTorrentRequest

	err = Read(r, &req)
	if err != nil {
		return nil, err
	}
	span.SetAttributes(attribute.String("storm.torrent.source_type", req.Type))

	var id string
	switch req.Type {
	case "url":
		if len(req.URI) == 0 {
			return nil, &Error{Code: http.StatusBadRequest, Message: "Torrent URL must not be empty"}
		}
		if len(req.URI) > maxTorrentURLLen {
			return nil, &Error{Code: http.StatusBadRequest, Message: fmt.Sprintf("Torrent URL exceeds maximum length of %d bytes", maxTorrentURLLen)}
		}
		id, err = conn.AddTorrentURL(req.URI, &req.Options)
	case "magnet":
		if len(req.URI) == 0 {
			return nil, &Error{Code: http.StatusBadRequest, Message: "Magnet URI must not be empty"}
		}
		if len(req.URI) > maxMagnetURILen {
			return nil, &Error{Code: http.StatusBadRequest, Message: fmt.Sprintf("Magnet URI exceeds maximum length of %d bytes", maxMagnetURILen)}
		}
		if !strings.HasPrefix(req.URI, "magnet:?") {
			return nil, &Error{Code: http.StatusBadRequest, Message: "Magnet URI must begin with \"magnet:?\""}
		}
		id, err = conn.AddTorrentMagnet(req.URI, &req.Options)
	case "file":
		if len(req.Data) == 0 {
			return nil, &Error{Code: http.StatusBadRequest, Message: "Torrent file data must not be empty"}
		}
		// req.Data is a base64-encoded .torrent; cap the encoded length directly.
		if len(req.Data) > maxTorrentFileSize {
			return nil, &Error{Code: http.StatusBadRequest, Message: fmt.Sprintf("Torrent file (base64-encoded) exceeds maximum size of %d bytes", maxTorrentFileSize)}
		}
		id, err = conn.AddTorrentFile(req.URI, req.Data, &req.Options)
	default:
		return nil, &Error{Code: http.StatusBadRequest, Message: "Torrent Type must be one of url, magnet or file"}
	}

	if err != nil {
		return nil, err
	}

	// The RPC returns an empty ID if the torrent could not be parsed or processed.
	if id == "" {
		return nil, &Error{Code: http.StatusUnprocessableEntity, Message: "Torrent file could not be read"}
	}

	span.SetAttributes(attribute.String("storm.torrent.hash", redactSensitiveAttr(id)))
	return AddTorrentResponse{ID: id}, nil
}

type TorrentMethod func(id string, conn deluge.DelugeClient, r *http.Request) (interface{}, error)

func TorrentHandler(f TorrentMethod) DelugeMethod {
	return func(conn deluge.DelugeClient, r *http.Request) (interface{}, error) {
		vars := mux.Vars(r)
		return f(vars["id"], conn, r)
	}
}

func httpTorrentStatus(id string, conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.status")
	defer endSpan(span, &err)
	span.SetAttributes(attribute.String("storm.torrent.hash", redactSensitiveAttr(id)))

	return conn.TorrentStatus(id)
}

func httpDeleteTorrent(id string, conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.delete")
	defer endSpan(span, &err)

	rmFiles := r.URL.Query().Get("files") == "true"
	span.SetAttributes(
		attribute.String("storm.torrent.hash", redactSensitiveAttr(id)),
		attribute.Bool("storm.torrent.remove_files", rmFiles),
	)

	ok, err := conn.RemoveTorrent(id, rmFiles)
	if err != nil {
		return nil, err
	}

	if !ok {
		return nil, &Error{Code: http.StatusNotFound, Message: "Requested torrent could not be deleted"}
	}

	return nil, nil
}

func httpPauseTorrent(id string, conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.pause")
	defer endSpan(span, &err)
	span.SetAttributes(attribute.String("storm.torrent.hash", redactSensitiveAttr(id)))

	return nil, conn.PauseTorrents(id)
}

func httpResumeTorrent(id string, conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.resume")
	defer endSpan(span, &err)
	span.SetAttributes(attribute.String("storm.torrent.hash", redactSensitiveAttr(id)))

	return nil, conn.ResumeTorrents(id)
}

func httpSetTorrentOptions(id string, conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.torrent.set_options")
	defer endSpan(span, &err)
	span.SetAttributes(attribute.String("storm.torrent.hash", redactSensitiveAttr(id)))

	var req deluge.Options

	err = Read(r, &req)
	if err != nil {
		return nil, err
	}

	return nil, conn.SetTorrentOptions(id, &req)
}

func httpGetSessionStatus(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.session.status")
	defer endSpan(span, &err)

	return conn.GetSessionStatus()
}

type GetFreeSpaceResponse struct {
	FreeBytes int64
}

func httpGetFreeSpace(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.disk.free_space")
	defer endSpan(span, &err)

	path := r.URL.Query().Get("path")

	freeBytes, err := conn.GetFreeSpace(path)
	if err != nil {
		return nil, err
	}
	span.SetAttributes(attribute.Int64("storm.disk.free_bytes", freeBytes))

	return GetFreeSpaceResponse{
		FreeBytes: freeBytes,
	}, nil
}
