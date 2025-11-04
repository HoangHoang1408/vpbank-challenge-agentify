docker run -d --restart unless-stopped \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -v ~/pgdata:/var/lib/postgresql/data \
  postgres:latest