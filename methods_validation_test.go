package storm

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	deluge "github.com/gdm85/go-libdeluge"
)

// stubDelugeClient is a minimal DelugeClient that records calls to the three
// Add* methods and panics on anything unexpected in a validation test context.
type stubDelugeClient struct {
	// if non-nil, the Add* methods return this error
	addErr error
	// captured call info
	calledWith string
}

func (s *stubDelugeClient) Connect() error                       { return nil }
func (s *stubDelugeClient) Close() error                         { return nil }
func (s *stubDelugeClient) DaemonLogin() error                   { return nil }
func (s *stubDelugeClient) MethodsList() ([]string, error)       { return nil, nil }
func (s *stubDelugeClient) DaemonVersion() (string, error)       { return "", nil }
func (s *stubDelugeClient) GetFreeSpace(string) (int64, error)   { return 0, nil }
func (s *stubDelugeClient) GetLibtorrentVersion() (string, error) { return "", nil }
func (s *stubDelugeClient) AddTorrentMagnet(uri string, _ *deluge.Options) (string, error) {
	s.calledWith = uri
	if s.addErr != nil {
		return "", s.addErr
	}
	return "abc123", nil
}
func (s *stubDelugeClient) AddTorrentURL(u string, _ *deluge.Options) (string, error) {
	s.calledWith = u
	if s.addErr != nil {
		return "", s.addErr
	}
	return "abc123", nil
}
func (s *stubDelugeClient) AddTorrentFile(name, data string, _ *deluge.Options) (string, error) {
	s.calledWith = data
	if s.addErr != nil {
		return "", s.addErr
	}
	return "abc123", nil
}
func (s *stubDelugeClient) RemoveTorrents([]string, bool) ([]deluge.TorrentError, error) {
	return nil, nil
}
func (s *stubDelugeClient) RemoveTorrent(string, bool) (bool, error)          { return false, nil }
func (s *stubDelugeClient) PauseTorrents(...string) error                      { return nil }
func (s *stubDelugeClient) ResumeTorrents(...string) error                     { return nil }
func (s *stubDelugeClient) TorrentsStatus(deluge.TorrentState, []string) (map[string]*deluge.TorrentStatus, error) {
	return nil, nil
}
func (s *stubDelugeClient) TorrentStatus(string) (*deluge.TorrentStatus, error) { return nil, nil }
func (s *stubDelugeClient) MoveStorage([]string, string) error                  { return nil }
func (s *stubDelugeClient) SetTorrentTracker(string, string) error               { return nil }
func (s *stubDelugeClient) SetTorrentOptions(string, *deluge.Options) error      { return nil }
func (s *stubDelugeClient) SessionState() ([]string, error)                      { return nil, nil }
func (s *stubDelugeClient) ForceReannounce([]string) error                       { return nil }
func (s *stubDelugeClient) GetAvailablePlugins() ([]string, error)               { return nil, nil }
func (s *stubDelugeClient) GetEnabledPlugins() ([]string, error)                 { return nil, nil }
func (s *stubDelugeClient) EnablePlugin(string) error                            { return nil }
func (s *stubDelugeClient) DisablePlugin(string) error                           { return nil }
func (s *stubDelugeClient) TestListenPort() (bool, error)                        { return false, nil }
func (s *stubDelugeClient) GetListenPort() (uint16, error)                       { return 0, nil }
func (s *stubDelugeClient) GetSessionStatus() (*deluge.SessionStatus, error)     { return nil, nil }

// callAddTorrent is a helper that POSTs an AddTorrentRequest to httpAddTorrent
// and returns the HTTP status code and error message (if any).
func callAddTorrent(t *testing.T, client deluge.DelugeClient, req AddTorrentRequest) (int, string) {
	t.Helper()

	body, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}

	r := httptest.NewRequest(http.MethodPost, "/api/torrents", bytes.NewReader(body))
	r.Header.Set("Content-Type", "application/json")

	rw := httptest.NewRecorder()

	_, handlerErr := httpAddTorrent(client, r)
	if handlerErr != nil {
		// Simulate what Handle() does: write the error response so we can
		// inspect the status code via SendError.
		SendError(rw, handlerErr)
		code := rw.Code
		var resp struct{ Error string }
		_ = json.NewDecoder(rw.Body).Decode(&resp)
		return code, resp.Error
	}

	return http.StatusOK, ""
}

// ---- magnet validation tests ----

func TestAddTorrent_Magnet_Valid(t *testing.T) {
	stub := &stubDelugeClient{}
	code, msg := callAddTorrent(t, stub, AddTorrentRequest{
		Type: "magnet",
		URI:  "magnet:?xt=urn:btih:abc123&dn=test",
	})
	if code != http.StatusOK {
		t.Errorf("expected 200, got %d: %s", code, msg)
	}
	if stub.calledWith != "magnet:?xt=urn:btih:abc123&dn=test" {
		t.Errorf("Deluge not called with correct URI: %q", stub.calledWith)
	}
}

func TestAddTorrent_Magnet_Empty(t *testing.T) {
	stub := &stubDelugeClient{}
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "magnet", URI: ""})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty magnet URI, got %d", code)
	}
}

func TestAddTorrent_Magnet_WrongScheme(t *testing.T) {
	stub := &stubDelugeClient{}
	code, msg := callAddTorrent(t, stub, AddTorrentRequest{
		Type: "magnet",
		URI:  "http://example.com/not-a-magnet",
	})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for wrong scheme, got %d", code)
	}
	if !strings.Contains(msg, "magnet:?") {
		t.Errorf("expected error message to mention magnet:?, got: %q", msg)
	}
}

func TestAddTorrent_Magnet_TooLong(t *testing.T) {
	stub := &stubDelugeClient{}
	// Build a URI that starts correctly but exceeds maxMagnetURILen.
	long := "magnet:?" + strings.Repeat("x", maxMagnetURILen)
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "magnet", URI: long})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for oversized magnet URI, got %d", code)
	}
}

func TestAddTorrent_Magnet_AtLimit(t *testing.T) {
	stub := &stubDelugeClient{}
	// Exactly maxMagnetURILen bytes, starting with the required prefix.
	atLimit := "magnet:?" + strings.Repeat("x", maxMagnetURILen-len("magnet:?"))
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "magnet", URI: atLimit})
	if code != http.StatusOK {
		t.Errorf("expected 200 at exactly the limit (%d bytes), got %d", maxMagnetURILen, code)
	}
}

// ---- URL validation tests ----

func TestAddTorrent_URL_Valid(t *testing.T) {
	stub := &stubDelugeClient{}
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{
		Type: "url",
		URI:  "http://example.com/file.torrent",
	})
	if code != http.StatusOK {
		t.Errorf("expected 200, got %d", code)
	}
}

func TestAddTorrent_URL_Empty(t *testing.T) {
	stub := &stubDelugeClient{}
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "url", URI: ""})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty URL, got %d", code)
	}
}

func TestAddTorrent_URL_TooLong(t *testing.T) {
	stub := &stubDelugeClient{}
	long := "http://example.com/" + strings.Repeat("x", maxTorrentURLLen)
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "url", URI: long})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for oversized URL, got %d", code)
	}
}

// ---- file validation tests ----

func TestAddTorrent_File_Valid(t *testing.T) {
	stub := &stubDelugeClient{}
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{
		Type: "file",
		URI:  "test.torrent",
		Data: "dGVzdA==", // base64("test")
	})
	if code != http.StatusOK {
		t.Errorf("expected 200, got %d", code)
	}
}

func TestAddTorrent_File_EmptyData(t *testing.T) {
	stub := &stubDelugeClient{}
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "file", URI: "f.torrent", Data: ""})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty file data, got %d", code)
	}
}

func TestAddTorrent_File_TooLarge(t *testing.T) {
	stub := &stubDelugeClient{}
	// Create a Data string that exceeds the per-field encoded cap (maxTorrentFileSize)
	// but fits within the overall request body limit (MaxRequestSize = 10 MB).
	// This ensures the per-field 400 fires rather than the generic 413.
	oversized := strings.Repeat("A", maxTorrentFileSize+1)
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "file", URI: "f.torrent", Data: oversized})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for oversized file data, got %d", code)
	}
}

// ---- invalid type ----

func TestAddTorrent_InvalidType(t *testing.T) {
	stub := &stubDelugeClient{}
	code, _ := callAddTorrent(t, stub, AddTorrentRequest{Type: "ftp", URI: "ftp://bad"})
	if code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid type, got %d", code)
	}
}

// ---- constants sanity checks ----

func TestAddTorrent_Constants(t *testing.T) {
	if maxMagnetURILen <= 0 {
		t.Error("maxMagnetURILen must be positive")
	}
	if maxTorrentFileSize <= 0 {
		t.Error("maxTorrentFileSize must be positive")
	}
	if maxTorrentURLLen <= 0 {
		t.Error("maxTorrentURLLen must be positive")
	}
}
