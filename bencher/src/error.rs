use thiserror::Error;

#[derive(Error, Debug)]
pub enum BencherError {
    #[error("No default shell command path for target family")]
    Shell,
    #[error("No default shell command flag for target family")]
    Flag,
    #[error("Failed I/O")]
    Io(#[from] std::io::Error),
    #[error("Failed to convert from UTF-8")]
    FromUtf8(#[from] std::string::FromUtf8Error),
    #[error("Failed git")]
    Git(#[from] git2::Error),
    #[error("Failed serde json")]
    Serde(#[from] serde_json::Error),
    #[error("Failed to parse URL")]
    Url(#[from] url::ParseError),
}
