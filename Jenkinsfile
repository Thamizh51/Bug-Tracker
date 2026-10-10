pipeline {
    agent any

    environment {
        // Allows Composer to run as root if your Jenkins agent requires it
        COMPOSER_ALLOW_SUPERUSER = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                // Uses the credentials configured in Jenkins to authenticate with GitHub
                git branch: 'main', 
                    credentialsId: 'github-token', 
                    url: 'https://github.com/your-username/your-bug-tracker-repo.git'
            }
        }

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
                // Copy environment file and generate application key
                sh 'cp .env.example .env'
                sh 'php artisan key:generate'
            }
        }

        stage('Run Tests') {
            steps {
                // Run your unit/feature tests
                sh 'php artisan test'
            }
        }

        stage('Build Laravel Cache') {
            steps {
                sh 'php artisan config:cache'
                sh 'php artisan route:cache'
                sh 'php artisan view:cache'
            }
        }
    }

    post {
        success {
            echo "Bug Tracker pipeline completed successfully!"
        }
        failure {
            echo "Bug Tracker pipeline failed. Check the console output."
        }
    }
}