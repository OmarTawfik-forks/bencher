#!/bin/bash

cargo install --debug --path . --locked

echo "Waiting for API server"
while ! nc -z localhost 61016; do
  sleep 1
done

cargo test-api seed

echo "Bencher development environment is ready!"
echo "Bencher UI Server: http://localhost:3000"
echo "Bencher API Server: http://localhost:61016"
echo ""
echo "If you want to make changes to the UI server or API server, exit this process (Ctl + C)"
echo "To restart the UI server run: cd ./services/console && npm run dev"
echo "To restart the API server run: cd ./services/api && cargo run"
