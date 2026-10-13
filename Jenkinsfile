pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'bug-tracker'
        APP_URL = 'http://localhost:8000'
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

        stage('Wait for Containers') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if docker compose ps --status running --services | grep -qx db; then
                            echo "Database container is running."
                            break
                        fi

                        if [ "$i" -eq 30 ]; then
                            echo "Database container did not start."
                            docker compose logs db
                            exit 1
                        fi

                        sleep 2
                    done
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
                    docker compose ps
                    docker compose exec -T app php artisan --version
                    docker compose logs --tail=50 app
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
            echo 'Bug Tracker pipeline failed. Checking Docker logs...'
            sh 'docker compose ps || true'
            sh 'docker compose logs --tail=100 || true'
        }
    }
}
