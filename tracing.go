package storm

import (
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

const (
	genericSpanErrorStatus = "operation failed"
	redactedAttrValue      = "[redacted]"
)

func redactSensitiveAttr(v string) string {
	if v == "" {
		return ""
	}
	return redactedAttrValue
}

// endSpan ends a span, recording *errPtr (if non-nil) as an exception
// and setting Error status. Designed for use with a named-error return:
//
//	func httpDoThing(...) (ret interface{}, err error) {
//	    _, span := tracer.Start(r.Context(), "storm.thing.do")
//	    defer endSpan(span, &err)
//	    ...
//	}
func endSpan(span trace.Span, errPtr *error) {
	if errPtr != nil && *errPtr != nil {
		span.RecordError(*errPtr)
		span.SetStatus(codes.Error, genericSpanErrorStatus)
	}
	span.End()
}
