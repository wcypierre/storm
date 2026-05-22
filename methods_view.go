package storm

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	deluge "github.com/gdm85/go-libdeluge"
	"go.opentelemetry.io/otel/attribute"
	"net/http"
	"sort"
)

type ViewTorrent struct {
	Hash  string
	Label string
	*deluge.TorrentStatus
}

type ViewUpdate struct {
	Torrents []*ViewTorrent
	Session  *deluge.SessionStatus
	DiskFree int64
}

type ViewUpdateResponse struct {
	ViewUpdate
	ETag string
}

func httpViewUpdate(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	ctx, span := tracer.Start(r.Context(), "storm.view.update")
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

	// 1. Torrent statuses
	_, statusSpan := tracer.Start(ctx, "storm.view.fetch_torrents")
	torrents, err := conn.TorrentsStatus(state, ids)
	endSpan(statusSpan, &err)
	if err != nil {
		return nil, err
	}

	var torrentHashes = make([]string, 0, len(torrents))
	for k := range torrents {
		torrentHashes = append(torrentHashes, k)
	}
	sort.Strings(torrentHashes)
	span.SetAttributes(attribute.Int("storm.view.torrent_count", len(torrentHashes)))

	// 2. Labels (best-effort; failures are tolerated)
	var torrentLabels = make(map[string]string)
	_, labelsSpan := tracer.Start(ctx, "storm.view.fetch_labels")
	plugin, labelErr := labelPluginClient(conn)
	if labelErr == nil {
		labels, e := plugin.GetTorrentsLabels(state, ids)
		if e == nil {
			torrentLabels = labels
		} else {
			labelsSpan.RecordError(e)
		}
	} else {
		labelsSpan.RecordError(labelErr)
	}
	labelsSpan.End()

	var responseTorrents = make([]*ViewTorrent, 0, len(torrents))
	for _, k := range torrentHashes {
		responseTorrents = append(responseTorrents, &ViewTorrent{
			Hash:          k,
			Label:         torrentLabels[k],
			TorrentStatus: torrents[k],
		})
	}

	// 3. Session status
	_, sessionSpan := tracer.Start(ctx, "storm.view.fetch_session")
	session, err := conn.GetSessionStatus()
	endSpan(sessionSpan, &err)
	if err != nil {
		return nil, err
	}

	// 4. Free disk space (best-effort; existing code ignored the error)
	_, diskSpan := tracer.Start(ctx, "storm.view.fetch_free_space")
	diskFree, diskErr := conn.GetFreeSpace(q.Get("path"))
	if diskErr != nil {
		diskSpan.RecordError(diskErr)
	}
	diskSpan.End()

	update := ViewUpdate{
		Torrents: responseTorrents,
		Session:  session,
		DiskFree: diskFree,
	}

	// ETag calculation
	var h = sha1.New()
	_ = json.NewEncoder(h).Encode(&update)

	responseETag := hex.EncodeToString(h.Sum(nil))

	if requestETag := r.Header.Get("ETag"); requestETag != "" && requestETag == responseETag {
		span.SetAttributes(attribute.Bool("storm.view.not_modified", true))
		return nil, &Error{
			Code:    http.StatusNotModified,
			Message: "View not modified since last request",
		}
	}

	return &ViewUpdateResponse{
		ViewUpdate: update,
		ETag:       responseETag,
	}, nil
}
