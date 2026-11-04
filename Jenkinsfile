pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install PHP dependencies') {
            steps {
                sh 'composer install --no-interaction --prefer-dist --no-progress'
            }
        }

        stage('Install frontend dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'APP_KEY=base64:$(php -r \'echo base64_encode(random_bytes(32));\') composer test'
            }
        }
    }

    post {
        success {
            echo 'Build and tests completed successfully.'
        }

        failure {
            echo 'Build or tests failed.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
