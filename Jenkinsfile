pipeline {
agent any

```
stages {

    stage('Checkout') {
        steps {
            echo 'Source Code Checkout Completed'
        }
    }

    stage('Build Frontend') {
        steps {
            dir('frontend') {
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }

    stage('Build Backend') {
        steps {
            dir('backend') {
                sh 'mvn clean package'
            }
        }
    }
}

post {
    success {
        echo 'Pipeline Build Successful'
    }

    failure {
        echo 'Pipeline Build Failed'
    }
}
```

}
