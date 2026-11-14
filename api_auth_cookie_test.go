package storm

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"go.uber.org/zap"
)

func TestAuthenticateSetsSecureHttpOnlyCookie(t *testing.T) {
	api := &Api{
		apiKey:     "test-api-key",
		pathPrefix: "",
		log:        zap.NewNop(),
	}

	handler := api.httpMiddlewareAuthenticate(http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		rw.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	req.SetBasicAuth("storm", "test-api-key")
	rw := httptest.NewRecorder()
	handler.ServeHTTP(rw, req)

	cookies := rw.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("expected 1 auth cookie, got %d", len(cookies))
	}
	c := cookies[0]
	if c.Name != ApiAuthCookieName {
		t.Fatalf("unexpected cookie name %q", c.Name)
	}
	if !c.HttpOnly {
		t.Fatal("expected HttpOnly cookie")
	}
	if !c.Secure {
		t.Fatal("expected Secure cookie")
	}
	if c.SameSite != http.SameSiteStrictMode {
		t.Fatalf("expected SameSiteStrict, got %v", c.SameSite)
	}
}
