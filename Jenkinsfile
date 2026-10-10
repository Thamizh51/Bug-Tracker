pipeline {
    agent any

    environment {
        COMPOSER_ALLOW_SUPERUSER = '1'
    }

    stages {
        stage('Check PHP and Composer') {
            steps {
                sh 'php -v'
                sh 'composer --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'composer install --no-interaction --prefer-dist --optimize-autoloader'
            }
        }

        stage('Prepare Laravel') {
            steps {
                sh 'cp .env.example .env'
                sh 'php artisan key:generate'
            }
        }

        stage('Build Laravel Cache') {
            steps {
                sh 'php artisan config:cache'
                sh 'php artisan route:cache'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'php artisan test'
            }
        }

        stage('Start Application') {
            steps {
                // Optional: Stop any existing server instance running on port 8000
                sh 'fuser -k 8000/tcp || true'
                
                // Start Laravel server in the background
                sh 'nohup php artisan serve --host=0.0.0.0 --port=8000 > storage/logs/server.log 2>&1 &'
                echo "Laravel application started on port 8000!"
            }
        }
    }

    post {
        success {
            echo "Bug Tracker pipeline completed and app is running!"
        }
        failure {
            echo "Bug Tracker pipeline failed."
        }
    }
}