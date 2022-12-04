use thiserror::Error;

pub(crate) const REGEX_ERROR: &str = "Failed to compile regex.";

#[derive(Debug, Error)]
pub enum ValidError {
    #[error("Failed to validate user name: {0}")]
    UserName(String),
    #[error("Failed to validate slug: {0}")]
    Slug(String),
    #[error("Failed to validate email: {0}")]
    Email(String),
    #[error("Failed to validate JWT (JSON Web Token): {0}")]
    Jwt(String),
    #[error("Failed to validate branch name: {0}")]
    BranchName(String),
    #[error("Failed to validate non-empty string: {0}")]
    NonEmpty(String),
    #[error("Failed to validate URL: {0}")]
    Url(String),
}
