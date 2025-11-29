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

        stage('Codacy coverage') {
            steps {
                withCredentials([string(credentialsId: 'CODACY_PROJECT_TOKEN_ID', variable: 'CODACY_PROJECT_TOKEN_ID')]) {
                    bat '''
                    bash -lc "curl -Ls https://coverage.codacy.com/get.sh | bash -s -- report -r coverage/lcov.info"
                    '''
                }
            }
        }
    }
}
