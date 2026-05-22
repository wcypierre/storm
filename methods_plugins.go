package storm

import (
	deluge "github.com/gdm85/go-libdeluge"
	"github.com/gorilla/mux"
	"go.opentelemetry.io/otel/attribute"
	"net/http"
)

// httpGetPlugins gets all the currently enabled plugins
func httpGetPlugins(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.plugin.list_enabled")
	defer endSpan(span, &err)

	plugins, err := conn.GetEnabledPlugins()
	if err == nil {
		span.SetAttributes(attribute.Int("storm.plugin.count", len(plugins)))
	}
	return plugins, err
}

func httpEnablePlugin(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.plugin.enable")
	defer endSpan(span, &err)

	id := mux.Vars(r)["id"]
	span.SetAttributes(attribute.String("storm.plugin.name", id))

	err = conn.EnablePlugin(id)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func httpDisablePlugin(conn deluge.DelugeClient, r *http.Request) (ret interface{}, err error) {
	_, span := tracer.Start(r.Context(), "storm.plugin.disable")
	defer endSpan(span, &err)

	id := mux.Vars(r)["id"]
	span.SetAttributes(attribute.String("storm.plugin.name", id))

	err = conn.DisablePlugin(id)
	if err != nil {
		return nil, err
	}

	return nil, nil
}
