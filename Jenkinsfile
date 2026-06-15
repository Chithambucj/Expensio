pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'chithambu'
        BACKEND_IMAGE = 'chithambu/expense-backend'
        FRONTEND_IMAGE = 'chithambu/expense-frontend'
    }

    stages {

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE}:latest .'
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE}:latest .'
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                sh 'docker push ${BACKEND_IMAGE}:latest'
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh 'docker push ${FRONTEND_IMAGE}:latest'
            }
        }

    }

    post {

        success {
            echo 'Docker Images Successfully Pushed To Docker Hub'
        }

        failure {
            echo 'Pipeline Failed'
        }

        always {
            sh 'docker logout || true'
        }
    }
}
