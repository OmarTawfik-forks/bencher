use std::str::FromStr;

use bencher_json::{Email, JsonSignup, JsonUser, ResourceId, Slug, UserName};
use diesel::{Insertable, QueryDsl, Queryable, RunQueryDsl, SqliteConnection};
use uuid::Uuid;

use crate::{
    diesel::ExpressionMethods,
    error::api_error,
    schema::{self, user as user_table},
    util::{resource_id::fn_resource_id, slug::unwrap_slug},
    ApiError,
};

pub mod auth;
pub mod token;

#[derive(Insertable)]
#[diesel(table_name = user_table)]
pub struct InsertUser {
    pub uuid: String,
    pub name: String,
    pub slug: String,
    pub email: String,
    pub admin: bool,
    pub locked: bool,
}

impl InsertUser {
    pub fn from_json(conn: &mut SqliteConnection, signup: JsonSignup) -> Result<Self, ApiError> {
        let JsonSignup {
            name, slug, email, ..
        } = signup;
        let slug = unwrap_slug!(conn, name.as_ref(), slug, user, QueryUser);
        Ok(Self {
            uuid: Uuid::new_v4().to_string(),
            name: name.into(),
            slug,
            email: email.into(),
            admin: false,
            locked: false,
        })
    }
}

fn_resource_id!(user);

#[derive(Queryable)]
pub struct QueryUser {
    pub id: i32,
    pub uuid: String,
    pub name: String,
    pub slug: String,
    pub email: String,
    pub admin: bool,
    pub locked: bool,
}

impl QueryUser {
    pub fn get_id(conn: &mut SqliteConnection, uuid: impl ToString) -> Result<i32, ApiError> {
        schema::user::table
            .filter(schema::user::uuid.eq(uuid.to_string()))
            .select(schema::user::id)
            .first(conn)
            .map_err(api_error!())
    }

    pub fn get_uuid(conn: &mut SqliteConnection, id: i32) -> Result<Uuid, ApiError> {
        let uuid: String = schema::user::table
            .filter(schema::user::id.eq(id))
            .select(schema::user::uuid)
            .first(conn)
            .map_err(api_error!())?;
        Uuid::from_str(&uuid).map_err(api_error!())
    }

    pub fn get_id_from_email(conn: &mut SqliteConnection, email: &str) -> Result<i32, ApiError> {
        schema::user::table
            .filter(schema::user::email.eq(email))
            .select(schema::user::id)
            .first(conn)
            .map_err(api_error!())
    }

    pub fn get_email_from_id(conn: &mut SqliteConnection, id: i32) -> Result<String, ApiError> {
        schema::user::table
            .filter(schema::user::id.eq(id))
            .select(schema::user::email)
            .first(conn)
            .map_err(api_error!())
    }

    pub fn from_resource_id(
        conn: &mut SqliteConnection,
        user: &ResourceId,
    ) -> Result<Self, ApiError> {
        schema::user::table
            .filter(resource_id(user)?)
            .first(conn)
            .map_err(api_error!())
    }

    pub fn into_json(self) -> Result<JsonUser, ApiError> {
        let Self {
            id: _,
            uuid,
            name,
            slug,
            email,
            admin,
            locked,
        } = self;
        Ok(JsonUser {
            uuid: Uuid::from_str(&uuid).map_err(api_error!())?,
            name: UserName::from_str(&name).map_err(api_error!())?,
            slug: Slug::from_str(&slug).map_err(api_error!())?,
            email: Email::from_str(&email).map_err(api_error!())?,
            admin,
            locked,
        })
    }
}
