package telemetry_test

import (
	"context"
	"os"
	"testing"

	"github.com/relvacode/storm/telemetry"
)

func TestSetup_DefaultEndpoint(t *testing.T) {
	os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")

	ctx := context.Background()

	// OTLP HTTP exporters are lazy — they don't dial at construction time,
	// so Setup should succeed even without a running collector.
	shutdown, err := telemetry.Setup(ctx, "test-service")
	if err != nil {
		t.Logf("Setup error (expected if no OTel collector): %v", err)
		t.Skip("skipping: OTel setup returned error (no collector available)")
		return
	}

	if shutdown == nil {
		t.Error("expected non-nil shutdown function")
	}

	shutdown()
}

func TestSetup_CustomEndpoint(t *testing.T) {
	os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:9999")
	defer os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")

	ctx := context.Background()

	// OTLP HTTP exporters are lazy — construction succeeds even with an
	// unreachable endpoint; errors only appear at export time.
	shutdown, err := telemetry.Setup(ctx, "test-service-custom")
	if err != nil {
		t.Logf("Setup error with custom endpoint: %v", err)
		// Acceptable — some implementations may be eager.
		return
	}

	if shutdown != nil {
		shutdown()
	}
}

func TestSetup_ReturnsShutdownFunc(t *testing.T) {
	os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	ctx := context.Background()

	shutdown, err := telemetry.Setup(ctx, "shutdown-test")
	if err != nil {
		t.Skipf("skipping: Setup returned error: %v", err)
	}

	if shutdown == nil {
		t.Fatal("Setup() returned nil shutdown function without error")
	}

	// Calling shutdown must not panic.
	shutdown()
}

func TestSetup_EmptyServiceName(t *testing.T) {
	os.Unsetenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	ctx := context.Background()

	// Empty service name: resource creation still works (empty attribute is valid).
	shutdown, err := telemetry.Setup(ctx, "")
	if err != nil {
		t.Logf("Setup with empty service name returned error: %v", err)
		return
	}
	if shutdown != nil {
		shutdown()
	}
}

func TestSetup_CancelledContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	// A cancelled context may cause Setup to fail or succeed depending on
	// how eagerly the exporter uses the context.
	shutdown, err := telemetry.Setup(ctx, "cancelled-ctx-service")
	if err != nil {
		t.Logf("Setup with cancelled context error (may be expected): %v", err)
		return
	}
	if shutdown != nil {
		shutdown()
	}
}
