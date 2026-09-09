from app.models.user import User
from app.models.wallet import Wallet
from app.core.security import verify_password


def test_register_user(client, db):
    response = client.post(
        "/auth/register",
        json={
            "username": "shahroz",
            "email": "shahroz@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "shahroz"
    assert data["email"] == "shahroz@example.com"
    assert "id" in data

    user = (
        db.query(User)
        .filter(User.email == "shahroz@example.com")
        .first()
    )

    assert user is not None

    # Password must not be stored as plain text.
    assert user.hashed_password != "password123"
    assert verify_password("password123", user.hashed_password)

    wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user.id)
        .first()
    )

    assert wallet is not None
    assert wallet.balance == 10000000


def test_register_duplicate_email(client):
    user1 = {
        "username": "user1",
        "email": "same@example.com",
        "password": "password123",
    }

    user2 = {
        "username": "user2",
        "email": "same@example.com",
        "password": "password456",
    }

    first_response = client.post("/auth/register", json=user1)
    second_response = client.post("/auth/register", json=user2)

    assert first_response.status_code == 200
    assert second_response.status_code == 400

    assert second_response.json()["detail"] == "Email already registered"


def test_register_duplicate_username(client):
    user1 = {
        "username": "sameuser",
        "email": "user1@example.com",
        "password": "password123",
    }

    user2 = {
        "username": "sameuser",
        "email": "user2@example.com",
        "password": "password456",
    }

    first_response = client.post("/auth/register", json=user1)
    second_response = client.post("/auth/register", json=user2)

    assert first_response.status_code == 200
    assert second_response.status_code == 400

    assert second_response.json()["detail"] == "Username already taken"


def test_login_success(client):
    client.post(
        "/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["access_token"]
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={
            "username": "wrongpassword",
            "email": "wrong@example.com",
            "password": "correctpassword",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "wrong@example.com",
            "password": "incorrectpassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_unknown_email(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "doesnotexist@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"