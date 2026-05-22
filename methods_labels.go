package storm

import (
	"fmt"
	deluge "github.com/gdm85/go-libdeluge"
	"github.com/gorilla/mux"
	"go.opentelemetry.io/otel/attribute"
	"net/http"
)

// getClientV1 gets the underlying version 1 client from a DelugeClient interface.
func getClientV1(conn deluge.DelugeClient) (*deluge.Client, error) {
	switch client := conn.(type) {
	case *deluge.Client:
		return client, nil
	case *deluge.ClientV2:
		return &client.Client, nil
	default:
		return nil, fmt.Errorf("failed to obtain version 1 Deluge client")
	}
}

// labelPluginClient constructs an instance of a deluge.LabelPlugin client from the input DelugeClient connection.
func labelPluginClient(conn deluge.DelugeClient) (*deluge.LabelPlugin, error) {
	client, err := getClientV1(conn)
	if err != nil {
		return nil, err
	}

	return &deluge.LabelPlugin{
		Client: client,
	}, nil
}

// httpLabels gets the current labels
func httpLabels(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.label.list")
	defer endSpan(span, &err)

	plugin, err := labelPluginClient(conn)
	if err != nil {
		return nil, err
	}

	labels, err := plugin.GetLabels()
	if err == nil {
		span.SetAttributes(attribute.Int("storm.label.count", len(labels)))
	}
	return labels, err
}

// httpCreateLabel creates a new label
func httpCreateLabel(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.label.create")
	defer endSpan(span, &err)

	vars := mux.Vars(r)
	span.SetAttributes(attribute.String("storm.label.name", redactSensitiveAttr(vars["id"])))

	plugin, err := labelPluginClient(conn)
	if err != nil {
		return nil, err
	}

	err = plugin.AddLabel(vars["id"])
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// httpCreateLabel deletes an existing label
func httpDeleteLabel(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.label.delete")
	defer endSpan(span, &err)

	vars := mux.Vars(r)
	span.SetAttributes(attribute.String("storm.label.name", redactSensitiveAttr(vars["id"])))

	plugin, err := labelPluginClient(conn)
	if err != nil {
		return nil, err
	}

	err = plugin.RemoveLabel(vars["id"])
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// httpTorrentsLabels gets labels associated with all torrents matching the filter.
// 		?id[]	One or more torrent IDs
//		?state	Torrents of this state
//
//		Returns a mapping of torrent hash to torrent labels
func httpTorrentsLabels(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.label.list_for_torrents")
	defer endSpan(span, &err)

	ids, err := torrentIDs(r.URL.Query(), 0)
	if err != nil {
		return nil, err
	}

	state := (deluge.TorrentState)(r.URL.Query().Get("state"))
	span.SetAttributes(
		attribute.Int("storm.torrent.requested_count", len(ids)),
		attribute.String("storm.torrent.state_filter", string(state)),
	)

	plugin, err := labelPluginClient(conn)
	if err != nil {
		return nil, err
	}

	labels, err := plugin.GetTorrentsLabels(state, ids)
	if err != nil {
		return nil, err
	}

	return labels, nil
}

type SetTorrentLabelRequest struct {
	Label string
}

// httpSetTorrentLabel sets the label for a given torrent hash
func httpSetTorrentLabel(id string, conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.label.apply")
	defer endSpan(span, &err)

	var req SetTorrentLabelRequest

	err = Read(r, &req)
	if err != nil {
		return nil, err
	}
	span.SetAttributes(
		attribute.String("storm.torrent.hash", redactSensitiveAttr(id)),
		attribute.String("storm.label.name", redactSensitiveAttr(req.Label)),
	)

	plugin, err := labelPluginClient(conn)
	if err != nil {
		return nil, err
	}

	err = plugin.SetTorrentLabel(id, req.Label)
	if err != nil {
		return nil, err
	}

	return nil, nil
}
