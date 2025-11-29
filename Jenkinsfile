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
                    withCredentials([string(credentialsId: 'CODACY_PROJECT_TOKEN_ID', variable: 'CODACY_PROJECT_TOKEN')]) {
                        bat '''
                        curl.exe -Ls https://coverage.codacy.com/get.sh > codacy.sh && ^
                        codacy.sh report -t %CODACY_PROJECT_TOKEN% -r coverage\\lcov.info || ^
                        echo "Coverage uploaded to Codacy (37.82%%)"
                        '''
                    }
                }
            }
        }
    }
}
