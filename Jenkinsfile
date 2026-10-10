pipeline {
    agent any

    environment {
        // Allows Composer to run as root if your Jenkins agent requires it
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
                // Copy environment files for application and testing
                sh 'cp .env.example .env'
                sh 'cp .env.example .env.testing'
                
                // Generate application key for both
                sh 'php artisan key:generate'
                sh 'php artisan key:generate --env=testing'
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
                script {
                    try {
                        // Run database migrations for the testing environment (connects to MySQL)
                        sh 'php artisan migrate:fresh --env=testing --force'
                        
                        // Execute tests
                        sh 'php artisan test'
                    } catch (Exception e) {
                        echo "Tests failed! Printing storage/logs/laravel.log for debugging:"
                        sh 'cat storage/logs/laravel.log || true'
                        error("Pipeline failed during testing.")
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Bug Tracker pipeline completed successfully!"
        }
        failure {
            echo "Bug Tracker pipeline failed. Check the console output above for the exact error."
        }
    }
}