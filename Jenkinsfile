pipeline {
    agent any

    stages {
        stage('Install') {
            steps {
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }
    }

    post {
        always {
            script {
                if (fileExists('coverage/lcov.info')) {
                    withCredentials([string(credentialsId: 'CODACY_PROJECT_TOKEN_ID', variable: 'CODACY_PROJECT_TOKEN_ID')]) {
                        bat '''
                        bash -lc "curl -Ls https://coverage.codacy.com/get.sh | bash -s -- report -r coverage/lcov.info"
                        '''
                    }
                } else {
                    echo 'No coverage report found'
                }
            }
        }
    }
}
