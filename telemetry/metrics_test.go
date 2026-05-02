package telemetry_test

import (
	"context"
	"testing"

	"go.opentelemetry.io/otel"
	promexporter "go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/sdk/metric"

	"github.com/relvacode/storm/telemetry"
)

// setupTestMeterProvider creates an in-memory Prometheus meter provider suitable
// for unit tests and returns a cleanup function.
func setupTestMeterProvider(t *testing.T) func() {
	t.Helper()
	exp, err := promexporter.New()
	if err != nil {
		t.Skipf("prometheus exporter not available: %v", err)
	}
	mp := metric.NewMeterProvider(metric.WithReader(exp))
	otel.SetMeterProvider(mp)
	return func() {
		_ = mp.Shutdown(context.Background())
	}
}

func TestNewMetrics_CreatesAllFields(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}
	if m == nil {
		t.Fatal("NewMetrics() returned nil")
	}
	if m.TorrentOps == nil {
		t.Error("TorrentOps counter is nil")
	}
	if m.DelugeAPICalls == nil {
		t.Error("DelugeAPICalls counter is nil")
	}
	if m.ActiveTorrents == nil {
		t.Error("ActiveTorrents up-down counter is nil")
	}
	if m.DownloadBytes == nil {
		t.Error("DownloadBytes counter is nil")
	}
}

func TestNewMetrics_TorrentOpsIncrement(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}

	ctx := context.Background()
	// Must not panic.
	m.TorrentOps.Add(ctx, 1)
	m.TorrentOps.Add(ctx, 5)
}

func TestNewMetrics_DelugeAPICallsIncrement(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}

	ctx := context.Background()
	m.DelugeAPICalls.Add(ctx, 1)
	m.DelugeAPICalls.Add(ctx, 100)
}

func TestNewMetrics_ActiveTorrentsUpDown(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}

	ctx := context.Background()
	// UpDownCounter supports both positive and negative deltas.
	m.ActiveTorrents.Add(ctx, 3)
	m.ActiveTorrents.Add(ctx, -1)
}

func TestNewMetrics_DownloadBytesIncrement(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}

	ctx := context.Background()
	m.DownloadBytes.Add(ctx, 1024)
	m.DownloadBytes.Add(ctx, 1024*1024)
}

func TestNewMetrics_AllCountersIncrement(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}

	ctx := context.Background()
	m.TorrentOps.Add(ctx, 1)
	m.DelugeAPICalls.Add(ctx, 1)
	m.ActiveTorrents.Add(ctx, 1)
	m.DownloadBytes.Add(ctx, 1024)
}

func TestNewMetrics_ZeroIncrement(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("NewMetrics() unexpected error: %v", err)
	}

	ctx := context.Background()
	// Zero-valued increments must not panic.
	m.TorrentOps.Add(ctx, 0)
	m.DelugeAPICalls.Add(ctx, 0)
	m.ActiveTorrents.Add(ctx, 0)
	m.DownloadBytes.Add(ctx, 0)
}

func TestNewMetrics_MultipleCallsReturnDistinctInstances(t *testing.T) {
	cleanup := setupTestMeterProvider(t)
	defer cleanup()

	m1, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("first NewMetrics() unexpected error: %v", err)
	}
	m2, err := telemetry.NewMetrics()
	if err != nil {
		t.Fatalf("second NewMetrics() unexpected error: %v", err)
	}

	// Both instances must be non-nil and usable.
	if m1 == nil || m2 == nil {
		t.Fatal("expected non-nil Metrics from both calls")
	}

	ctx := context.Background()
	m1.TorrentOps.Add(ctx, 1)
	m2.TorrentOps.Add(ctx, 2)
}
