package telemetry

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

// Metrics holds all business metric instruments for the storm service.
// NewMetrics must be called after Setup() so the global MeterProvider is initialised.
type Metrics struct {
	TorrentOps     metric.Int64Counter
	DelugeAPICalls metric.Int64Counter
	ActiveTorrents metric.Int64UpDownCounter
	DownloadBytes  metric.Int64Counter
}

// NewMetrics creates and registers all metric instruments.
func NewMetrics() (*Metrics, error) {
	m := otel.Meter("storm")

	torrentOps, err := m.Int64Counter("torrent_operations_total",
		metric.WithDescription("Torrent add/remove/complete operations"))
	if err != nil {
		return nil, err
	}

	delugeAPICalls, err := m.Int64Counter("deluge_api_calls_total",
		metric.WithDescription("Deluge RPC API calls"))
	if err != nil {
		return nil, err
	}

	activeTorrents, err := m.Int64UpDownCounter("active_torrents",
		metric.WithDescription("Currently active torrents in Deluge"))
	if err != nil {
		return nil, err
	}

	downloadBytes, err := m.Int64Counter("download_bytes_total",
		metric.WithDescription("Total bytes downloaded"))
	if err != nil {
		return nil, err
	}

	return &Metrics{
		TorrentOps:     torrentOps,
		DelugeAPICalls: delugeAPICalls,
		ActiveTorrents: activeTorrents,
		DownloadBytes:  downloadBytes,
	}, nil
}
