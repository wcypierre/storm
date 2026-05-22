package telemetry

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

// Metrics holds all business metric instruments for the storm service.
// NewMetrics must be called after Setup() so the global MeterProvider is initialised.
type Metrics struct {
	// Business
	TorrentOps     metric.Int64Counter
	DelugeAPICalls metric.Int64Counter
	ActiveTorrents metric.Int64UpDownCounter
	DownloadBytes  metric.Int64Counter

	// Standard four (every backend/worker)
	RequestDuration metric.Float64Histogram
	AppErrors       metric.Int64Counter
	InflightOps     metric.Int64UpDownCounter

	// External-call (Deluge RPC)
	ExternalCalls        metric.Int64Counter
	ExternalCallDuration metric.Float64Histogram
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

	requestDuration, err := m.Float64Histogram("http_server_request_duration_seconds",
		metric.WithDescription("HTTP server request duration"),
		metric.WithUnit("s"))
	if err != nil {
		return nil, err
	}

	appErrors, err := m.Int64Counter("app_errors_total",
		metric.WithDescription("Application-level errors observed during request handling or background work"))
	if err != nil {
		return nil, err
	}

	inflightOps, err := m.Int64UpDownCounter("app_inflight_operations",
		metric.WithDescription("Operations currently in-flight"))
	if err != nil {
		return nil, err
	}

	externalCalls, err := m.Int64Counter("external_calls_total",
		metric.WithDescription("Outbound calls to external systems (e.g. Deluge RPC)"))
	if err != nil {
		return nil, err
	}

	externalCallDuration, err := m.Float64Histogram("external_call_duration_seconds",
		metric.WithDescription("Outbound external-call duration"),
		metric.WithUnit("s"))
	if err != nil {
		return nil, err
	}

	return &Metrics{
		TorrentOps:           torrentOps,
		DelugeAPICalls:       delugeAPICalls,
		ActiveTorrents:       activeTorrents,
		DownloadBytes:        downloadBytes,
		RequestDuration:      requestDuration,
		AppErrors:            appErrors,
		InflightOps:          inflightOps,
		ExternalCalls:        externalCalls,
		ExternalCallDuration: externalCallDuration,
	}, nil
}
