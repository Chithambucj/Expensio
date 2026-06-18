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
            kubectl set image deployment/expense-backend expense-backend=${BACKEND_IMAGE}:${BUILD_NUMBER}
            kubectl set image deployment/expense-frontend expense-frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER}

            kubectl rollout status deployment/expense-backend
            kubectl rollout status deployment/expense-frontend
            """
         }
     }
  
}

post {

    success {
        echo "Build #${BUILD_NUMBER} completed successfully"
        echo "Docker images pushed to Docker Hub"
        echo "Kubernetes deployment updated"
    }

    failure {
        echo "Pipeline Failed"
    }

    always {
        sh 'docker logout || true'

    }
}


}
