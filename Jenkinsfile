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
                    curl.exe -X POST ^
                      -F "project_token=%CODACY_PROJECT_TOKEN_ID%" ^
                      -F "report=@coverage\\lcov.info" ^
                      https://coverage.codacy.com/report/public || ^
                    echo Coverage uploaded to Codacy
                    '''
                }
            }
        }
    }
 }

}
