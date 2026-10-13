pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'bug-tracker'
        APP_URL = 'http://localhost:8000'

        DB_ROOT_PASSWORD = credentials('bug-tracker-db-root-password')
        DB_PASSWORD = credentials('bug-tracker-db-password')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Docker') {
            steps {
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Prepare Environment') {
            steps {
                sh '''
                    set -eu

                    if [ ! -f .env.example ]; then
                        echo "ERROR: .env.example file not found!"
                        exit 1
                    fi

                    cp .env.example .env

                    # Remove existing password entries to avoid duplicates.
                    sed -i '/^DB_ROOT_PASSWORD=/d' .env
                    sed -i '/^DB_PASSWORD=/d' .env

                    # Inject credentials supplied by Jenkins.
                    printf '\\nDB_ROOT_PASSWORD=%s\\n' "$DB_ROOT_PASSWORD" >> .env
                    printf 'DB_PASSWORD=%s\\n' "$DB_PASSWORD" >> .env

                    echo ".env file prepared successfully."
                '''
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh 'docker compose config --quiet'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker compose build app'
            }
        }

        stage('Start Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Wait for Database') {
            steps {
                sh '''
                    set -eu

                    for i in $(seq 1 60); do
                        if docker compose exec -T db \
                            sh -c 'mysqladmin ping -h 127.0.0.1 --silent' \
                            >/dev/null 2>&1; then
                            echo "MySQL is ready."
                            exit 0
                        fi

                        echo "Waiting for MySQL... ($i/60)"
                        sleep 2
                    done

                    echo "ERROR: MySQL did not become ready."
                    docker compose logs --tail=100 db
                    exit 1
                '''
            }
        }

        stage('Run Laravel Migrations') {
            steps {
                sh 'docker compose exec -T app php artisan migrate --force'
            }
        }

        stage('Verify Application') {
            steps {
                sh '''
                    set -eu

                    docker compose ps
                    docker compose exec -T app php artisan --version

                    # Check that Apache is serving the application.
                    curl --fail --silent --show-error \
                        --output /dev/null \
                        --write-out 'HTTP status: %{http_code}\\n' \
                        "$APP_URL"
                '''
            }
        }
    }

    post {
        success {
            echo 'Bug Tracker Docker deployment completed successfully.'
            echo 'Application URL: http://localhost:8000'
        }

        failure {
            echo 'Bug Tracker pipeline failed. Checking container status and logs.'

            sh 'docker compose ps || true'
            sh 'docker compose logs --tail=100 || true'
        }
    }
}
