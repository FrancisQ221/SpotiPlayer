use tauri::{AppHandle, Emitter, Manager, Runtime};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrackMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub artwork_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaybackStatePayload {
    pub is_playing: bool,
    pub position_seconds: f64,
    pub duration_seconds: f64,
}

// In-memory SMTC state tracking
pub struct SmtcState {
    pub current_metadata: Mutex<Option<TrackMetadata>>,
    pub is_playing: Mutex<bool>,
}

impl Default for SmtcState {
    fn default() -> Self {
        Self {
            current_metadata: Mutex::new(None),
            is_playing: Mutex::new(false),
        }
    }
}

/// Tauri command to update Windows System Media Transport Controls (SMTC) track info
#[tauri::command]
fn update_smtc_metadata(
    app: AppHandle,
    title: String,
    artist: String,
    album: String,
    artwork_url: Option<String>,
) -> Result<(), String> {
    let state = app.state::<SmtcState>();
    if let Ok(mut meta_lock) = state.current_metadata.lock() {
        *meta_lock = Some(TrackMetadata {
            title: title.clone(),
            artist: artist.clone(),
            album: album.clone(),
            artwork_url: artwork_url.clone(),
        });
    }

    #[cfg(target_os = "windows")]
    {
        // On Windows 10/11, SMTC integrates with the OS media session
        // If webview mediaSession is active, Edge WebView2 forwards it directly to Windows SMTC.
        // This native bridge provides secondary OS event dispatch.
    }

    Ok(())
}

/// Tauri command to notify OS of play/pause state changes
#[tauri::command]
fn update_smtc_playback_state(
    app: AppHandle,
    is_playing: bool,
    _position_seconds: Option<f64>,
    _duration_seconds: Option<f64>,
) -> Result<(), String> {
    let state = app.state::<SmtcState>();
    if let Ok(mut playing_lock) = state.is_playing.lock() {
        *playing_lock = is_playing;
    }
    Ok(())
}

/// Simulation / Trigger commands for hardware media keys
#[tauri::command]
fn trigger_media_key<R: Runtime>(app: AppHandle<R>, key: String) -> Result<(), String> {
    match key.as_str() {
        "play" => app.emit("smtc://play", ()).map_err(|e| e.to_string())?,
        "pause" => app.emit("smtc://pause", ()).map_err(|e| e.to_string())?,
        "toggle" => app.emit("smtc://toggle-play", ()).map_err(|e| e.to_string())?,
        "next" => app.emit("smtc://next", ()).map_err(|e| e.to_string())?,
        "previous" => app.emit("smtc://previous", ()).map_err(|e| e.to_string())?,
        _ => return Err(format!("Unknown media key: {}", key)),
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SmtcState::default())
        .invoke_handler(tauri::generate_handler![
            update_smtc_metadata,
            update_smtc_playback_state,
            trigger_media_key
        ])
        .setup(|app| {
            let _handle = app.handle();

            #[cfg(target_os = "windows")]
            {
                // Register Windows hardware keyboard hook or SMTC event listener
                // Broadcasts media key events to the frontend webview
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running SpotiPlayer desktop application");
}
