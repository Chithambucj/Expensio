pipeline {
    agent any

    tools {
        jdk 'JDK21'
        maven 'Maven'
    }

    environment {
        DOCKERHUB_USERNAME = 'chithambu'

        BACKEND_IMAGE = 'chithambu/expense-backend'
        FRONTEND_IMAGE = 'chithambu/expense-frontend'

        K8S_NAMESPACE = 'dev'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

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

        stage('SonarQube Scan') {
            steps {
                dir('backend') {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                        mvn sonar:sonar \
                        -Dsonar.projectKey=expense-tracker \
                        -Dsonar.projectName="Expense Tracker"
                        '''
                    }
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh """
                    docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                    docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh """
                    docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                    docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                    """
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
                sh """
                docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                docker push ${BACKEND_IMAGE}:latest
                """
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh """
                docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                docker push ${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy To Kubernetes') {
            steps {
                sh """
                kubectl set image deployment/expense-backend \
                expense-backend=${BACKEND_IMAGE}:${BUILD_NUMBER} \
                -n ${K8S_NAMESPACE}

                kubectl set image deployment/expense-frontend \
                expense-frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                -n ${K8S_NAMESPACE}

                kubectl rollout status deployment/expense-backend -n ${K8S_NAMESPACE}
                kubectl rollout status deployment/expense-frontend -n ${K8S_NAMESPACE}
                """
            }
        }
    }

    post {

        success {
            echo "======================================"
            echo "BUILD SUCCESSFUL"
            echo "Build Number : ${BUILD_NUMBER}"
            echo "Backend Image : ${BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "Frontend Image : ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo "Kubernetes Namespace : ${K8S_NAMESPACE}"
            echo "======================================"
        }

        failure {
            echo "======================================"
            echo "PIPELINE FAILED"
            echo "Please check Jenkins Console Output"
            echo "======================================"
        }

        always {
            sh 'docker logout || true'
        }
    }
}
